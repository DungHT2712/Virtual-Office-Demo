import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'
import { Message } from '../../../types/Messages'
import { RoomState } from '../schema/RoomState'
import { FurnitureState } from '../schema/FurnitureState'
import { Computer, Whiteboard } from '../schema/OfficeState'

export class ResizeWorkspaceCommand extends Command<
  IOfficeState,
  { client: Client; width: number; height: number; sizeType: string }
> {
  execute(data: { client: Client; width: number; height: number; sizeType: string }) {
    const { client, width, height, sizeType } = data
    const allowedAreas: Record<string, number> = {
      SMALL: 400,
      MEDIUM: 2500,
      LARGE: 4900,
      XLARGE: 10000,
    }
    const expectedArea = allowedAreas[sizeType]

    if (!expectedArea) {
      client.send(Message.DESIGN_ERROR, {
        message:
          'Kích cỡ không hợp lệ! Chỉ chấp nhận SMALL (400), MEDIUM (2500), LARGE (4900), hoặc XLARGE (10000).',
      })
      return
    }

    if (width * height !== expectedArea) {
      client.send(Message.DESIGN_ERROR, {
        message: `Kích thước ${width}x${height} (${width * height} ô) không khớp với diện tích yêu cầu (${expectedArea} ô)!`,
      })
      return
    }

    if (width < 5 || height < 5) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Chiều dài và chiều rộng tối thiểu phải từ 5 ô trở lên.',
      })
      return
    }

    this.room.state.workspace.width = width
    this.room.state.workspace.height = height
    this.room.state.workspace.sizeType = sizeType
  }
}

export class UpdateRoomCommand extends Command<
  IOfficeState,
  {
    client: Client
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
> {
  execute(data: {
    client: Client
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
  }) {
    const { client, id, roomType, name, gridX, gridY, width, height, doorX, doorY, floor = 1 } = data
    const workspace = this.room.state.workspace

    if (gridX < 0 || gridY < 0 || width <= 0 || height <= 0) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Toạ độ hoặc kích thước phòng không hợp lệ.',
      })
      return
    }

    if (gridX + width > workspace.width || gridY + height > workspace.height) {
      client.send(Message.DESIGN_ERROR, {
        message: `Phòng vượt quá giới hạn Workspace (${workspace.width}x${workspace.height})!`,
      })
      return
    }

    const validTypes = ['lounge', 'meeting', 'office', 'pantry']
    if (!validTypes.includes(roomType)) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Loại phòng không hợp lệ (lounge, meeting, office, pantry).',
      })
      return
    }

    let room = this.room.state.mapRooms.get(id)
    if (!room) {
      room = new RoomState()
      room.id = id
    }

    room.roomType = roomType
    room.name = name || 'Room'
    room.gridX = gridX
    room.gridY = gridY
    room.width = width
    room.height = height
    room.doorX = doorX ?? Math.floor(gridX + width / 2)
    room.doorY = doorY ?? (gridY + height - 1)
    room.floor = floor

    this.room.state.mapRooms.set(id, room)
  }
}

export class RemoveRoomCommand extends Command<IOfficeState, { client: Client; id: string }> {
  execute(data: { client: Client; id: string }) {
    this.room.state.mapRooms.delete(data.id)
  }
}

export class PlaceFurnitureCommand extends Command<
  IOfficeState,
  {
    client: Client
    id: string
    itemType: string
    gridX: number
    gridY: number
    orientation?: number
    itemDirection?: string
    tint?: number
    floor?: number
  }
