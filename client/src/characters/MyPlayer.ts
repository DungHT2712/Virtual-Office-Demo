import Phaser from 'phaser'
import PlayerSelector from './PlayerSelector'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { sittingShiftData } from './Player'
import Player from './Player'
import Network from '../services/Network'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'

import { phaserEvents, Event } from '../events/EventCenter'
import store from '../stores'
import { pushPlayerJoinedMessage } from '../stores/ChatStore'
import { ItemType } from '../../../types/Items'
import { NavKeys } from '../../../types/KeyboardState'
import { JoystickMovement } from '../components/Joystick'
import { openURL } from '../utils/helpers'
import { GridPoint } from '../utils/Pathfinder'
import { IAvatarCustomization } from '../../../types/IOfficeState'

export default class MyPlayer extends Player {
  private chairOnSit?: Chair
  public joystickMovement?: JoystickMovement
  private pathWaypoints: GridPoint[] = []

  public virtualButtonE: boolean = false
  public virtualButtonR: boolean = false
  public playerSelector?: PlayerSelector

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, id, frame)
    // Đã gỡ bỏ playContainerBody
  }

  setPlayerName(name: string) {
    this.playerName.setText(name)
    phaserEvents.emit(Event.MY_PLAYER_NAME_CHANGE, name)
    store.dispatch(pushPlayerJoinedMessage(name))
  }

  setPlayerTexture(texture: string) {
    this.playerTexture = texture
    this.anims.play(`${this.playerTexture}_idle_down`, true)
    phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  setMovePath(waypoints: GridPoint[]) {
    if (this.playerBehavior === PlayerBehavior.SITTING) return
    this.pathWaypoints = waypoints
  }

  clearMovePath() {
    this.pathWaypoints = []
  }

  setCharacterCustomization(texture: string, config: IAvatarCustomization) {
    this.applyAppearance(texture, config)
    this.anims.play(`${this.playerTexture}_idle_down`, true)
    phaserEvents.emit(Event.MY_PLAYER_TEXTURE_CHANGE, this.x, this.y, this.anims.currentAnim.key)
  }

  handleJoystickMovement(movement: JoystickMovement) {
    this.joystickMovement = movement
  }

  public sitOnChair(chairItem: Chair, network: Network) {
    this.clearMovePath()
    this.scene.time.addEvent({
      delay: 10,
      callback: () => {
        this.setVelocity(0, 0)
        if (chairItem.itemDirection) {
          this.setPosition(
            chairItem.x + sittingShiftData[chairItem.itemDirection][0],
            chairItem.y + sittingShiftData[chairItem.itemDirection][1]
          ).setDepth(chairItem.depth + sittingShiftData[chairItem.itemDirection][2])
          this.playerContainer.setPosition(
            chairItem.x + sittingShiftData[chairItem.itemDirection][0],
            chairItem.y + sittingShiftData[chairItem.itemDirection][1] - 30
          )
        }

        this.play(`${this.playerTexture}_sit_${chairItem.itemDirection}`, true)
        if (this.playerSelector) {
          this.playerSelector.setPosition(this.x, this.y)
          const body = this.playerSelector.body as Phaser.Physics.Arcade.Body
          if (body) {
            body.setSize(96, 96)
            body.center.set(this.x, this.y)
          }
        }
        network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
      },
      loop: false,
    })
    chairItem.clearDialogBox()
    chairItem.setDialogBox('Press E to leave')
    this.chairOnSit = chairItem
    this.playerBehavior = PlayerBehavior.SITTING
    if (this.playerSelector) this.playerSelector.selectedItem = undefined
  }

  public standUpFromChair(network: Network) {
    const parts = this.anims.currentAnim.key.split('_')
    parts[parts.length - 2] = 'idle'
    this.play(parts.join('_'), true)
    this.playerBehavior = PlayerBehavior.IDLE
    this.chairOnSit?.clearDialogBox()
    this.chairOnSit = undefined
    if (this.playerSelector) {
      this.playerSelector.setPosition(this.x, this.y)
    }
    network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
  }

  public interactE(network: Network) {
    if (this.playerBehavior === PlayerBehavior.SITTING) {
      this.standUpFromChair(network)
      return
    }

    let chairItem = this.playerSelector?.selectedItem
    if (!chairItem || chairItem.itemType !== ItemType.CHAIR) {
      const gameScene = this.scene as any
      if (gameScene?.chairsGroup) {
        let closestChair: Chair | null = null
        let minDist = 80
        gameScene.chairsGroup.getChildren().forEach((c: any) => {
          const ch = c as Chair
          const dist = Phaser.Math.Distance.Between(this.x, this.y, ch.x, ch.y)
          if (dist < minDist) {
            minDist = dist
            closestChair = ch
          }
        })
        if (closestChair) chairItem = closestChair
      }
    }

    if (chairItem && chairItem.itemType === ItemType.CHAIR) {
      this.sitOnChair(chairItem as Chair, network)
    }
  }

  public interactR(network: Network) {
    let targetItem = this.playerSelector?.selectedItem

    // Nếu targetItem không phải là COMPUTER hay WHITEBOARD (ví dụ đang là CHAIR hoặc null),
    // tự động tìm Computer hoặc Whiteboard gần nhất trong bán kính 3x3 (80px)
    if (!targetItem || (targetItem.itemType !== ItemType.COMPUTER && targetItem.itemType !== ItemType.WHITEBOARD)) {
      const gameScene = this.scene as any
      let closestItem: Item | null = null
      let minDist = 80

      if (gameScene?.computersGroup) {
        gameScene.computersGroup.getChildren().forEach((c: any) => {
          const comp = c as Computer
          const dist = Phaser.Math.Distance.Between(this.x, this.y, comp.x, comp.y)
          if (dist < minDist) {
            minDist = dist
            closestItem = comp
          }
        })
      }

      if (!closestItem && gameScene?.whiteboardsGroup) {
        gameScene.whiteboardsGroup.getChildren().forEach((w: any) => {
          const wb = w as Whiteboard
          const dist = Phaser.Math.Distance.Between(this.x, this.y, wb.x, wb.y)
          if (dist < minDist) {
            minDist = dist
            closestItem = wb
          }
        })
      }

      if (closestItem) {
        targetItem = closestItem
      }
    }

    switch (targetItem?.itemType) {
      case ItemType.COMPUTER:
        const computer = targetItem as Computer
        computer.openDialog(this.playerId, network)
        break
      case ItemType.WHITEBOARD:
        const whiteboard = targetItem as Whiteboard
        whiteboard.openDialog(network)
        break
      case ItemType.VENDINGMACHINE:
        const url = 'https://www.buymeacoffee.com/skyoffice'
        openURL(url)
        break
    }
  }

  update(
    playerSelector: PlayerSelector,
    cursors: NavKeys,
    keyE: Phaser.Input.Keyboard.Key,
    keyR: Phaser.Input.Keyboard.Key,
    network: Network
  ) {
    this.playerSelector = playerSelector
    if (!cursors) return

    const item = playerSelector.selectedItem

    const isEJustDown = Phaser.Input.Keyboard.JustDown(keyE) || this.virtualButtonE
    const isRJustDown = Phaser.Input.Keyboard.JustDown(keyR) || this.virtualButtonR

    this.virtualButtonE = false
    this.virtualButtonR = false

    if (isRJustDown) {
      this.interactR(network)
    }

    switch (this.playerBehavior) {
      case PlayerBehavior.IDLE:
        // if press E in front of selected chair
        if (isEJustDown) {
          this.interactE(network)
          return
        }

        const movementMode = store.getState().user.movementMode

        let isManualMoving = false
        const speed = 200
        let vx = 0
        let vy = 0

        if (movementMode === 'wasd') {
          if (cursors.left?.isDown || cursors.A?.isDown) { vx -= speed; isManualMoving = true }
          if (cursors.right?.isDown || cursors.D?.isDown) { vx += speed; isManualMoving = true }
          if (cursors.up?.isDown || cursors.W?.isDown) { vy -= speed; isManualMoving = true; this.setDepth(this.y) }
          if (cursors.down?.isDown || cursors.S?.isDown) { vy += speed; isManualMoving = true; this.setDepth(this.y) }
        } else if (movementMode === 'joystick' && this.joystickMovement?.isMoving) {
          isManualMoving = true
          if (this.joystickMovement.direction.left) vx -= speed
          if (this.joystickMovement.direction.right) vx += speed
          if (this.joystickMovement.direction.up) { vy -= speed; this.setDepth(this.y) }
          if (this.joystickMovement.direction.down) { vy += speed; this.setDepth(this.y) }
        }

        if (isManualMoving) {
          this.clearMovePath()
          this.body.velocity.setLength(speed)
          this.setVelocity(vx, vy)

          // update animation according to velocity and send new location and anim to server
          if (vx !== 0 || vy !== 0) network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          if (vx > 0) {
            this.play(`${this.playerTexture}_run_right`, true)
          } else if (vx < 0) {
            this.play(`${this.playerTexture}_run_left`, true)
          } else if (vy > 0) {
            this.play(`${this.playerTexture}_run_down`, true)
          } else if (vy < 0) {
            this.play(`${this.playerTexture}_run_up`, true)
          } else {
            const parts = this.anims.currentAnim.key.split('_')
            parts[parts.length - 2] = 'idle'
            const newAnim = parts.join('_')
            // this prevents idle animation keeps getting called
            if (this.anims.currentAnim.key !== newAnim) {
              this.play(parts.join('_'), true)
              // send new location and anim to server
              network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
            }
          }
        } else if (this.pathWaypoints.length > 0 && movementMode === 'mouse') {
          const target = this.pathWaypoints[0]
          const dx = target.x - this.x
          const dy = target.y - (this.y + this.height * 0.25)
          const dist = Math.hypot(dx, dy)
          const isFinal = this.pathWaypoints.length === 1
          const reachThreshold = isFinal ? 8 : 12

          if (dist <= reachThreshold) {
            this.pathWaypoints.shift()
            if (this.pathWaypoints.length === 0) {
              this.setPosition(target.x, target.y - this.height * 0.25)
              this.setVelocity(0, 0)
              const parts = this.anims.currentAnim.key.split('_')
              parts[parts.length - 2] = 'idle'
              this.play(parts.join('_'), true)
              network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
            }
          } else {
            const speed = 200
            const vx = (dx / dist) * speed
            const vy = (dy / dist) * speed
            this.setVelocity(vx, vy)
            this.setDepth(this.y)

            if (Math.abs(vx) > Math.abs(vy)) {
              if (vx > 0) {
                this.play(`${this.playerTexture}_run_right`, true)
              } else {
                this.play(`${this.playerTexture}_run_left`, true)
              }
            } else {
              if (vy > 0) {
                this.play(`${this.playerTexture}_run_down`, true)
              } else {
                this.play(`${this.playerTexture}_run_up`, true)
              }
            }
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          }
        } else {
          this.setVelocity(0, 0)
          const parts = this.anims.currentAnim.key.split('_')
          parts[parts.length - 2] = 'idle'
          const newAnim = parts.join('_')
          if (this.anims.currentAnim.key !== newAnim) {
            this.play(parts.join('_'), true)
            network.updatePlayer(this.x, this.y, this.anims.currentAnim.key)
          }
        }

        // Sửa đổi 3.1: Neo cứng tọa độ của tên theo tọa độ hiện tại của nhân vật
        this.playerContainer.setPosition(this.x, this.y - 30)
        break

      case PlayerBehavior.SITTING:
        // back to idle if player press E while sitting
        if (isEJustDown) {
          this.standUpFromChair(network)
        }
        break
    }
  }
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      myPlayer(x: number, y: number, texture: string, id: string, frame?: string | number): MyPlayer
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'myPlayer',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    const sprite = new MyPlayer(this.scene, x, y, texture, id, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      )

    return sprite
  }
)
