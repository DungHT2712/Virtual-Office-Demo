import bcrypt from 'bcrypt'
import { Room, Client, ServerError } from 'colyseus'
import { Dispatcher } from '@colyseus/command'
import { Player, OfficeState, Computer, Whiteboard } from './schema/OfficeState'
import { Message } from '../../types/Messages'
import { IRoomData, RoomType } from '../../types/Rooms'
import { whiteboardRoomIds } from './schema/OfficeState'
import PlayerUpdateCommand from './commands/PlayerUpdateCommand'
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand'
import {
  ComputerAddUserCommand,
  ComputerRemoveUserCommand,
} from './commands/ComputerUpdateArrayCommand'
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateArrayCommand'
import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand'
import {
  ResizeWorkspaceCommand,
  UpdateRoomCommand,
  RemoveRoomCommand,
  PlaceFurnitureCommand,
  RemoveFurnitureCommand,
  CreateFloorCommand,
  DeleteFloorCommand,
  UpdateFloorDoorCommand,
  SwitchPlayerFloorCommand,
} from './commands/DesignCommands'
import { RoomState } from './schema/RoomState'
import { FurnitureState } from './schema/FurnitureState'
import { saveWorkspace, removeWorkspace } from '../data/workspaceStorage'

export class SkyOffice extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this)
  private name: string
  private description: string
  private password: string | null = null

  async onCreate(options: IRoomData) {
    const { name, description, password } = options
    this.name = name
    this.description = description
    // Luôn giữ phòng để lưu trong Manage Workspace kể cả khi người chơi tạm rời đi
    this.autoDispose = false

    this.setState(new OfficeState())

    // Thiết lập kích thước Workspace đúng theo kích thước được chọn khi tạo phòng
    const sizeType = options.sizeType || 'MEDIUM'
    let width = options.width
    let height = options.height
    if (!width || !height) {
      if (sizeType === 'SMALL') {
        width = 20
        height = 20
      } else if (sizeType === 'LARGE') {
        width = 70
        height = 70
      } else if (sizeType === 'XLARGE') {
        width = 100
        height = 100
      } else {
        width = 50
        height = 50
      }
    }
    this.state.workspace.sizeType = sizeType
    this.state.workspace.width = width
    this.state.workspace.height = height

    let hasPassword = false
    if (password) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(password, salt)
      hasPassword = true
    }
    const ownerId = options.ownerId || ''
    const ownerName = options.ownerName || ''
    const shareMode = options.shareMode || 'free'
    const sharedUsers = options.sharedUsers || []

    this.setMetadata({
      name,
      description,
      hasPassword,
      sizeType,
      width,
      height,
      ownerId,
      ownerName,
      shareMode,
      sharedUsers,
    })

    if (this.roomName === RoomType.CUSTOM) {
      saveWorkspace({
        id: this.roomId,
        name,
        description,
        hasPassword,
        sizeType,
        width,
        height,
        ownerId,
        ownerName,
        shareMode,
        sharedUsers,
        createdAt: Date.now(),
      })
    }

    // HARD-CODED: Add 5 computers in a room
    for (let i = 0; i < 5; i++) {
      this.state.computers.set(String(i), new Computer())
    }

    // HARD-CODED: Add 3 whiteboards in a room
    for (let i = 0; i < 3; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard())
    }

    // when a player connect to a computer, add to the computer connectedUser array
    this.onMessage(Message.CONNECT_TO_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerAddUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player disconnect from a computer, remove from the computer connectedUser array
    this.onMessage(Message.DISCONNECT_FROM_COMPUTER, (client, message: { computerId: string }) => {
      this.dispatcher.dispatch(new ComputerRemoveUserCommand(), {
        client,
        computerId: message.computerId,
      })
    })

    // when a player stop sharing screen
    this.onMessage(Message.STOP_SCREEN_SHARE, (client, message: { computerId: string }) => {
      const computer = this.state.computers.get(message.computerId)
      if (computer) {
        computer.connectedUser.forEach((id) => {
          this.clients.forEach((cli) => {
            if (cli.sessionId === id && cli.sessionId !== client.sessionId) {
              cli.send(Message.STOP_SCREEN_SHARE, client.sessionId)
            }
          })
        })
      }
    })

    // when a player connect to a whiteboard, add to the whiteboard connectedUser array
    this.onMessage(Message.CONNECT_TO_WHITEBOARD, (client, message: { whiteboardId: string }) => {
      this.dispatcher.dispatch(new WhiteboardAddUserCommand(), {
        client,
        whiteboardId: message.whiteboardId,
      })
    })

    // when a player disconnect from a whiteboard, remove from the whiteboard connectedUser array
    this.onMessage(
      Message.DISCONNECT_FROM_WHITEBOARD,
      (client, message: { whiteboardId: string }) => {
        this.dispatcher.dispatch(new WhiteboardRemoveUserCommand(), {
          client,
          whiteboardId: message.whiteboardId,
        })
      }
    )

    // when receiving updatePlayer message, call the PlayerUpdateCommand
    this.onMessage(
      Message.UPDATE_PLAYER,
      (client, message: { x: number; y: number; anim: string; floor?: number }) => {
        this.dispatcher.dispatch(new PlayerUpdateCommand(), {
          client,
          x: message.x,
          y: message.y,
          anim: message.anim,
          floor: message.floor,
        })
      }
    )

    // when receiving updatePlayerName message, call the PlayerUpdateNameCommand
    this.onMessage(
      Message.UPDATE_PLAYER_NAME,
      (
        client,
        message: {
          name: string
          skinColor?: string
          hairColor?: string
          outfitType?: string
          outfitColor?: string
          statusColor?: string
          statusName?: string
        }
      ) => {
        this.dispatcher.dispatch(new PlayerUpdateNameCommand(), {
          client,
          name: message.name,
          skinColor: message.skinColor,
          hairColor: message.hairColor,
          outfitType: message.outfitType,
          outfitColor: message.outfitColor,
          statusColor: message.statusColor,
          statusName: message.statusName,
        })
      }
    )

    // when receiving updatePlayerStatus message
    this.onMessage(
      Message.UPDATE_PLAYER_STATUS,
      (client, message: { statusColor: string; statusName?: string }) => {
        const player = this.state.players.get(client.sessionId)
        if (!player) return
        if (message.statusColor) player.statusColor = message.statusColor
        if (message.statusName) player.statusName = message.statusName
      }
    )

    // when receiving updatePlayerCustomization message
    this.onMessage(
      Message.UPDATE_PLAYER_CUSTOMIZATION,
      (
        client,
        message: {
          skinColor?: string
          hairColor?: string
          outfitType?: string
          outfitColor?: string
        }
      ) => {
        const player = this.state.players.get(client.sessionId)
        if (!player) return
        if (message.skinColor) player.skinColor = message.skinColor
        if (message.hairColor) player.hairColor = message.hairColor
        if (message.outfitType) player.outfitType = message.outfitType
        if (message.outfitColor) player.outfitColor = message.outfitColor
      }
    )

    // when a player is ready to connect, call the PlayerReadyToConnectCommand
    this.onMessage(Message.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.readyToConnect = true
    })

    // when a player connects or disconnects video
    this.onMessage(
      Message.VIDEO_CONNECTED,
      (client, message?: { videoConnected?: boolean } | boolean) => {
        const player = this.state.players.get(client.sessionId)
        if (player) {
          if (typeof message === 'boolean') {
            player.videoConnected = message
          } else if (message && typeof message.videoConnected === 'boolean') {
            player.videoConnected = message.videoConnected
          } else {
            player.videoConnected = true
          }
        }
      }
    )

    // when a player disconnect a stream, broadcast the signal to the other player connected to the stream
    this.onMessage(Message.DISCONNECT_STREAM, (client, message: { clientId: string }) => {
      this.clients.forEach((cli) => {
        if (cli.sessionId === message.clientId) {
          cli.send(Message.DISCONNECT_STREAM, client.sessionId)
        }
      })
    })

    // when a player send a chat message, update the message array and broadcast to all connected clients except the sender
    this.onMessage(Message.ADD_CHAT_MESSAGE, (client, message: { content: string }) => {
      // update the message array (so that players join later can also see the message)
      this.dispatcher.dispatch(new ChatMessageUpdateCommand(), {
        client,
        content: message.content,
      })

      // broadcast to all currently connected clients except the sender (to render in-game dialog on top of the character)
      this.broadcast(
        Message.ADD_CHAT_MESSAGE,
        { clientId: client.sessionId, content: message.content },
        { except: client }
      )
    })

    // Mapmaker Commands Listeners
    this.onMessage(
      Message.RESIZE_WORKSPACE,
      (client, message: { width: number; height: number; sizeType: string }) => {
        this.dispatcher.dispatch(new ResizeWorkspaceCommand(), {
          client,
          width: message.width,
          height: message.height,
          sizeType: message.sizeType,
        })
      }
    )

    this.onMessage(
      Message.UPDATE_ROOM,
      (
        client,
        message: {
          id: string
          roomType: string
          name: string
          gridX: number
          gridY: number
          width: number
          height: number
          doorX?: number
          doorY?: number
          floor?: number
        }
      ) => {
        this.dispatcher.dispatch(new UpdateRoomCommand(), {
          client,
          ...message,
        })
      }
    )

    this.onMessage(Message.REMOVE_ROOM, (client, message: { id: string }) => {
      this.dispatcher.dispatch(new RemoveRoomCommand(), {
        client,
        id: message.id,
      })
    })

    this.onMessage(
      Message.PLACE_FURNITURE,
      (
        client,
        message: {
          id: string
          itemType: string
          gridX: number
          gridY: number
          orientation?: number
          itemDirection?: string
          tint?: number
          floor?: number
        }
      ) => {
        this.dispatcher.dispatch(new PlaceFurnitureCommand(), {
          client,
          ...message,
        })
      }
    )

    this.onMessage(Message.REMOVE_FURNITURE, (client, message: { id: string }) => {
      this.dispatcher.dispatch(new RemoveFurnitureCommand(), {
        client,
        id: message.id,
      })
    })

    this.onMessage(
      Message.CREATE_FLOOR,
      (client, message: { gridX: number; gridY: number }) => {
        this.dispatcher.dispatch(new CreateFloorCommand(), {
          client,
          gridX: message.gridX,
          gridY: message.gridY,
        })
      }
    )

    this.onMessage(
      Message.DELETE_FLOOR,
      (client, message: { floorNumber: number }) => {
        this.dispatcher.dispatch(new DeleteFloorCommand(), {
          client,
          floorNumber: message.floorNumber,
        })
      }
    )

    this.onMessage(
      Message.UPDATE_FLOOR_DOOR,
      (client, message: { doorId: string; gridX: number; gridY: number }) => {
        this.dispatcher.dispatch(new UpdateFloorDoorCommand(), {
          client,
          doorId: message.doorId,
          gridX: message.gridX,
          gridY: message.gridY,
        })
      }
    )

    this.onMessage(
      Message.SWITCH_PLAYER_FLOOR,
      (client, message: { floor: number; x?: number; y?: number }) => {
        this.dispatcher.dispatch(new SwitchPlayerFloorCommand(), {
          client,
          floor: message.floor,
          x: message.x,
          y: message.y,
        })
      }
    )

    this.onMessage(Message.DELETE_WORKSPACE, async () => {
      await this.deleteRoom()
    })
  }

  async deleteRoom() {
    removeWorkspace(this.roomId)
    removeWorkspace(this.name)
    this.broadcast(Message.WORKSPACE_DELETED)
    this.autoDispose = true
    await this.disconnect()
  }

  async onAuth(client: Client, options: { password: string | null }) {
    if (this.password) {
      const validPassword = await bcrypt.compare(options.password, this.password)
      if (!validPassword) {
        throw new ServerError(403, 'Password is incorrect!')
      }
    }
    return true
  }

  onJoin(client: Client, options: any) {
    this.state.players.set(client.sessionId, new Player())
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
      description: this.description,
    })
  }

  onLeave(client: Client, consented: boolean) {
    if (this.state.players.has(client.sessionId)) {
      this.state.players.delete(client.sessionId)
    }
    this.state.computers.forEach((computer) => {
      if (computer.connectedUser.has(client.sessionId)) {
        computer.connectedUser.delete(client.sessionId)
      }
    })
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboard.connectedUser.has(client.sessionId)) {
        whiteboard.connectedUser.delete(client.sessionId)
      }
    })
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      if (whiteboardRoomIds.has(whiteboard.roomId)) whiteboardRoomIds.delete(whiteboard.roomId)
    })

    console.log('room', this.roomId, 'disposing...')
    this.dispatcher.stop()
  }

  updateShareMode(shareMode: 'free' | 'ask') {
    const currentMeta = (this as any).metadata || {}
    this.setMetadata({ ...currentMeta, shareMode })
  }

  updateSharedUsers(sharedUsers: string[]) {
    const currentMeta = (this as any).metadata || {}
    this.setMetadata({ ...currentMeta, sharedUsers })
  }
}