> {
  execute(data: {
    client: Client
    id: string
    itemType: string
    gridX: number
    gridY: number
    orientation?: number
    itemDirection?: string
    tint?: number
    floor?: number
  }) {
    let { client, id, itemType, gridX, gridY, orientation = 0, itemDirection = 'down', tint = 0xffffff, floor = 1 } = data
    const workspace = this.room.state.workspace

    if (gridX < 0 || gridY < 0 || gridX >= workspace.width || gridY >= workspace.height) {
      client.send(Message.DESIGN_ERROR, {
        message: `Vị trí (${gridX}, ${gridY}) nằm ngoài phạm vi Workspace (${workspace.width}x${workspace.height})!`,
      })
      return
    }

    const validItems = [
      'table',
      'chair',
      'computer',
      'vase',
      'whiteboard',
      'rug',
      'wall',
      'grass',
      'tree_large',
      'tree_small',
      'bush',
    ]
    const baseType = itemType.split(':')[0]
    if (!validItems.includes(baseType)) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Loại vật dụng không hợp lệ.',
      })
      return
    }

    // Kiểm tra trùng lắp (Overlapping Rules) trên cùng một tầng:
    const isGround = baseType === 'rug' || baseType === 'grass'
    if (isGround) {
      let hasGround = false
      this.room.state.furniture.forEach((f) => {
        if (
          f.gridX === gridX &&
          f.gridY === gridY &&
          (f.floor || 1) === floor &&
          f.id !== id &&
          (f.itemType.startsWith('rug') || f.itemType.startsWith('grass'))
        ) {
          hasGround = true
        }
      })
      if (hasGround) {
        client.send(Message.DESIGN_ERROR, {
          message: 'Tại ô này đã có sẵn một tấm thảm hoặc thảm cỏ!',
        })
        return
      }
    } else if (baseType === 'computer') {
      let hasTable = false
      let tableOrientation = 0
      let hasExistingComputer = false
      this.room.state.furniture.forEach((f) => {
        if (f.gridX === gridX && f.gridY === gridY && (f.floor || 1) === floor) {
          if (f.itemType === 'table') {
            hasTable = true
            tableOrientation = f.orientation || 0
          }
          if (f.itemType === 'computer' && f.id !== id) hasExistingComputer = true
        }
      })
      if (!hasTable) {
        client.send(Message.DESIGN_ERROR, {
          message: 'Máy tính bắt buộc phải được đặt trên Bàn! Hãy đặt Bàn tại ô này trước.',
        })
        return
      }
      if (hasExistingComputer) {
        client.send(Message.DESIGN_ERROR, {
          message: 'Bàn tại vị trí này đã có sẵn một máy tính!',
        })
        return
      }
      orientation = tableOrientation
    } else {
      let isOccupied = false
      this.room.state.furniture.forEach((f) => {
        if (f.gridX === gridX && f.gridY === gridY && (f.floor || 1) === floor && f.id !== id) {
          const fBase = f.itemType.split(':')[0]
          if (fBase !== 'rug' && fBase !== 'grass' && fBase !== 'computer') {
            isOccupied = true
          }
        }
      })

      if (isOccupied) {
        client.send(Message.DESIGN_ERROR, {
          message: `Toạ độ (${gridX}, ${gridY}) đã có vật dụng khác chiếm chỗ!`,
        })
        return
      }
    }

    const chairDirections = ['down', 'left', 'up', 'right']
    if (baseType === 'chair') {
      itemDirection = chairDirections[((orientation % 4) + 4) % 4]
    }

    let furniture = this.room.state.furniture.get(id)
    if (!furniture) {
      furniture = new FurnitureState()
      furniture.id = id
    }

    furniture.itemType = itemType
    furniture.gridX = gridX
    furniture.gridY = gridY
    furniture.orientation = orientation
    furniture.itemDirection = itemDirection
    furniture.tint = tint
    furniture.floor = floor

    this.room.state.furniture.set(id, furniture)

    // Nếu đặt hoặc xoay Bàn làm việc, tự động xoay mọi máy tính đặt trên bàn đó theo đúng hướng bàn
    if (baseType === 'table') {
      this.room.state.furniture.forEach((f) => {
        if (f.itemType === 'computer' && f.gridX === gridX && f.gridY === gridY && (f.floor || 1) === floor) {
          f.orientation = orientation
        }
      })
    } else if (baseType === 'computer') {
      this.room.state.furniture.forEach((f) => {
        if (f.itemType === 'table' && f.gridX === gridX && f.gridY === gridY && (f.floor || 1) === floor) {
          f.orientation = orientation
        }
      })
    }

    // Ensure interactive computers & whiteboards have matching schema entries for WebRTC
    if (itemType === 'computer' && !this.room.state.computers.has(id)) {
      this.room.state.computers.set(id, new Computer())
    }
    if (itemType === 'whiteboard' && !this.room.state.whiteboards.has(id)) {
      this.room.state.whiteboards.set(id, new Whiteboard())
    }
  }
}

