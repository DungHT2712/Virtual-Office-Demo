import Phaser from 'phaser'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { IAvatarCustomization } from '../../../types/IOfficeState'
import { ensureCustomAvatarTexture } from '../utils/AvatarCustomizer'
/**
 * shifting distance for sitting animation
 * format: direction: [xShift, yShift, depthShift]
 */
export const sittingShiftData = {
  up: [0, 3, -10],
  down: [0, 3, 1],
  left: [0, -8, 10],
  right: [0, -8, 10],
}

export function extractBaseCharacterName(textureOrAnim: string): string {
  if (!textureOrAnim) return 'adam'
  const firstPart = textureOrAnim.split('_')[0].toLowerCase()
  if (['adam', 'ash', 'lucy', 'nancy'].includes(firstPart)) {
    return firstPart
  }
  return 'adam'
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  playerId: string
  playerTexture: string
  characterName: string
  playerBehavior = PlayerBehavior.IDLE
  readyToConnect = false
  videoConnected = false
  playerName: Phaser.GameObjects.Text
  playerContainer: Phaser.GameObjects.Container
  private playerDialogBubble: Phaser.GameObjects.Container
  private timeoutID?: number
  avatarCustomization: IAvatarCustomization = {
    skinColor: '#f5cfa0',
    hairColor: '#4a3728',
    outfitType: 'casual',
    outfitColor: '#3b82f6',
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    id: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame)

    this.playerId = id
    this.characterName = extractBaseCharacterName(texture)
    this.playerTexture = texture
    this.setDepth(this.y)

    this.anims.play(`${this.playerTexture}_idle_down`, true)

    this.playerContainer = this.scene.add.container(this.x, this.y - 30).setDepth(5000)

    // add dialogBubble to playerContainer
    this.playerDialogBubble = this.scene.add.container(0, 0).setDepth(5000)
    this.playerContainer.add(this.playerDialogBubble)

    // add playerName to playerContainer
    this.playerName = this.scene.add
      .text(0, 0, '')
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5)
    this.playerContainer.add(this.playerName)

    // Sửa đổi 3: Loại bỏ Physics khỏi playerContainer để tránh trôi lệch khi nhân vật va chạm tường
  }

  updateDialogBubble(content: string) {
    this.clearDialogBubble()

    // preprocessing for dialog bubble text (maximum 70 characters)
    const dialogBubbleText = content.length <= 70 ? content : content.substring(0, 70).concat('...')

    const innerText = this.scene.add
      .text(0, 0, dialogBubbleText, { wordWrap: { width: 165, useAdvancedWrap: true } })
      .setFontFamily('Arial')
      .setFontSize(12)
      .setColor('#000000')
      .setOrigin(0.5)

    // set dialogBox slightly larger than the text in it
    const innerTextHeight = innerText.height
    const innerTextWidth = innerText.width

    innerText.setY(-innerTextHeight / 2 - this.playerName.height / 2)
    const dialogBoxWidth = innerTextWidth + 10
    const dialogBoxHeight = innerTextHeight + 3
    const dialogBoxX = innerText.x - innerTextWidth / 2 - 5
    const dialogBoxY = innerText.y - innerTextHeight / 2 - 2

    this.playerDialogBubble.add(
      this.scene.add
        .graphics()
        .fillStyle(0xffffff, 1)
        .fillRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 3)
        .lineStyle(1, 0x000000, 1)
        .strokeRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 3)
    )
    this.playerDialogBubble.add(innerText)

    // After 6 seconds, clear the dialog bubble
    this.timeoutID = window.setTimeout(() => {
      this.clearDialogBubble()
    }, 6000)
  }

  refreshCustomTexture() {
    this.playerTexture = ensureCustomAvatarTexture(
      this.scene,
      this.characterName,
      this.avatarCustomization
    )
    this.setTexture(this.playerTexture)
    if (this.anims.currentAnim) {
      const parts = this.anims.currentAnim.key.split('_')
      const animSuffix = parts.slice(parts.length - 2).join('_')
      const newAnimKey = `${this.playerTexture}_${animSuffix}`
      if (this.anims.currentAnim.key !== newAnimKey && this.scene.anims.exists(newAnimKey)) {
        this.anims.play(newAnimKey, true)
      }
    }
  }

  applyAppearance(baseCharacter: string, config: IAvatarCustomization) {
    this.characterName = extractBaseCharacterName(baseCharacter)
    this.avatarCustomization = { ...config }
    this.refreshCustomTexture()
  }

  private clearDialogBubble() {
    clearTimeout(this.timeoutID)
    this.playerDialogBubble.removeAll(true)
  }
}
