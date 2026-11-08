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
import Player, { extractBaseCharacterName } from '../characters/Player'
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
import { registerFurnitureTextures, ensureCustomRugTexture } from '../utils/FurnitureTextures'

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
  private isDraggingRoom = false
  private roomStartTile: { x: number; y: number } | null = null
  private roomDragGraphics?: Phaser.GameObjects.Graphics
  private roomDragText?: Phaser.GameObjects.Text
  private roomWallsMap = new Map<string, Phaser.GameObjects.GameObject[]>()
  private isRightClickDragging = false
  private panLastPointerX = 0
  private panLastPointerY = 0
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

    // Bắt sự kiện phím R và E ngay lập tức khi vừa nhấn xuống (KeyDown event-driven)
    // Loại bỏ hoàn toàn độ trễ của cơ chế polling và triệt tiêu lỗi phải bấm 2 lần (double R)
    this.keyR.on('down', () => {
      if (this.myPlayer && this.network) {
        this.myPlayer.interactR(this.network)
      }
    })

    this.keyE.on('down', () => {
      if (this.myPlayer && this.network) {
        this.myPlayer.interactE(this.network)
      }
    })

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
    registerFurnitureTextures(this)

    // Khởi tạo các nhóm vật lý tương tác
    this.chairsGroup = this.physics.add.staticGroup({ classType: Chair })
    this.computersGroup = this.physics.add.staticGroup({ classType: Computer })
    this.whiteboardsGroup = this.physics.add.staticGroup({ classType: Whiteboard })
    this.obstaclesGroup = this.physics.add.staticGroup()

    // Khởi tạo kích thước sàn gạch theo Workspace đã chọn (Small: 20x20, Medium: 30x30, Large: 40x40)
    const wsState = store.getState().workspace
    const wsWidth = (this.network as any).room?.state?.workspace?.width || wsState.workspace?.width || 30
    const wsHeight = (this.network as any).room?.state?.workspace?.height || wsState.workspace?.height || 30
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
    this.playerSelector = new PlayerSelector(this, spawnX, spawnY, 96, 96)
    this.myPlayer.playerSelector = this.playerSelector

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

    // Vô hiệu hóa menu chuột phải mặc định của trình duyệt để hỗ trợ kéo bản đồ bằng chuột phải
    this.input.mouse?.disableContextMenu()
    if (this.game.canvas) {
      this.game.canvas.oncontextmenu = (e: MouseEvent) => e.preventDefault()
    }
    window.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 2) {
        this.isRightClickDragging = false
      }
    })

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
    phaserEvents.on(Event.DESIGN_MODE_TOGGLED, this.setDesignModeView, this)

    // Hiệu ứng vòng tròn đánh dấu vị trí click chuột
    this.targetMarker = this.add.circle(0, 0, 8, 0x42eacb, 0.65)
    this.targetMarker.setStrokeStyle(2, 0xffffff, 0.9)
    this.targetMarker.setVisible(false)
    this.targetMarker.setDepth(9999)

    // Đồ họa Drag & Drop preview khi kéo thả phân vùng phòng
    this.roomDragGraphics = this.add.graphics().setDepth(9997)
    this.roomDragText = this.add
      .text(0, 0, '', {
        fontFamily: 'Arial',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#000000cc',
        padding: { x: 6, y: 3 },
      })
      .setDepth(9999)
      .setVisible(false)

    // [CAMERA ZOOM]: Phóng to / Thu nhỏ bằng Ctrl + Scroll hoặc cuộn chuột khi ở chế độ Design Mode
    this.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
        const rawEvent = pointer.event as WheelEvent | undefined
        const state = store.getState()
        const isDesign = state.workspace.designMode

        if (!rawEvent?.ctrlKey && !isDesign) {
          return
        }

        if (rawEvent) {
          rawEvent.preventDefault()
        }

        const zoomFactor = deltaY > 0 ? 0.9 : 1.1
        const currentZoom = this.cameras.main.zoom
        const newZoom = Phaser.Math.Clamp(currentZoom * zoomFactor, 0.25, 3.5)
        this.cameras.main.setZoom(newZoom)
      }
    )

    // [GATHER MAPMAKER PREVIEW & DRAG]: Lắng nghe pointermove để hiển thị Ghost Preview snap to 32x32 và Right-Click Pan
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // 1. Xử lý di chuyển bản đồ bằng chuột phải (Right-Click Drag to Pan)
      if (this.isRightClickDragging || pointer.rightButtonDown()) {
        const dx = (pointer.x - this.panLastPointerX) / this.cameras.main.zoom
        const dy = (pointer.y - this.panLastPointerY) / this.cameras.main.zoom
        this.cameras.main.scrollX -= dx
        this.cameras.main.scrollY -= dy
        this.panLastPointerX = pointer.x
        this.panLastPointerY = pointer.y
        return
      }

      const state = store.getState()
      const isDesign = state.workspace.designMode
      const selectedTool = state.workspace.selectedTool

      if (this.gridOverlay) {
        this.gridOverlay.setVisible(isDesign)
      }

      if (!isDesign) {
        this.ghostMarker?.setVisible(false)
        if (this.roomDragGraphics) this.roomDragGraphics.clear()
        if (this.roomDragText) this.roomDragText.setVisible(false)
        return
      }

      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const gridX = Math.floor(worldPoint.x / 32)
      const gridY = Math.floor(worldPoint.y / 32)
      const snapX = gridX * 32 + 16
      const snapY = gridY * 32 + 16

      const wsW = state.workspace.workspace.width || 30
      const wsH = state.workspace.workspace.height || 30

      // Nếu chuột nằm ngoài bản đồ
      if (gridX < 0 || gridY < 0 || gridX >= wsW || gridY >= wsH) {
        this.ghostMarker?.setVisible(false)
        if (this.roomDragGraphics) this.roomDragGraphics.clear()
        if (this.roomDragText) this.roomDragText.setVisible(false)
        return
      }

      // 2. Khi chưa chọn công cụ (!selectedTool): Luôn hiển thị ô con trỏ design snap theo lưới 32x32
      if (!selectedTool) {
        if (this.roomDragGraphics) this.roomDragGraphics.clear()
        if (this.roomDragText) this.roomDragText.setVisible(false)
        if (this.ghostMarker) {
          this.ghostMarker.setSize(32, 32)
          this.ghostMarker.setPosition(snapX, snapY)
          this.ghostMarker.setFillStyle(0x38bdf8, 0.25)
          this.ghostMarker.setStrokeStyle(2, 0xffffff, 0.85)
          this.ghostMarker.setVisible(true)
        }
        return
      }

      // Chế độ PHÒNG: Xử lý kéo thả tạo Bounding Box
      if (selectedTool.startsWith('room_')) {
        const roomType = selectedTool.replace('room_', '')
        let roomColor = 0x38bdf8
        if (roomType === 'office') roomColor = 0x4ade80
        if (roomType === 'lounge') roomColor = 0xfb923c
        if (roomType === 'pantry') roomColor = 0xc084fc

        if (this.isDraggingRoom && this.roomStartTile) {
          this.ghostMarker?.setVisible(false)
          const wsW = state.workspace.workspace.width || 30
          const wsH = state.workspace.workspace.height || 30
          const clampedX = Math.max(0, Math.min(gridX, wsW - 1))
          const clampedY = Math.max(0, Math.min(gridY, wsH - 1))
          const startX = Math.max(0, Math.min(this.roomStartTile.x, wsW - 1))
          const startY = Math.max(0, Math.min(this.roomStartTile.y, wsH - 1))

          const minX = Math.min(startX, clampedX)
          const minY = Math.min(startY, clampedY)
          const w = Math.abs(clampedX - startX) + 1
          const h = Math.abs(clampedY - startY) + 1

          if (this.roomDragGraphics) {
            this.roomDragGraphics.clear()
            this.roomDragGraphics.fillStyle(roomColor, 0.22)
            this.roomDragGraphics.fillRect(minX * 32, minY * 32, w * 32, h * 32)
            this.roomDragGraphics.lineStyle(2, roomColor, 0.95)
            this.roomDragGraphics.strokeRect(minX * 32, minY * 32, w * 32, h * 32)
          }

          if (this.roomDragText) {
            this.roomDragText.setText(`${w}x${h} ô (${w * 32}x${h * 32}px) - Kéo để mở rộng`)
            this.roomDragText.setPosition(minX * 32 + 6, minY * 32 + 6)
            this.roomDragText.setVisible(true)
          }
        } else {
          // Chưa kéo: Hiển thị marker 1 ô để hướng dẫn bắt đầu kéo
          if (this.ghostMarker) {
            this.ghostMarker.setSize(32, 32)
            this.ghostMarker.setPosition(snapX, snapY)
            this.ghostMarker.setFillStyle(roomColor, 0.4)
            this.ghostMarker.setStrokeStyle(2, roomColor, 1)
            this.ghostMarker.setVisible(true)
          }
        }
        return
      }

      // Chế độ NỘI THẤT (Bàn, ghế, máy tính, bảng trắng, bình hoa, máy bán nước, tẩy xóa)
      if (this.ghostMarker) {
        this.ghostMarker.setSize(32, 32)
        this.ghostMarker.setPosition(snapX, snapY)
        this.ghostMarker.setVisible(true)

        if (selectedTool === 'computer') {
          const tableAtTile = Object.values(state.workspace.furnitures).find(
            (f) => f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY
          )
          const hasExistingComputer = Object.values(state.workspace.furnitures).some(
            (f) => f.itemType === 'computer' && f.gridX === gridX && f.gridY === gridY
          )
          if (tableAtTile && !hasExistingComputer) {
            this.ghostMarker.setFillStyle(0x22c55e, 0.5) // Xanh lá: Hợp lệ (đặt trên bàn)
            this.ghostMarker.setStrokeStyle(2, 0x4ade80, 1)
            this.ghostMarker.setAngle((tableAtTile.orientation || 0) * 90)
          } else {
            this.ghostMarker.setFillStyle(0xef4444, 0.5) // Đỏ: Thiếu bàn hoặc đã có máy tính
            this.ghostMarker.setStrokeStyle(2, 0xf87171, 1)
            this.ghostMarker.setAngle(0)
          }
        } else {
          this.ghostMarker.setAngle(0)
          if (selectedTool?.startsWith('rug')) {
            const colorHex = selectedTool.includes(':') ? selectedTool.split(':')[1] : '#2563eb'
            const numColor = parseInt(colorHex.replace('#', ''), 16) || 0x2563eb
            this.ghostMarker.setFillStyle(numColor, 0.5)
            this.ghostMarker.setStrokeStyle(2, 0xffffff, 1)
          } else if (selectedTool === 'eraser') {
            this.ghostMarker.setFillStyle(0xf97316, 0.5)
            this.ghostMarker.setStrokeStyle(2, 0xfb923c, 1)
          } else {
            this.ghostMarker.setFillStyle(0x38bdf8, 0.5)
            this.ghostMarker.setStrokeStyle(2, 0x7dd3fc, 1)
          }
        }
      }
    })

    // [MAPMAKER CLICK-TO-PLACE & DRAG START]: Xử lý nhấn chuột
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // 1. Nhấn chuột phải để bắt đầu kéo bản đồ (Right-Click Drag to Pan)
      if (pointer.button === 2) {
        this.isRightClickDragging = true
        this.panLastPointerX = pointer.x
        this.panLastPointerY = pointer.y
        return
      }

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

      if (isDesign) {
        const wsW = state.workspace.workspace.width || 30
        const wsH = state.workspace.workspace.height || 30
        if (gridX < 0 || gridY < 0 || gridX >= wsW || gridY >= wsH) {
          return
        }

        // Tìm kiếm đối tượng tại vị trí click
        const clickedFurn = Object.values(state.workspace.furnitures).find(
          (f) => f.gridX === gridX && f.gridY === gridY
        )
        const clickedRoom = Object.values(state.workspace.rooms).find(
          (r) =>
            gridX >= r.gridX &&
            gridX < r.gridX + r.width &&
            gridY >= r.gridY &&
            gridY < r.gridY + r.height
        )

        // 1. Chế độ TẨY XÓA (Eraser)
        if (selectedTool === 'eraser') {
          if (clickedFurn) {
            this.network.removeFurniture(clickedFurn.id)
            store.dispatch(setSuccessNotice('Đã xóa vật thể khỏi bản đồ.'))
            return
          }
          if (clickedRoom) {
            this.network.removeRoom(clickedRoom.id)
            store.dispatch(setSuccessNotice(`Đã xóa phân vùng "${clickedRoom.name}" khỏi bản đồ.`))
            return
          }
          return
        }

        // 2. Chế độ Con trỏ tự do (!selectedTool): Click vào nội thất hoặc phòng để sửa / đổi hướng / xóa
        if (!selectedTool) {
          if (clickedFurn) {
            phaserEvents.emit(Event.OPEN_FURNITURE_DIALOG, clickedFurn)
            return
          }
          if (clickedRoom) {
            phaserEvents.emit(Event.OPEN_ROOM_DIALOG, clickedRoom)
            return
          }
          return
        }

        // 3. Chế độ PHÒNG: Bắt đầu kéo thả diện tích phòng (Drag to size)
        if (selectedTool.startsWith('room_')) {
          this.isDraggingRoom = true
          this.roomStartTile = { x: gridX, y: gridY }
          this.ghostMarker?.setVisible(false)
          return
        }

        // 4. Chế độ ĐẶT NỘI THẤT (Bàn, Ghế, Máy tính 1 màn hình, Bình hoa, Thảm, ...)
        if (selectedTool === 'computer') {
          const hasTable = Object.values(state.workspace.furnitures).some(
            (f) => f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY
          )
          if (!hasTable) {
            store.dispatch(
              setErrorNotice('Máy tính bắt buộc phải được đặt trên Bàn! Vui lòng đặt Bàn tại ô này trước.')
            )
            return
          }
          const hasExistingComputer = Object.values(state.workspace.furnitures).some(
            (f) => f.itemType === 'computer' && f.gridX === gridX && f.gridY === gridY
          )
          if (hasExistingComputer) {
            store.dispatch(
              setErrorNotice('Bàn tại vị trí này đã có sẵn một máy tính!')
            )
            return
          }
        }

        const tableAtTile = Object.values(state.workspace.furnitures).find(
          (f) => f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY
        )
        const orientation = selectedTool === 'computer' ? tableAtTile?.orientation || 0 : 0
        this.network.placeFurniture(selectedTool, gridX, gridY, orientation)
        const toolLabel = selectedTool.startsWith('rug')
          ? 'thảm trải sàn'
          : selectedTool === 'computer'
          ? 'máy tính lên bàn'
          : selectedTool === 'table'
          ? 'bàn làm việc'
          : selectedTool === 'vase'
          ? 'bình hoa'
          : selectedTool
        store.dispatch(
          setSuccessNotice(`Đã đặt ${toolLabel} tại ô (${gridX}, ${gridY}) thành công!`)
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

    // [MAPMAKER DRAG END & RIGHT-CLICK UP]: Nhả chuột
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Nhả chuột phải: Kết thúc kéo bản đồ
      if (pointer.button === 2) {
        this.isRightClickDragging = false
        return
      }

      if (pointer.button !== 0) return

      const state = store.getState()
      const isDesign = state.workspace.designMode
      const selectedTool = state.workspace.selectedTool

      if (isDesign && this.isDraggingRoom && this.roomStartTile && selectedTool?.startsWith('room_')) {
        this.isDraggingRoom = false
        if (this.roomDragGraphics) this.roomDragGraphics.clear()
        if (this.roomDragText) this.roomDragText.setVisible(false)

        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
        const endGridX = Math.floor(worldPoint.x / 32)
        const endGridY = Math.floor(worldPoint.y / 32)

        const wsW = state.workspace.workspace.width || 30
        const wsH = state.workspace.workspace.height || 30
        const clampedEndX = Math.max(0, Math.min(endGridX, wsW - 1))
        const clampedEndY = Math.max(0, Math.min(endGridY, wsH - 1))
        const clampedStartX = Math.max(0, Math.min(this.roomStartTile.x, wsW - 1))
        const clampedStartY = Math.max(0, Math.min(this.roomStartTile.y, wsH - 1))

        const minX = Math.min(clampedStartX, clampedEndX)
        const minY = Math.min(clampedStartY, clampedEndY)
        const width = Math.abs(clampedEndX - clampedStartX) + 1
        const height = Math.abs(clampedEndY - clampedStartY) + 1
        this.roomStartTile = null

        // Kiểm tra diện tích phòng tối thiểu: 3x3 ô để có tường và lối đi bên trong
        if (width < 3 || height < 3) {
          store.dispatch(setErrorNotice('Phòng phải có kích thước tối thiểu từ 3x3 ô trở lên!'))
          return
        }

        // Tự động tính toán cửa ra vào ở giữa cạnh dưới cùng của phòng
        const doorX = Math.floor(minX + width / 2)
        const doorY = minY + height - 1

        const roomType = selectedTool.replace('room_', '')
        const roomId = `room_${Date.now()}`
        const typeLabels: Record<string, string> = {
          meeting: 'Phòng Họp',
          office: 'Phòng Làm Việc',
          lounge: 'Phòng Nghỉ',
          pantry: 'Khu Pantry',
        }
        const roomName = `${typeLabels[roomType] || 'Phòng'} ${width}x${height} ô`

        this.network.updateRoom(roomId, roomType, roomName, minX, minY, width, height, doorX, doorY)
        store.dispatch(
          setSuccessNotice(`Đã tạo ${roomName} với tường bao quanh và cửa ra vào thành công!`)
        )
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

  /**
   * Chế độ 2D Toàn Bản Đồ khi bật Design Mode
   */
  setDesignModeView(enable: boolean) {
    if (!this.map || !this.cameras?.main) return

    if (enable) {
      this.cameras.main.stopFollow()
      this.cameras.main.removeBounds()
      const centerX = this.map.widthInPixels / 2
      const centerY = this.map.heightInPixels / 2
      const padding = 80
      // Tính zoom vừa vặn khung nhìn, trừ đi 420px chiều rộng của thanh công cụ bên phải
      const availableWidth = Math.max(300, this.cameras.main.width - 440)
      const zoomX = (availableWidth - padding) / this.map.widthInPixels
      const zoomY = (this.cameras.main.height - padding) / this.map.heightInPixels
      const fitZoom = Math.max(0.35, Math.min(zoomX, zoomY, 1.2))

      // Dịch tâm camera sang một chút để bản đồ 2D nằm ở trung tâm của phần hiển thị thoáng đãng
      const targetPanX = centerX + (420 / 2) / fitZoom

      this.cameras.main.pan(targetPanX, centerY, 500, 'Power2')
      this.cameras.main.zoomTo(fitZoom, 500, 'Power2')

      // Ẩn hoàn toàn nhân vật để chỉ thấy bản đồ 2D và thao tác thiết kế sạch sẽ
      if (this.myPlayer) {
        this.myPlayer.setVisible(false)
        if (this.myPlayer.playerContainer) this.myPlayer.playerContainer.setVisible(false)
      }
      this.otherPlayers?.getChildren().forEach((p) => {
        const player = p as Player
        player.setVisible(false)
        if (player.playerContainer) player.playerContainer.setVisible(false)
      })
      if (this.playerSelector) this.playerSelector.setVisible(false)
      this.gridOverlay?.setVisible(true)
    } else {
      const mapWidthInPixels = this.map.widthInPixels
      const mapHeightInPixels = this.map.heightInPixels
      this.cameras.main.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels)
      // Hiện lại nhân vật khi thoát Design Mode
      if (this.myPlayer) {
        this.myPlayer.setVisible(true)
        this.myPlayer.setAlpha(1)
        if (this.myPlayer.playerContainer) this.myPlayer.playerContainer.setVisible(true)
      }
      this.otherPlayers?.getChildren().forEach((p) => {
        const player = p as Player
        player.setVisible(true)
        player.setAlpha(1)
        if (player.playerContainer) player.playerContainer.setVisible(true)
      })
      if (this.playerSelector) this.playerSelector.setVisible(true)
      this.cameras.main.zoomTo(1.5, 500, 'Power2')
      if (this.myPlayer) {
        this.cameras.main.startFollow(this.myPlayer, true, 0.08, 0.08)
      }
      this.gridOverlay?.setVisible(false)
      this.ghostMarker?.setVisible(false)
    }
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
    const orientation = item.orientation || 0

    let obj: Phaser.GameObjects.GameObject | null = null

    if (item.itemType === 'table') {
      const tableTexture = `custom_table_${orientation % 4}`
      const table = this.obstaclesGroup.create(worldX, worldY, tableTexture)
      table.setDepth(worldY)
      table.setAngle(0)
      obj = table

      // Tự động xoay máy tính trên bàn theo hướng xoay 2.5D của bàn
      const compOnTable = Array.from(this.computerMap.values()).find(
        (c) => Math.floor(c.x / 32) === item.gridX && Math.floor(c.y / 32) === item.gridY
      )
      if (compOnTable) {
        compOnTable.setTexture(`custom_computer_${orientation % 4}`)
        compOnTable.setAngle(0)
      }
    } else if (item.itemType === 'chair') {
      const chair = this.chairsGroup.get(worldX, worldY, 'chairs', 0) as Chair
      const chairFrames = [0, 3, 1, 2] // 0: down, 1: left, 2: up, 3: right
      const chairDirections: ('down' | 'left' | 'up' | 'right')[] = ['down', 'left', 'up', 'right']
      chair.setFrame(chairFrames[orientation % 4])
      chair.itemDirection = chairDirections[orientation % 4]
      chair.setDepth(worldY)
      chair.refreshBody()
      obj = chair
    } else if (item.itemType === 'computer') {
      const compTexture = `custom_computer_${orientation % 4}`
      const comp = this.computersGroup.get(worldX, worldY, compTexture) as Computer
      comp.setTexture(compTexture)
      comp.setSize(32, 32)
      comp.setDisplaySize(32, 32)
      comp.id = item.id
      comp.setDepth(worldY + 5)
      comp.setAngle(0)
      comp.refreshBody()
      this.computerMap.set(item.id, comp)
      obj = comp
    } else if (item.itemType === 'whiteboard') {
      const wb = this.whiteboardsGroup.get(worldX, worldY, 'whiteboards', 0) as Whiteboard
      wb.id = item.id
      wb.setDepth(worldY)
      wb.setAngle(orientation * 90)
      wb.refreshBody()
      this.whiteboardMap.set(item.id, wb)
      obj = wb
    } else if (item.itemType === 'vase') {
      const vase = this.obstaclesGroup.create(worldX, worldY, 'custom_vase')
      vase.setDepth(worldY)
      vase.setAngle(orientation * 90)
      obj = vase
    } else if (item.itemType === 'vendingmachine') {
      const vm = this.obstaclesGroup.create(worldX, worldY - 4, 'vendingmachines', 0)
      vm.setDepth(worldY + 10)
      vm.setAngle(orientation * 90)
      obj = vm
    } else if (item.itemType.startsWith('rug')) {
      const colorHex = item.itemType.includes(':') ? item.itemType.split(':')[1] : '#2563eb'
      const rugKey = ensureCustomRugTexture(this, colorHex)
      const rug = this.add.sprite(worldX, worldY, rugKey)
      rug.setDepth(2) // Lớp thảm sàn: nằm dưới nhân vật và bàn ghế
      rug.setAngle(orientation * 90)
      obj = rug
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
   * [TILE EFFECTS & WALLS LAYER]: Vẽ phân vùng phòng, dựng Tường (Vật cản) & Cửa ra vào
   */
  private handleRoomLayoutAdded(room: {
    id: string
    roomType: string
    name: string
    gridX: number
    gridY: number
    width: number
    height: number
    doorX?: number
    doorY?: number
  }) {
    this.handleRoomLayoutRemoved(room.id)

    let color = 0x38bdf8
    if (room.roomType === 'office') color = 0x4ade80
    if (room.roomType === 'lounge') color = 0xfb923c
    if (room.roomType === 'pantry') color = 0xc084fc

    // 1. Nền phòng bán trong suốt và nhãn tên phân vùng (Bỏ viền trắng nét bao quanh)
    const graphics = this.add.graphics().setDepth(3)
    graphics.fillStyle(color, 0.08)
    graphics.fillRect(room.gridX * 32, room.gridY * 32, room.width * 32, room.height * 32)

    const text = this.add
      .text(room.gridX * 32 + 8, room.gridY * 32 + 6, room.name, {
        fontFamily: 'Arial',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#000000cc',
        padding: { x: 5, y: 2 },
      })
      .setDepth(room.gridY * 32 + 50)

    this.roomZonesMap.set(room.id, { graphics, text })

    // 2. Tính toán Cửa và dựng Tường bao quanh chu vi (Auto-Tile Liền Mạch & Doorway)
    const doorX = room.doorX ?? Math.floor(room.gridX + room.width / 2)
    const doorY = room.doorY ?? (room.gridY + room.height - 1)

    const wallSprites: Phaser.GameObjects.GameObject[] = []
    const minX = room.gridX
    const maxX = room.gridX + room.width - 1
    const minY = room.gridY
    const maxY = room.gridY + room.height - 1

    const createWallTile = (x: number, y: number, frame: number) => {
      if (x === doorX && y === doorY) return
      const wall = this.obstaclesGroup.create(x * 32 + 16, y * 32 + 16, 'tiles_wall', frame)
      wall.setDepth(y * 32 + 16)
      wallSprites.push(wall)
    }

    // 1. Góc trên - trái (Top-left corner)
    createWallTile(minX, minY, 87)

    // 2. Cạnh trên (Top wall)
    for (let x = minX + 1; x < maxX; x++) {
      createWallTile(x, minY, 929)
    }

    // 3. Góc trên - phải (Top-right corner)
    createWallTile(maxX, minY, 89)

    // 4. Cạnh trái (Left vertical wall - Liền mạch thẳng đứng)
    for (let y = minY + 1; y < maxY; y++) {
      createWallTile(minX, y, 151)
    }

    // 5. Cạnh phải (Right vertical wall - Liền mạch thẳng đứng)
    for (let y = minY + 1; y < maxY; y++) {
      createWallTile(maxX, y, 153)
    }

    // 6. Góc dưới - trái (Bottom-left corner)
    createWallTile(minX, maxY, 215)

    // 7. Cạnh dưới (Bottom wall)
    for (let x = minX + 1; x < maxX; x++) {
      createWallTile(x, maxY, 216)
    }

    // 8. Góc dưới - phải (Bottom-right corner)
    createWallTile(maxX, maxY, 217)

    this.roomWallsMap.set(room.id, wallSprites)
    this.rebuildPathfinder()
  }

  private handleRoomLayoutRemoved(id: string) {
    const existing = this.roomZonesMap.get(id)
    if (existing) {
      existing.graphics.destroy()
      existing.text.destroy()
      this.roomZonesMap.delete(id)
    }

    const walls = this.roomWallsMap.get(id)
    if (walls) {
      walls.forEach((w) => {
        this.obstaclesGroup.remove(w, true, true)
      })
      this.roomWallsMap.delete(id)
      this.rebuildPathfinder()
    }
  }

  private getPlayerFacingDirection(): string {
    if (this.myPlayer?.anims?.currentAnim?.key) {
      const parts = this.myPlayer.anims.currentAnim.key.split('_')
      return parts[parts.length - 1]
    }
    return 'down'
  }

  private isItemInFacingDirection(item: any, direction: string): boolean {
    const dx = item.x - this.myPlayer.x
    const dy = item.y - this.myPlayer.y
    switch (direction) {
      case 'left':
        return dx < -8
      case 'right':
        return dx > 8
      case 'up':
        return dy < -8
      case 'down':
        return dy > 8
      default:
        return false
    }
  }

  private handleItemSelectorOverlap(playerSelector: any, selectionItem: any) {
    let currentItem = playerSelector.selectedItem as Item

    // Khi người chơi đang ngồi trên ghế (SITTING):
    // 1. Tuyệt đối không chọn lại ghế (bao gồm ghế đang ngồi hoặc các ghế xung quanh)
    // để nhường vùng tương tác 3x3 cho máy tính hoặc bảng trắng trên bàn
    if (this.myPlayer?.playerBehavior === PlayerBehavior.SITTING) {
      if (selectionItem.itemType === ItemType.CHAIR || selectionItem === (this.myPlayer as any).chairOnSit) {
        return
      }
      // 2. Nếu món đồ đang chọn trước đó là ghế (do vừa ngồi xuống), hãy xóa để nhường cho máy tính
      if (currentItem?.itemType === ItemType.CHAIR) {
        currentItem = undefined as any
        playerSelector.selectedItem = undefined
      }
    }

    if (currentItem) {
      if (currentItem === selectionItem) {
        return
      }

      // So sánh khoảng cách Euclid tới nhân vật: ưu tiên vật thể ở gần nhất
      const currentDist = Phaser.Math.Distance.Between(
        this.myPlayer.x,
        this.myPlayer.y,
        currentItem.x,
        currentItem.y
      )
      const newDist = Phaser.Math.Distance.Between(
        this.myPlayer.x,
        this.myPlayer.y,
        selectionItem.x,
        selectionItem.y
      )

      if (currentDist < newDist) {
        return
      }

      // Nếu 2 vật thể có cùng khoảng cách, ưu tiên vật thể nằm theo hướng nhìn của người chơi
      if (Math.abs(currentDist - newDist) < 1) {
        const playerDir = this.getPlayerFacingDirection()
        const isCurrentInFacing = this.isItemInFacingDirection(currentItem, playerDir)
        const isNewInFacing = this.isItemInFacingDirection(selectionItem, playerDir)
        if (isCurrentInFacing && !isNewInFacing) {
          return
        }
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
    const state = store.getState()
    if (state.workspace.designMode) {
      if (this.myPlayer) {
        if (this.myPlayer.visible) this.myPlayer.setVisible(false)
        if (this.myPlayer.playerContainer?.visible) this.myPlayer.playerContainer.setVisible(false)
      }
      return
    }

    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }
}
