import { Client, Room } from 'colyseus.js'
import {
  IComputer,
  IOfficeState,
  IPlayer,
  IWhiteboard,
  IWorkspaceState,
  IRoomLayout,
  IFurnitureItem,
} from '../../../types/IOfficeState'
import { Message } from '../../../types/Messages'
import { IRoomData, RoomType } from '../../../types/Rooms'
import { ItemType } from '../../../types/Items'
import WebRTC from '../web/WebRTC'
import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { setSessionId, setPlayerNameMap, removePlayerNameMap, setLoggedIn } from '../stores/UserStore'
import {
  setLobbyJoined,
  setJoinedRoomData,
  setAvailableRooms,
  addAvailableRooms,
  removeAvailableRooms,
  setRoomJoined,
} from '../stores/RoomStore'
import {
  pushChatMessage,
  pushPlayerJoinedMessage,
  pushPlayerLeftMessage,
} from '../stores/ChatStore'
import { setWhiteboardUrls } from '../stores/WhiteboardStore'
import {
  setWorkspaceData,
  addOrUpdateRoom,
  removeRoom,
  addOrUpdateFurniture,
  removeFurniture,
  setErrorNotice,
} from '../stores/WorkspaceStore'

export default class Network {
  private client: Client
  private room?: Room<IOfficeState>
  private lobby!: Room
  webRTC?: WebRTC

  mySessionId!: string

  constructor() {
    const protocol = window.location.protocol.replace('http', 'ws')
    const endpoint =
      process.env.NODE_ENV === 'production'
        ? import.meta.env.VITE_SERVER_URL
        : `${protocol}//${window.location.hostname}:2567`
    this.client = new Client(endpoint || `${protocol}//${window.location.hostname}:2567`)
    this.joinLobbyRoom()
      .then(() => {
        store.dispatch(setLobbyJoined(true))
      })
      .catch((err) => {
        console.error('Error joining initial lobby:', err)
        setTimeout(() => {
          this.joinLobbyRoom()
            .then(() => store.dispatch(setLobbyJoined(true)))
            .catch((e) => console.error('Retry lobby failed:', e))
        }, 2000)
      })

    phaserEvents.on(Event.MY_PLAYER_NAME_CHANGE, this.updatePlayerName, this)
    phaserEvents.on(Event.MY_PLAYER_TEXTURE_CHANGE, this.updatePlayer, this)
    phaserEvents.on(Event.PLAYER_DISCONNECTED, this.playerStreamDisconnect, this)
  }

  /**
   * method to join Colyseus' built-in LobbyRoom, which automatically notifies
   * connected clients whenever rooms with "realtime listing" have updates
   */
  async joinLobbyRoom() {
    this.lobby = await this.client.joinOrCreate(RoomType.LOBBY)

    this.lobby.onMessage('rooms', (rooms) => {
      store.dispatch(setAvailableRooms(rooms))
    })

    this.lobby.onMessage('+', ([roomId, room]) => {
      store.dispatch(addAvailableRooms({ roomId, room }))
    })

    this.lobby.onMessage('-', (roomId) => {
      store.dispatch(removeAvailableRooms(roomId))
    })
  }

  // method to join the public lobby
  async joinOrCreatePublic() {
    this.room = await this.client.joinOrCreate(RoomType.PUBLIC)
    this.initialize()
  }

  // method to join a custom room
  async joinCustomById(roomId: string, password: string | null) {
    this.room = await this.client.joinById(roomId, { password })
    this.initialize()
  }

  // method to create a custom room
  async createCustom(roomData: IRoomData) {
    const { name, description, password } = roomData
    this.room = await this.client.create(RoomType.CUSTOM, {
      name,
      description,
      password,
      autoDispose: false, // Luôn lưu giữ phòng cho Manage Workspace
    })
    this.initialize()
  }

  // Rời khỏi phòng hiện tại và quay về sảnh chính (Lobby)
  async leaveRoom() {
    if (this.webRTC) {
      this.webRTC.destroy()
      this.webRTC = undefined
    }
    if (this.room) {
      try {
        await this.room.leave()
      } catch (err) {
        console.error('Error leaving room:', err)
      }
      this.room = undefined
    }
    // Tham gia lại Lobby Room để tiếp tục lắng nghe danh sách các phòng khả dụng
    try {
      await this.joinLobbyRoom()
      store.dispatch(setLobbyJoined(true))
    } catch (err) {
      console.error('Error rejoining lobby:', err)
    }
  }

