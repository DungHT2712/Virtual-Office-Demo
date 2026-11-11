import { Schema, type } from '@colyseus/schema'
import { IRoomLayout } from '../../../types/IOfficeState'

export class RoomState extends Schema implements IRoomLayout {
  @type('string') id = ''
  @type('string') roomType = 'office'
  @type('string') name = 'Khu Làm Việc'
  @type('number') gridX = 0
  @type('number') gridY = 0
  @type('number') width = 10
  @type('number') height = 10
  @type('number') doorX = 0
  @type('number') doorY = 0
  @type('number') floor = 1
}
