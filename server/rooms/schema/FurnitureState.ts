import { Schema, type } from '@colyseus/schema'
import { IFurnitureItem } from '../../../types/IOfficeState'

export class FurnitureState extends Schema implements IFurnitureItem {
  @type('string') id = ''
  @type('string') itemType = 'table'
  @type('number') gridX = 0
  @type('number') gridY = 0
  @type('number') orientation = 0
  @type('string') itemDirection = 'down'
  @type('number') tint = 0xffffff
  @type('number') floor = 1
}
