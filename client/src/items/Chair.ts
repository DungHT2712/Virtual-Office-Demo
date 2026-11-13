import { ItemType } from '../../../types/Items'
import Item from './Item'

export default class Chair extends Item {
  itemDirection?: string = 'down'
  occupiedBy: string | null = null

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.itemType = ItemType.CHAIR
    this.name = 'chair'
    this.itemDirection = 'down'
    this.occupiedBy = null
  }

  setCustomColor(color: number) {
    super.setCustomColor(color)
  }

  onOverlapDialog() {
    if (this.occupiedBy) {
      this.clearDialogBox()
      return
    }
    this.setDialogBox('Press E to sit')
  }
}
