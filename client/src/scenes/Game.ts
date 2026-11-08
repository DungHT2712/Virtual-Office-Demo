import Phaser from 'phaser'

import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import { extractBaseCharacterName } from '../characters/Player'
import Network from '../services/Network'
import { IPlayer, OutfitType } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'

import store from '../stores'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { setErrorNotice, setSuccessNotice } from '../stores/WorkspaceStore'
import { setLoggedIn } from '../stores/UserStore'
import { NavKeys, Keyboard } from '../../../types/KeyboardState'
import { Pathfinder } from '../utils/Pathfinder'
import { phaserEvents, Event } from '../events/EventCenter'

export default class Game extends Phaser.Scene {
  network!: Network
  private cursors!: NavKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  private groundLayer!: Phaser.Tilemaps.TilemapLayer
  private gridOverlay?: Phaser.GameObjects.Grid
  private ghostMarker?: Phaser.GameObjects.Rectangle
  myPlayer!: MyPlayer
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()
  private pathfinder?: Pathfinder
  private targetMarker?: Phaser.GameObjects.Arc

  // Gather Town Mapmaker state
  private furnitureMap = new Map<string, Phaser.GameObjects.GameObject>()
  private roomZonesMap = new Map<
    string,
    { graphics: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }
  >()
  private chairsGroup!: Phaser.Physics.Arcade.StaticGroup
  private computersGroup!: Phaser.Physics.Arcade.StaticGroup
  private whiteboardsGroup!: Phaser.Physics.Arcade.StaticGroup
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup

  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    }

    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', () => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', () => {
      store.dispatch(setShowChat(false))
    })
  }

  disableKeys() {
    this.input.keyboard.enabled = false
  }

  enableKeys() {
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }

    this.registerKeys()
    createCharacterAnims(this.anims)

    // Khởi tạo các nhóm vật lý tương tác
    this.chairsGroup = this.physics.add.staticGroup({ classType: Chair })
    this.computersGroup = this.physics.add.staticGroup({ classType: Computer })
    this.whiteboardsGroup = this.physics.add.staticGroup({ classType: Whiteboard })
    this.obstaclesGroup = this.physics.add.staticGroup()

    // Khởi tạo kích thước sàn gạch theo Workspace đã chọn (Small: 20x20, Medium: 30x30, Large: 40x40)
    const wsState = store.getState().workspace
    const wsWidth = this.network.room?.state?.workspace?.width || wsState.width || 30
    const wsHeight = this.network.room?.state?.workspace?.height || wsState.height || 30
    const mapWidthInPixels = wsWidth * 32
    const mapHeightInPixels = wsHeight * 32

    // Tạo bản đồ sàn gạch sạch sẽ (không có bất kỳ thiết kế nào trên map khi mới tạo)
    this.map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: wsWidth,
      height: wsHeight,
    })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall', 32, 32, 0, 0, 0)!
    this.groundLayer = this.map.createBlankLayer('Ground', FloorAndGround)!
    // Lát toàn bộ mặt sàn bằng sàn gạch bình thường đúng theo kích thước được chọn
    this.groundLayer.fill(411, 0, 0, wsWidth, wsHeight)

    // Khởi tạo player tại tâm của sàn gạch với nhân vật đã được thiết lập từ trang chủ
    const userState = store.getState().user
    const charName = userState.playerName || 'Guest'
    const charAvatar = userState.avatar || 'adam'
    const customization = {
      skinColor: userState.skinColor || '#f5cfa0',
      hairColor: userState.hairColor || '#4a3728',
      outfitType: userState.outfitType || 'casual',
      outfitColor: userState.outfitColor || '#3b82f6',
    }

    const spawnX = Math.floor(wsWidth / 2) * 32 + 16
    const spawnY = Math.floor(wsHeight / 2) * 32 + 16
    this.myPlayer = this.add.myPlayer(spawnX, spawnY, charAvatar, this.network.mySessionId)
    this.myPlayer.setCollideWorldBounds(true)
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    // Tự động áp dụng tên, ngoại hình và kết nối ngay vào Workspace mà không cần qua LoginDialog
    this.myPlayer.setPlayerName(charName)
    this.myPlayer.setCharacterCustomization(charAvatar, customization)
    this.network.updatePlayerName(charName, customization)
    this.network.readyToConnect()
    store.dispatch(setLoggedIn(true))

    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    // Camera follow & world bounds theo đúng kích thước sàn gạch được chọn
    this.physics.world.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels)
    this.cameras.main.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels)
    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.myPlayer, true)

    this.physics.add.collider(this.myPlayer, this.obstaclesGroup)

    this.physics.add.overlap(
      this.playerSelector,
      [this.chairsGroup, this.computersGroup, this.whiteboardsGroup],
      this.handleItemSelectorOverlap,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // Gather Town Mapmaker: Lưới Grid Overlay 32x32 và Ghost Snapping Marker
    this.gridOverlay = this.add
      .grid(
        this.map.widthInPixels / 2,
        this.map.heightInPixels / 2,
        this.map.widthInPixels,
        this.map.heightInPixels,
        32,
        32,
        0x000000,
        0,
        0xffffff,
        0.05
      )
      .setDepth(2)
      .setVisible(false)

    this.ghostMarker = this.add
      .rectangle(0, 0, 32, 32, 0x38bdf8, 0.45)
      .setStrokeStyle(2, 0xffffff, 0.9)
      .setDepth(9998)
      .setVisible(false)

    // Xây dựng bộ tìm đường A* (Pathfinder)
    this.rebuildPathfinder()

    // Register network multiplayer event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)

    // [DYNAMIC MAPMAKER LOGIC]: Lắng nghe thay đổi từ Colyseus State
    phaserEvents.on(
      Event.WORKSPACE_UPDATED,
      (ws: { width: number; height: number; sizeType: string }) => {
        // Cập nhật kích thước nếu cần
      },
      this
    )

    phaserEvents.on(Event.FURNITURE_PLACED, this.handleFurniturePlaced, this)
    phaserEvents.on(Event.FURNITURE_REMOVED, this.handleFurnitureRemoved, this)

    phaserEvents.on(Event.ROOM_LAYOUT_ADDED, this.handleRoomLayoutAdded, this)
    phaserEvents.on(Event.ROOM_LAYOUT_REMOVED, this.handleRoomLayoutRemoved, this)

    // Hiệu ứng vòng tròn đánh dấu vị trí click chuột
    this.targetMarker = this.add.circle(0, 0, 8, 0x42eacb, 0.65)
    this.targetMarker.setStrokeStyle(2, 0xffffff, 0.9)
    this.targetMarker.setVisible(false)
    this.targetMarker.setDepth(9999)

    // [GATHER MAPMAKER PREVIEW & DRAG]: Lắng nghe pointermove để hiển thị Ghost Preview snap to 32x32
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const state = store.getState()
      const isDesign = state.workspace.designMode
      const selectedTool = state.workspace.selectedTool

      if (this.gridOverlay) {
        this.gridOverlay.setVisible(isDesign)
      }

      if (!isDesign || !selectedTool || !this.ghostMarker) {
        this.ghostMarker?.setVisible(false)
        return
      }

      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const gridX = Math.floor(worldPoint.x / 32)
      const gridY = Math.floor(worldPoint.y / 32)
      const snapX = gridX * 32 + 16
      const snapY = gridY * 32 + 16

      this.ghostMarker.setPosition(snapX, snapY)
      this.ghostMarker.setVisible(true)

      if (selectedTool === 'computer') {
        // Kiểm tra ràng buộc Gather: Máy tính bắt buộc phải đặt trên Bàn (Table)
        const hasTable = Object.values(state.workspace.furnitures).some(
          (f) => f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY
        )
        if (hasTable) {
          this.ghostMarker.setFillStyle(0x22c55e, 0.5) // Xanh lá: Hợp lệ
          this.ghostMarker.setStrokeStyle(2, 0x4ade80, 1)
        } else {
          this.ghostMarker.setFillStyle(0xef4444, 0.5) // Đỏ: Thiếu bàn
          this.ghostMarker.setStrokeStyle(2, 0xf87171, 1)
        }
      } else if (selectedTool === 'eraser') {
        this.ghostMarker.setFillStyle(0xf97316, 0.5)
        this.ghostMarker.setStrokeStyle(2, 0xfb923c, 1)
      } else {
        this.ghostMarker.setFillStyle(0x38bdf8, 0.5)
        this.ghostMarker.setStrokeStyle(2, 0x7dd3fc, 1)
      }
    })

    // [MAPMAKER CLICK-TO-PLACE & MOVEMENT CLICK]: Xử lý click chuột
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button !== 0 || !this.myPlayer) return

      // Bỏ qua nếu click vào UI DOM HTML
      const evtTarget = pointer.event?.target as HTMLElement | null
      if (evtTarget && evtTarget !== this.game.canvas && evtTarget.tagName !== 'CANVAS') return

      const state = store.getState()
      const isDesign = state.workspace.designMode
      const selectedTool = state.workspace.selectedTool
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const gridX = Math.floor(worldPoint.x / 32)
      const gridY = Math.floor(worldPoint.y / 32)

      // Nếu đang trong chế độ Design Mapmaker: Đặt đồ hoặc Tẩy xóa, KHÔNG di chuyển nhân vật!
      if (isDesign) {
        if (!selectedTool) return

        if (selectedTool === 'eraser') {
          // Tìm furniture tại tọa độ gridX, gridY để xóa
          const target = Object.values(state.workspace.furnitures).find(
            (f) => f.gridX === gridX && f.gridY === gridY
          )
          if (target) {
            this.network.removeFurniture(target.id)
            store.dispatch(setSuccessNotice('Đã xóa vật thể khỏi bản đồ.'))
          }
          return
        }

        if (selectedTool === 'computer') {
          const hasTable = Object.values(state.workspace.furnitures).some(
            (f) => f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY
          )
          if (!hasTable) {
            store.dispatch(
              setErrorNotice('Máy tính bắt buộc phải đặt trên Bàn! Hãy đặt Bàn ở ô này trước.')
            )
            return
          }
        }

        // Đặt đồ vật lên Colyseus State
        this.network.placeFurniture(selectedTool, gridX, gridY)
        store.dispatch(
          setSuccessNotice(`Đã đặt ${selectedTool} tại ô (${gridX}, ${gridY}) thành công!`)
        )
        return
      }

      // Khi không ở Design Mode: Xử lý click-to-move cho chế độ Mouse
      if (!this.pathfinder) return
      if (this.myPlayer.playerBehavior === PlayerBehavior.SITTING) return
      if (!state.user.loggedIn) return
      if (state.user.movementMode !== 'mouse') return
      if (state.computer.computerDialogOpen || state.whiteboard.whiteboardDialogOpen) return

      const footY = this.myPlayer.y + this.myPlayer.height * 0.25
      const path = this.pathfinder.findPath(this.myPlayer.x, footY, worldPoint.x, worldPoint.y)

      if (path.length > 0) {
        this.myPlayer.setMovePath(path)
        const finalPoint = path[path.length - 1]
        if (this.targetMarker) {
          this.targetMarker.setPosition(finalPoint.x, finalPoint.y)
          this.targetMarker.setVisible(true)
          this.tweens.killTweensOf(this.targetMarker)
          this.targetMarker.setScale(1)
          this.targetMarker.setAlpha(0.85)
          this.tweens.add({
            targets: this.targetMarker,
            scale: 1.5,
            alpha: 0,
            duration: 600,
            onComplete: () => this.targetMarker?.setVisible(false),
          })
        }
      }
    })
  }

  /**
   * Cập nhật lưới tìm đường A* khi bản đồ hoặc vật cản thay đổi
   */
  rebuildPathfinder() {
    if (!this.map || !this.groundLayer) return
    this.pathfinder = new Pathfinder(this.map, this.groundLayer, [
      this.obstaclesGroup,
      this.chairsGroup,
    ])
  }

  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)
    return obj
  }

  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean
  ) {
    const group = this.physics.add.staticGroup()
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    if (!objectLayer) return group
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
    })
    if (this.myPlayer && collidable) {
      this.physics.add.collider(this.myPlayer, group)
    }
    return group
  }

  /**
   * [OBJECTS LAYER]: Đặt vật thể snap-to-grid theo Colyseus State
   */
  private handleFurniturePlaced(item: {
    id: string
    itemType: string
    gridX: number
    gridY: number
    orientation?: number
  }) {
    this.handleFurnitureRemoved(item.id)

    const worldX = item.gridX * 32 + 16
    const worldY = item.gridY * 32 + 16

    let obj: Phaser.GameObjects.GameObject | null = null

    if (item.itemType === 'table') {
      const table = this.obstaclesGroup.create(worldX, worldY, 'office', 28)
      table.setDepth(worldY)
      obj = table
    } else if (item.itemType === 'chair') {
      const chair = this.chairsGroup.get(worldX, worldY, 'chairs', 0) as Chair
      chair.itemDirection = 'down'
      chair.setDepth(worldY)
      obj = chair
    } else if (item.itemType === 'computer') {
      const comp = this.computersGroup.get(worldX, worldY - 8, 'computers', 0) as Computer
      comp.id = item.id
      comp.setDepth(worldY + 4)
      this.computerMap.set(item.id, comp)
      obj = comp
    } else if (item.itemType === 'whiteboard') {
      const wb = this.whiteboardsGroup.get(worldX, worldY, 'whiteboards', 0) as Whiteboard
      wb.id = item.id
      wb.setDepth(worldY)
      this.whiteboardMap.set(item.id, wb)
      obj = wb
    } else if (item.itemType === 'vase') {
      const vase = this.obstaclesGroup.create(worldX, worldY, 'generic', 700)
      vase.setDepth(worldY)
      obj = vase
    }

    if (obj) {
      this.furnitureMap.set(item.id, obj)
      this.rebuildPathfinder()
    }
  }

  private handleFurnitureRemoved(id: string) {
    const existing = this.furnitureMap.get(id)
    if (existing) {
      if (this.computerMap.has(id)) {
        this.computerMap.delete(id)
      }
      if (this.whiteboardMap.has(id)) {
        this.whiteboardMap.delete(id)
      }
      existing.destroy()
      this.furnitureMap.delete(id)
      this.rebuildPathfinder()
    }
  }

  /**
   * [TILE EFFECTS LAYER]: Vẽ các phân vùng phòng riêng (Private / Meeting Area)
   */
  private handleRoomLayoutAdded(room: {
    id: string
    roomType: string
    name: string
    gridX: number
    gridY: number
    width: number
    height: number
  }) {
    this.handleRoomLayoutRemoved(room.id)

    let color = 0x38bdf8
    if (room.roomType === 'office') color = 0x4ade80
    if (room.roomType === 'lounge') color = 0xfb923c
    if (room.roomType === 'pantry') color = 0xc084fc

    const graphics = this.add.graphics().setDepth(3)
    graphics.fillStyle(color, 0.08)
    graphics.fillRect(room.gridX * 32, room.gridY * 32, room.width * 32, room.height * 32)
    graphics.lineStyle(2, color, 0.75)
    graphics.strokeRect(room.gridX * 32, room.gridY * 32, room.width * 32, room.height * 32)

    const text = this.add
      .text(room.gridX * 32 + 6, room.gridY * 32 + 4, room.name, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 5, y: 2 },
      })
      .setDepth(room.gridY * 32 + 50)

    this.roomZonesMap.set(room.id, { graphics, text })
  }

  private handleRoomLayoutRemoved(id: string) {
    const existing = this.roomZonesMap.get(id)
    if (existing) {
      existing.graphics.destroy()
      existing.text.destroy()
      this.roomZonesMap.delete(id)
    }
  }

  private handleItemSelectorOverlap(playerSelector: any, selectionItem: any) {
    const currentItem = playerSelector.selectedItem as Item
    if (currentItem) {
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    playerSelector.selectedItem = selectionItem
    selectionItem.onOverlapDialog()
  }

  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    const baseCharacter = extractBaseCharacterName(newPlayer.anim)
    const otherPlayer = this.add.otherPlayer(
      newPlayer.x,
      newPlayer.y,
      baseCharacter,
      id,
      newPlayer.name
    )
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)

    otherPlayer.characterName = baseCharacter
    if (newPlayer.skinColor) otherPlayer.skinColor = newPlayer.skinColor
    if (newPlayer.hairColor) otherPlayer.hairColor = newPlayer.hairColor
    if (newPlayer.outfitType) otherPlayer.outfitType = newPlayer.outfitType as OutfitType
    if (newPlayer.outfitColor) otherPlayer.outfitColor = newPlayer.outfitColor

    otherPlayer.applyAppearance(baseCharacter, {
      skinColor: otherPlayer.skinColor,
      hairColor: otherPlayer.hairColor,
      outfitType: otherPlayer.outfitType,
      outfitColor: otherPlayer.outfitColor,
    })

    if (newPlayer.anim) {
      otherPlayer.updateOtherPlayer('anim', newPlayer.anim)
    }
  }

  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  private handlePlayersOverlap(myPlayer: any, otherPlayer: any) {
    otherPlayer.makeCall(myPlayer, this.network?.webRTC)
  }

  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    }
  }

  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  update(t: number, dt: number) {
    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }
}
