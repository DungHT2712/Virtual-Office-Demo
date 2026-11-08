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
      MEDIUM: 900,
      LARGE: 1600,
    }
    const expectedArea = allowedAreas[sizeType]

    if (!expectedArea) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Kích cỡ không hợp lệ! Chỉ chấp nhận SMALL (400), MEDIUM (900), hoặc LARGE (1600).',
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
  }) {
    const { client, id, roomType, name, gridX, gridY, width, height, doorX, doorY } = data
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
  }
> {
  execute(data: {
    client: Client
    id: string
    itemType: string
    gridX: number
    gridY: number
    orientation?: number
  }) {
    let { client, id, itemType, gridX, gridY, orientation = 0 } = data
    const workspace = this.room.state.workspace

    if (gridX < 0 || gridY < 0 || gridX >= workspace.width || gridY >= workspace.height) {
      client.send(Message.DESIGN_ERROR, {
        message: `Vị trí (${gridX}, ${gridY}) nằm ngoài phạm vi Workspace (${workspace.width}x${workspace.height})!`,
      })
      return
    }

    const validItems = ['table', 'chair', 'computer', 'vase', 'whiteboard', 'vendingmachine', 'rug']
    const baseType = itemType.split(':')[0]
    if (!validItems.includes(baseType)) {
      client.send(Message.DESIGN_ERROR, {
        message: 'Loại vật dụng không hợp lệ.',
      })
      return
    }

    // Kiểm tra trùng lắp (Overlapping Rules):
    // 1. Thảm (Rug): Có thể trải dưới mọi vật thể khác, chỉ không chồng thảm lên thảm khác tại cùng ô.
    // 2. Máy tính (Computer): Có thể đặt trên Bàn hoặc đặt độc lập/trên thảm (1 ô không có 2 máy tính).
    // 3. Các vật thể khác (Table, Chair, Vase, Whiteboard, Vending Machine): Có thể đặt trên thảm hoặc ô trống.
    if (baseType === 'rug') {
      let hasRug = false
      this.room.state.furniture.forEach((f) => {
        if (f.gridX === gridX && f.gridY === gridY && f.id !== id && f.itemType.startsWith('rug')) {
          hasRug = true
        }
      })
      if (hasRug) {
        client.send(Message.DESIGN_ERROR, {
          message: 'Tại ô này đã có sẵn một tấm thảm khác!',
        })
        return
      }
    } else if (baseType === 'computer') {
      let hasTable = false
      let tableOrientation = 0
      let hasExistingComputer = false
      this.room.state.furniture.forEach((f) => {
        if (f.gridX === gridX && f.gridY === gridY) {
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
      // Hướng của máy tính luôn luôn khớp với hướng của bàn
      orientation = tableOrientation
    } else {
      let isOccupied = false
      this.room.state.furniture.forEach((f) => {
        if (f.gridX === gridX && f.gridY === gridY && f.id !== id) {
          const fBase = f.itemType.split(':')[0]
          if (fBase !== 'rug' && fBase !== 'computer') {
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

    let furniture = this.room.state.furniture.get(id)
    if (!furniture) {
      furniture = new FurnitureState()
      furniture.id = id
    }

    furniture.itemType = itemType
    furniture.gridX = gridX
    furniture.gridY = gridY
    furniture.orientation = orientation

    this.room.state.furniture.set(id, furniture)

    // Nếu đặt hoặc xoay Bàn làm việc, tự động xoay mọi máy tính đặt trên bàn đó theo đúng hướng bàn
    if (baseType === 'table') {
      this.room.state.furniture.forEach((f) => {
        if (f.itemType === 'computer' && f.gridX === gridX && f.gridY === gridY) {
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
        if (f.itemType === 'computer' && f.gridX === furniture.gridX && f.gridY === furniture.gridY) {
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
