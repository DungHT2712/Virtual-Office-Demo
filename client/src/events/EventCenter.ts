import Phaser from 'phaser'

export const phaserEvents = new Phaser.Events.EventEmitter()

export enum Event {
  PLAYER_JOINED = 'player-joined',
  PLAYER_UPDATED = 'player-updated',
  PLAYER_LEFT = 'player-left',
  PLAYER_DISCONNECTED = 'player-disconnected',
  MY_PLAYER_READY = 'my-player-ready',
  MY_PLAYER_NAME_CHANGE = 'my-player-name-change',
  MY_PLAYER_STATUS_CHANGE = 'my-player-status-change',
  MY_PLAYER_TEXTURE_CHANGE = 'my-player-texture-change',
  MY_PLAYER_VIDEO_CONNECTED = 'my-player-video-connected',
  ITEM_USER_ADDED = 'item-user-added',
  ITEM_USER_REMOVED = 'item-user-removed',
  UPDATE_DIALOG_BUBBLE = 'update-dialog-bubble',
  WORKSPACE_UPDATED = 'workspace-updated',
  ROOM_LAYOUT_ADDED = 'room-layout-added',
  ROOM_LAYOUT_REMOVED = 'room-layout-removed',
  FURNITURE_PLACED = 'furniture-placed',
  FURNITURE_REMOVED = 'furniture-removed',
  DESIGN_MODE_TOGGLED = 'design-mode-toggled',
  OPEN_FURNITURE_DIALOG = 'open-furniture-dialog',
  OPEN_ROOM_DIALOG = 'open-room-dialog',
}