export class RemoveFurnitureCommand extends Command<IOfficeState, { client: Client; id: string }> {
  execute(data: { client: Client; id: string }) {
    const furniture = this.room.state.furniture.get(data.id)
    if (!furniture) return

    // Cascade remove computer if its table is removed
    if (furniture.itemType === 'table') {
      const computersToRemove: string[] = []
      this.room.state.furniture.forEach((f, key) => {
        if (
          f.itemType === 'computer' &&
          f.gridX === furniture.gridX &&
          f.gridY === furniture.gridY &&
          (f.floor || 1) === (furniture.floor || 1)
        ) {
          computersToRemove.push(key)
        }
      })
      computersToRemove.forEach((key) => {
        this.room.state.furniture.delete(key)
        if (this.room.state.computers.has(key)) {
          this.room.state.computers.delete(key)
        }
      })
    }

    if (furniture.itemType === 'computer' && this.room.state.computers.has(data.id)) {
      this.room.state.computers.delete(data.id)
    }
    if (furniture.itemType === 'whiteboard' && this.room.state.whiteboards.has(data.id)) {
      this.room.state.whiteboards.delete(data.id)
    }

    this.room.state.furniture.delete(data.id)
  }
}

export class CreateFloorCommand extends Command<
  IOfficeState,
  { client: Client; gridX: number; gridY: number }
> {
  execute(data: { client: Client; gridX: number; gridY: number }) {
    const { client, gridX, gridY } = data
    const workspace = this.room.state.workspace

    if (gridX < 0 || gridY < 0 || gridX >= workspace.width || gridY >= workspace.height) {
      client.send(Message.DESIGN_ERROR, {
        message: `Vị trí đặt cửa (${gridX}, ${gridY}) nằm ngoài phạm vi Workspace!`,
      })
      return
    }

    let config: {
      floors: { floorNumber: number; name: string }[]
      doors: { id: string; fromFloor: number; toFloor: number; gridX: number; gridY: number }[]
    }
    try {
      config = JSON.parse(workspace.floorsConfig || '{"floors":[],"doors":[]}')
    } catch {
      config = { floors: [{ floorNumber: 1, name: 'Tầng 1' }], doors: [] }
    }

    if (!config.floors || config.floors.length === 0) {
      config.floors = [{ floorNumber: 1, name: 'Tầng 1' }]
    }

    const existingNumbers = config.floors.map((f) => f.floorNumber).sort((a, b) => a - b)
    const maxFloor = existingNumbers[existingNumbers.length - 1]
    const newFloorNumber = maxFloor + 1

    // Kiểm tra ô này có bị trùng với cửa tầng khác trên maxFloor không
    const hasDoorHere = config.doors.some(
      (d) =>
        (d.fromFloor === maxFloor || d.toFloor === maxFloor) &&
        d.gridX === gridX &&
        d.gridY === gridY
    )
    if (hasDoorHere) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Tại ô này đã có sẵn một cửa tầng khác!',
      })
      return
    }

    // Thêm tầng mới
    config.floors.push({
      floorNumber: newFloorNumber,
      name: `Tầng ${newFloorNumber}`,
    })

    // Thêm cửa tầng (vị trí giống nhau giữa tầng cũ và tầng mới)
    config.doors.push({
      id: `door_${maxFloor}_${newFloorNumber}`,
      fromFloor: maxFloor,
      toFloor: newFloorNumber,
      gridX,
      gridY,
    })

    workspace.floorsConfig = JSON.stringify(config)
  }
}

export class DeleteFloorCommand extends Command<
  IOfficeState,
  { client: Client; floorNumber: number }