  // set up all network listeners before the game starts
  initialize() {
    if (!this.room) return

    this.lobby.leave()
    this.mySessionId = this.room.sessionId
    store.dispatch(setSessionId(this.room.sessionId))
    this.webRTC = new WebRTC(this.mySessionId, this)

    // new instance added to the players MapSchema
    this.room.state.players.onAdd = (player: IPlayer, key: string) => {
      if (key === this.mySessionId) return

      // track changes on every child object inside the players MapSchema
      player.onChange = (changes) => {
        changes.forEach((change) => {
          const { field, value } = change
          phaserEvents.emit(Event.PLAYER_UPDATED, field, value, key)

          // when a new player finished setting up player name
          if (field === 'name' && value !== '') {
            phaserEvents.emit(Event.PLAYER_JOINED, player, key)
            store.dispatch(setPlayerNameMap({ id: key, name: value }))
            store.dispatch(pushPlayerJoinedMessage(value))
          }
        })
      }
    }

    // an instance removed from the players MapSchema
    this.room.state.players.onRemove = (player: IPlayer, key: string) => {
      phaserEvents.emit(Event.PLAYER_LEFT, key)
      this.webRTC?.deleteVideoStream(key)
      this.webRTC?.deleteOnCalledVideoStream(key)
      store.dispatch(pushPlayerLeftMessage(player.name))
      store.dispatch(removePlayerNameMap(key))
    }

    // new instance added to the computers MapSchema
    const setupComputerListeners = (computer: IComputer, key: string) => {
      // track existing users already connected to this computer
      computer.connectedUser.forEach((item) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.COMPUTER)
      })
      // track changes on every child object's connectedUser
      computer.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.COMPUTER)
      }
      computer.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_REMOVED, item, key, ItemType.COMPUTER)
      }
    }

    this.room.state.computers.onAdd = (computer: IComputer, key: string) => {
      setupComputerListeners(computer, key)
    }

    this.room.state.computers.forEach((computer: IComputer, key: string) => {
      setupComputerListeners(computer, key)
    })

    // new instance added to the whiteboards MapSchema
    const setupWhiteboardListeners = (whiteboard: IWhiteboard, key: string) => {
      store.dispatch(
        setWhiteboardUrls({
          whiteboardId: key,
          roomId: whiteboard.roomId,
        })
      )
      // track existing users already connected to this whiteboard
      whiteboard.connectedUser.forEach((item) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.WHITEBOARD)
      })
      // track changes on every child object's connectedUser
      whiteboard.connectedUser.onAdd = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_ADDED, item, key, ItemType.WHITEBOARD)
      }
      whiteboard.connectedUser.onRemove = (item, index) => {
        phaserEvents.emit(Event.ITEM_USER_REMOVED, item, key, ItemType.WHITEBOARD)
      }
    }

    this.room.state.whiteboards.onAdd = (whiteboard: IWhiteboard, key: string) => {
      setupWhiteboardListeners(whiteboard, key)
    }

    this.room.state.whiteboards.forEach((whiteboard: IWhiteboard, key: string) => {
      setupWhiteboardListeners(whiteboard, key)
    })

    // new instance added to the chatMessages ArraySchema
    this.room.state.chatMessages.onAdd = (item, index) => {
      store.dispatch(pushChatMessage(item))
    }

    // when the server sends room data
    this.room.onMessage(Message.SEND_ROOM_DATA, (content) => {
      store.dispatch(setJoinedRoomData(content))
    })

    // when a user sends a message
    this.room.onMessage(Message.ADD_CHAT_MESSAGE, ({ clientId, content }) => {
      phaserEvents.emit(Event.UPDATE_DIALOG_BUBBLE, clientId, content)
    })

    // when a peer disconnects with myPeer
    this.room.onMessage(Message.DISCONNECT_STREAM, (clientId: string) => {
      this.webRTC?.deleteOnCalledVideoStream(clientId)
    })

    // when a computer user stops sharing screen
    this.room.onMessage(Message.STOP_SCREEN_SHARE, (clientId: string) => {
      const computerState = store.getState().computer
      computerState.shareScreenManager?.onUserLeft(clientId)
    })

    // Mapmaker: Workspace Grid changes
    if (this.room.state.workspace) {
      store.dispatch(
        setWorkspaceData({
          sizeType: this.room.state.workspace.sizeType,
          width: this.room.state.workspace.width,
          height: this.room.state.workspace.height,
        })
      )
      this.room.state.workspace.onChange = () => {
        const ws = {
          sizeType: this.room!.state.workspace.sizeType,
          width: this.room!.state.workspace.width,
          height: this.room!.state.workspace.height,
        }
        store.dispatch(setWorkspaceData(ws))
        phaserEvents.emit(Event.WORKSPACE_UPDATED, ws)
      }
    }

    // Mapmaker: Tile Effect Rooms
    if (this.room.state.mapRooms) {
      this.room.state.mapRooms.onAdd = (room: IRoomLayout, key: string) => {
        const roomData = {
          id: key,
          roomType: room.roomType,
          name: room.name,
          gridX: room.gridX,
          gridY: room.gridY,
          width: room.width,
          height: room.height,
          doorX: room.doorX,
          doorY: room.doorY,
        }
        store.dispatch(addOrUpdateRoom(roomData))
        phaserEvents.emit(Event.ROOM_LAYOUT_ADDED, roomData)

        room.onChange = () => {
          const updated = {
            id: key,
            roomType: room.roomType,
            name: room.name,
            gridX: room.gridX,
            gridY: room.gridY,
            width: room.width,
            height: room.height,
            doorX: room.doorX,
            doorY: room.doorY,
          }
          store.dispatch(addOrUpdateRoom(updated))
          phaserEvents.emit(Event.ROOM_LAYOUT_ADDED, updated)
        }
      }

      this.room.state.mapRooms.onRemove = (room: IRoomLayout, key: string) => {
        store.dispatch(removeRoom(key))
        phaserEvents.emit(Event.ROOM_LAYOUT_REMOVED, key)
      }
    }

    // Mapmaker: Furniture Objects
    if (this.room.state.furniture) {
      this.room.state.furniture.onAdd = (item: IFurnitureItem, key: string) => {
        const furnData = {
          id: key,
          itemType: item.itemType,
          gridX: item.gridX,
          gridY: item.gridY,
          orientation: item.orientation,
          itemDirection: (item as any).itemDirection,
          tint: (item as any).tint,
        }
        store.dispatch(addOrUpdateFurniture(furnData))
        phaserEvents.emit(Event.FURNITURE_PLACED, furnData)

        item.onChange = () => {
          const updated = {
            id: key,
            itemType: item.itemType,
            gridX: item.gridX,
            gridY: item.gridY,
            orientation: item.orientation,
            itemDirection: (item as any).itemDirection,
            tint: (item as any).tint,
          }
          store.dispatch(addOrUpdateFurniture(updated))
          phaserEvents.emit(Event.FURNITURE_PLACED, updated)
        }
      }

      this.room.state.furniture.onRemove = (item: IFurnitureItem, key: string) => {
        store.dispatch(removeFurniture(key))
        phaserEvents.emit(Event.FURNITURE_REMOVED, key)
      }
    }

    // Design error notice
    this.room.onMessage(Message.DESIGN_ERROR, ({ message }: { message: string }) => {
      store.dispatch(setErrorNotice(message))
    })

    // Workspace deleted notification
    this.room.onMessage(Message.WORKSPACE_DELETED, async () => {
      await this.leaveRoom()
      store.dispatch(setRoomJoined(false))
      store.dispatch(setLoggedIn(false))
    })
  }

  // method to register event listener and call back function when a item user added
  onChatMessageAdded(callback: (playerId: string, content: string) => void, context?: any) {
    phaserEvents.on(Event.UPDATE_DIALOG_BUBBLE, callback, context)
  }

  // method to register event listener and call back function when a item user added
  onItemUserAdded(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_ADDED, callback, context)
  }

  // method to register event listener and call back function when a item user removed
  onItemUserRemoved(
    callback: (playerId: string, key: string, itemType: ItemType) => void,
    context?: any
  ) {
    phaserEvents.on(Event.ITEM_USER_REMOVED, callback, context)
  }

  // method to register event listener and call back function when a player joined
  onPlayerJoined(callback: (Player: IPlayer, key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_JOINED, callback, context)
  }

  // method to register event listener and call back function when a player left
  onPlayerLeft(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.PLAYER_LEFT, callback, context)
  }

  // method to register event listener and call back function when myPlayer is ready to connect
  onMyPlayerReady(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_READY, callback, context)
  }

  // method to register event listener and call back function when my video is connected
  onMyPlayerVideoConnected(callback: (key: string) => void, context?: any) {
    phaserEvents.on(Event.MY_PLAYER_VIDEO_CONNECTED, callback, context)
  }

  // method to register event listener and call back function when a player updated
  onPlayerUpdated(
    callback: (field: string, value: number | string, key: string) => void,
    context?: any
  ) {
    phaserEvents.on(Event.PLAYER_UPDATED, callback, context)
  }

  // method to send player updates to Colyseus server
  updatePlayer(currentX: number, currentY: number, currentAnim: string) {
    this.room?.send(Message.UPDATE_PLAYER, { x: currentX, y: currentY, anim: currentAnim })
  }

  // method to send player name to Colyseus server
  updatePlayerName(
    currentName: string,
    customization?: {
      skinColor: string
      hairColor: string
      outfitType: string
      outfitColor: string
    }
  ) {
    this.room?.send(Message.UPDATE_PLAYER_NAME, {
      name: currentName,
      ...(customization || {}),
    })
  }

  updatePlayerCustomization(customization: {
    skinColor?: string
    hairColor?: string
    outfitType?: string
    outfitColor?: string
  }) {
    this.room?.send(Message.UPDATE_PLAYER_CUSTOMIZATION, customization)
  }

  // method to send ready-to-connect signal to Colyseus server
  readyToConnect() {
    this.room?.send(Message.READY_TO_CONNECT)
    phaserEvents.emit(Event.MY_PLAYER_READY)
  }

  // method to send ready-to-connect signal to Colyseus server
  videoConnected() {
    this.room?.send(Message.VIDEO_CONNECTED)
    phaserEvents.emit(Event.MY_PLAYER_VIDEO_CONNECTED)
  }

  // method to send stream-disconnection signal to Colyseus server
  playerStreamDisconnect(id: string) {
    this.room?.send(Message.DISCONNECT_STREAM, { clientId: id })
    this.webRTC?.deleteVideoStream(id)
  }

  connectToComputer(id: string) {
    this.room?.send(Message.CONNECT_TO_COMPUTER, { computerId: id })
  }

  disconnectFromComputer(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_COMPUTER, { computerId: id })
  }

  connectToWhiteboard(id: string) {
    this.room?.send(Message.CONNECT_TO_WHITEBOARD, { whiteboardId: id })
  }

  disconnectFromWhiteboard(id: string) {
    this.room?.send(Message.DISCONNECT_FROM_WHITEBOARD, { whiteboardId: id })
  }

  onStopScreenShare(id: string) {
    this.room?.send(Message.STOP_SCREEN_SHARE, { computerId: id })
  }

  addChatMessage(content: string) {
    this.room?.send(Message.ADD_CHAT_MESSAGE, { content: content })
  }

  resizeWorkspace(sizeType: string, width: number, height: number) {
    this.room?.send(Message.RESIZE_WORKSPACE, { sizeType, width, height })
  }

  updateRoom(
    roomDataOrId:
      | {
          id: string
          roomType: string
          name: string
          gridX: number
          gridY: number
          width: number
          height: number
          doorX?: number
          doorY?: number
        }
      | string,
    roomType?: string,
    name?: string,
    gridX?: number,
    gridY?: number,
    width?: number,
    height?: number,
    doorX?: number,
    doorY?: number
  ) {
    if (typeof roomDataOrId === 'object') {
      this.room?.send(Message.UPDATE_ROOM, roomDataOrId)
    } else {
      this.room?.send(Message.UPDATE_ROOM, {
        id: roomDataOrId,
        roomType: roomType!,
        name: name!,
        gridX: gridX!,
        gridY: gridY!,
        width: width!,
        height: height!,
        doorX,
        doorY,
      })
    }
  }

  removeRoom(id: string) {
    this.room?.send(Message.REMOVE_ROOM, { id })
  }

  placeFurniture(
    furnitureDataOrType:
      | {
          id?: string
          itemType: string
          gridX: number
          gridY: number
          orientation?: number
          itemDirection?: string
          tint?: number
        }
      | string,
    gridX?: number,
    gridY?: number,
    orientation = 0,
    itemDirection?: string,
    tint?: number
  ) {
    if (typeof furnitureDataOrType === 'object') {
      const id =
        furnitureDataOrType.id ||
        `${furnitureDataOrType.itemType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      this.room?.send(Message.PLACE_FURNITURE, {
        ...furnitureDataOrType,
        id,
      })
    } else {
      const itemType = furnitureDataOrType
      const id = `${itemType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      this.room?.send(Message.PLACE_FURNITURE, {
        id,
        itemType,
        gridX: gridX!,
        gridY: gridY!,
        orientation,
        itemDirection,
        tint,
      })
    }
  }

  removeFurniture(id: string) {
    this.room?.send(Message.REMOVE_FURNITURE, { id })
  }

  deleteCurrentWorkspace() {
    this.room?.send(Message.DELETE_WORKSPACE)
  }
}
