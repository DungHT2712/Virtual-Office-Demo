import Phaser from 'phaser'
import MyPlayer from './MyPlayer'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import Item from '../items/Item'
import { NavKeys } from '../../../types/KeyboardState'
import store from '../stores'
export default class PlayerSelector extends Phaser.GameObjects.Zone {
  selectedItem?: Item

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height)

    scene.physics.add.existing(this)
  }

  update(player: MyPlayer, cursors: NavKeys) {
    if (!cursors) {
      return
    }

    // no need to update player selection while sitting
    if (player.playerBehavior === PlayerBehavior.SITTING) {
      return
    }

    // update player selection box position so that it's always in front of the player
    const { x, y } = player
    let joystickLeft = false
    let joystickRight = false
    let joystickUp = false
    let joystickDown = false
    if (player.joystickMovement?.isMoving) {
      joystickLeft = player.joystickMovement?.direction.left
      joystickRight = player.joystickMovement?.direction.right
      joystickUp = player.joystickMovement?.direction.up
      joystickDown = player.joystickMovement?.direction.down
    }

    let dir = ''
    const movementMode = store.getState().user.movementMode

    if (movementMode === 'mouse') {
      // Trong chế độ Mouse: Mở rộng vùng tương tác 360 độ quanh nhân vật (bán kính tương tác)
      // Giúp người chơi dù đứng hướng nào cũng có thể tương tác bấm E và R dễ dàng
      this.setPosition(x, y)
      ;(this.body as Phaser.Physics.Arcade.Body).setSize(64, 64)
      ;(this.body as Phaser.Physics.Arcade.Body).center.set(x, y)
    } else {
      ;(this.body as Phaser.Physics.Arcade.Body).setSize(16, 16)
      if (cursors.left?.isDown || cursors.A?.isDown || joystickLeft) {
        dir = 'left'
      } else if (cursors.right?.isDown || cursors.D?.isDown || joystickRight) {
        dir = 'right'
      } else if (cursors.up?.isDown || cursors.W?.isDown || joystickUp) {
        dir = 'up'
      } else if (cursors.down?.isDown || cursors.S?.isDown || joystickDown) {
        dir = 'down'
      } else if (player.anims?.currentAnim?.key) {
        // Lấy hướng nhìn từ animation hiện tại của nhân vật
        const parts = player.anims.currentAnim.key.split('_')
        dir = parts[parts.length - 1]
      }

      switch (dir) {
        case 'left':
          this.setPosition(x - 32, y)
          break
        case 'right':
          this.setPosition(x + 32, y)
          break
        case 'up':
          this.setPosition(x, y - 32)
          break
        case 'down':
        default:
          this.setPosition(x, y + 32)
          break
      }
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