> {
  execute(data: { client: Client; floorNumber: number }) {
    const { client, floorNumber } = data
    const workspace = this.room.state.workspace

    let config: {
      floors: { floorNumber: number; name: string }[]
      doors: { id: string; fromFloor: number; toFloor: number; gridX: number; gridY: number }[]
    }
    try {
      config = JSON.parse(workspace.floorsConfig || '{"floors":[],"doors":[]}')
    } catch {
      config = { floors: [{ floorNumber: 1, name: 'Tầng 1' }], doors: [] }
    }

    if (config.floors.length <= 1) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Không thể xóa tầng! Workspace phải có tối thiểu 1 tầng.',
      })
      return
    }

    const floorExists = config.floors.some((f) => f.floorNumber === floorNumber)
    if (!floorExists) {
      client.send(Message.DESIGN_ERROR, {
        message: `Tầng ${floorNumber} không tồn tại!`,
      })
      return
    }

    // Yêu cầu: "khi xóa thì vị trí cửa cũng mất, và tầng dưới sẽ lấy vị trí cửa của tầng trên nhé,
    // ví dụ có 3 tầng, nếu xóa tầng 2 thì cửa từ tầng 1 lên 2 sẽ mất, cửa tầng 1 lên 3 sẽ lấy vị trí cửa tầng 2 lên 3"
    const doorBelow = config.doors.find((d) => d.toFloor === floorNumber)
    const doorAbove = config.doors.find((d) => d.fromFloor === floorNumber)

    // Xóa tất cả các cửa gắn với tầng bị xóa
    config.doors = config.doors.filter(
      (d) => d.fromFloor !== floorNumber && d.toFloor !== floorNumber
    )

    // Nếu có cả tầng dưới và tầng trên, tạo cửa nối giữa tầng dưới và tầng trên
    // Vị trí cửa lấy theo vị trí của cửa tầng trên (doorAbove)
    if (doorBelow && doorAbove) {
      config.doors.push({
        id: `door_${doorBelow.fromFloor}_${doorAbove.toFloor}`,
        fromFloor: doorBelow.fromFloor,
        toFloor: doorAbove.toFloor,
        gridX: doorAbove.gridX,
        gridY: doorAbove.gridY,
      })
    }

    config.floors = config.floors.filter((f) => f.floorNumber !== floorNumber)
    workspace.floorsConfig = JSON.stringify(config)

    // Xóa nội thất và phòng thuộc tầng bị xóa
    const furnToDelete: string[] = []
    this.room.state.furniture.forEach((f, key) => {
      if ((f.floor || 1) === floorNumber) {
        furnToDelete.push(key)
      }
    })
    furnToDelete.forEach((key) => this.room.state.furniture.delete(key))

    const roomsToDelete: string[] = []
    this.room.state.mapRooms.forEach((r, key) => {
      if ((r.floor || 1) === floorNumber) {
        roomsToDelete.push(key)
      }
    })
    roomsToDelete.forEach((key) => this.room.state.mapRooms.delete(key))

    // Nếu có người chơi đang ở tầng bị xóa, chuyển về tầng đầu tiên còn lại
    const remainingFirstFloor = config.floors[0]?.floorNumber || 1
    this.room.state.players.forEach((p) => {
      if ((p.floor || 1) === floorNumber) {
        p.floor = remainingFirstFloor
      }
    })
  }
}

export class UpdateFloorDoorCommand extends Command<
  IOfficeState,
  { client: Client; doorId: string; gridX: number; gridY: number }
> {
  execute(data: { client: Client; doorId: string; gridX: number; gridY: number }) {
    const { client, doorId, gridX, gridY } = data
    const workspace = this.room.state.workspace

    if (gridX < 0 || gridY < 0 || gridX >= workspace.width || gridY >= workspace.height) {
      client.send(Message.DESIGN_ERROR, {
        message: `Vị trí cửa (${gridX}, ${gridY}) nằm ngoài phạm vi Workspace!`,
      })
      return
    }

    let config: {
      floors: { floorNumber: number; name: string }[]
      doors: { id: string; fromFloor: number; toFloor: number; gridX: number; gridY: number }[]
    }
    try {
      config = JSON.parse(workspace.floorsConfig || '{"floors":[],"doors":[]}')
    } catch {
      config = { floors: [{ floorNumber: 1, name: 'Tầng 1' }], doors: [] }
    }

    const door = config.doors.find((d) => d.id === doorId)
    if (!door) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Không tìm thấy cửa tầng cần cập nhật!',
      })
      return
    }

    door.gridX = gridX
    door.gridY = gridY
    workspace.floorsConfig = JSON.stringify(config)
  }
}

export class SwitchPlayerFloorCommand extends Command<
  IOfficeState,
  { client: Client; floor: number; x?: number; y?: number }
> {
  execute(data: { client: Client; floor: number; x?: number; y?: number }) {
    const { client, floor, x, y } = data
    const player = this.room.state.players.get(client.sessionId)
    if (!player) return
    player.floor = floor
    if (x !== undefined && y !== undefined) {
      player.x = x
      player.y = y
    }
  }
}
