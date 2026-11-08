import Phaser from 'phaser'
import MyPlayer from './MyPlayer'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import Item from '../items/Item'
import { NavKeys } from '../../../types/KeyboardState'

export default class PlayerSelector extends Phaser.GameObjects.Zone {
  selectedItem?: Item

  constructor(scene: Phaser.Scene, x: number, y: number, width = 96, height = 96) {
    super(scene, x, y, width, height)

    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.setSize(width, height)
      body.center.set(x, y)
    }
  }

  update(player: MyPlayer, cursors: NavKeys) {
    if (!cursors) {
      return
    }

    // [PHẠM VI TƯƠNG TÁC 3x3 Ô (96px x 96px, 1 tile = 32px)]:
    // Tâm vùng tương tác luôn bám sát vị trí nhân vật (player.x, player.y).
    // Kể cả khi đang ngồi ghế hay đang đứng, vùng 3x3 này giúp người chơi luôn tương tác được
    // với máy tính (R) hoặc bảng trắng (R) đặt trên bàn làm việc xung quanh.
    const { x, y } = player
    this.setPosition(x, y)
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.setSize(96, 96)
      body.center.set(x, y)
    }

    // while currently selecting an item,
    // if the selector and selection item stop overlapping, clear the dialog box and selected item
    if (this.selectedItem) {
      if (!this.scene.physics.overlap(this, this.selectedItem)) {
        this.selectedItem.clearDialogBox()
        this.selectedItem = undefined
      }
    }
  }
}

