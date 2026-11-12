import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sanitizeId } from '../util'
import { BackgroundMode } from '../../../types/BackgroundMode'
import { OutfitType } from '../../../types/IOfficeState'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

export interface UserCustomizationState {
  skinColor: string
  hairColor: string
  outfitType: OutfitType
  outfitColor: string
}

export interface UserStatus {
  id: string
  name: string
  color: string
}

export const DEFAULT_STATUSES: UserStatus[] = [
  { id: 'available', name: 'Sẵn sàng', color: '#107c41' },
  { id: 'busy', name: 'Bận', color: '#c4314b' },
  { id: 'dnd', name: 'Đừng làm phiền', color: '#a4262c' },
  { id: 'brb', name: 'Quay lại ngay', color: '#d83b01' },
  { id: 'away', name: 'Đi vắng', color: '#ffaa44' },
  { id: 'offline', name: 'Ngoại tuyến', color: '#8a8886' },
]

export function getStoredStatuses(): UserStatus[] {
  try {
    const raw = localStorage.getItem('skyoffice_statuses')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to parse stored statuses', e)
  }
  return DEFAULT_STATUSES
}

export function getInitialBackgroundMode() {
  const currentHour = new Date().getHours()
  return currentHour > 6 && currentHour <= 18 ? BackgroundMode.DAY : BackgroundMode.NIGHT
}

export type MovementMode = 'mouse' | 'wasd' | 'joystick'

// Đọc thông tin đã lưu trữ trước đó từ localStorage (Persistent Character Profile)
const storedName = localStorage.getItem('skyoffice_player_name') || 'Guest'
const storedAvatar = localStorage.getItem('skyoffice_avatar') || 'adam'
const storedSkin = localStorage.getItem('skyoffice_skin_color') || '#f5cfa0'
const storedHair = localStorage.getItem('skyoffice_hair_color') || '#4a3728'
let rawOutfit = localStorage.getItem('skyoffice_outfit_type') || 'casual'
if (rawOutfit === 'suit') rawOutfit = 'worker'
if (rawOutfit === 'dress') rawOutfit = 'casual'
const storedOutfitType: OutfitType = rawOutfit === 'worker' ? 'worker' : 'casual'
const storedOutfitColor = localStorage.getItem('skyoffice_outfit_color') || '#3b82f6'

const initialStatuses = getStoredStatuses()
const storedStatusId = localStorage.getItem('skyoffice_current_status_id')
const initialCurrentStatus =
  initialStatuses.find((s) => s.id === storedStatusId) || initialStatuses[0]

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    backgroundMode: getInitialBackgroundMode(),
    sessionId: '',
    videoConnected: false,
    loggedIn: false,
    playerNameMap: new Map<string, string>(),
    showJoystick: window.innerWidth < 650,
    movementMode: (window.innerWidth < 650 ? 'joystick' : 'mouse') as MovementMode,
    playerName: storedName,
    avatar: storedAvatar,
    skinColor: storedSkin,
    hairColor: storedHair,
    outfitType: storedOutfitType,
    outfitColor: storedOutfitColor,
    statuses: initialStatuses,
    currentStatus: initialCurrentStatus,
  },
  reducers: {
    toggleBackgroundMode: (state) => {
      const newMode =
        state.backgroundMode === BackgroundMode.DAY ? BackgroundMode.NIGHT : BackgroundMode.DAY

      state.backgroundMode = newMode
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.changeBackgroundMode(newMode)
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    setVideoConnected: (state, action: PayloadAction<boolean>) => {
      state.videoConnected = action.payload
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload
    },
    setPlayerNameMap: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.playerNameMap.set(sanitizeId(action.payload.id), action.payload.name)
    },
    removePlayerNameMap: (state, action: PayloadAction<string>) => {
      state.playerNameMap.delete(sanitizeId(action.payload))
    },
    setShowJoystick: (state, action: PayloadAction<boolean>) => {
      state.showJoystick = action.payload
    },
    setMovementMode: (state, action: PayloadAction<MovementMode>) => {
      state.movementMode = action.payload
      state.showJoystick = action.payload === 'joystick'
    },
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload
      localStorage.setItem('skyoffice_player_name', action.payload)
    },
    setAvatar: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload
      localStorage.setItem('skyoffice_avatar', action.payload)
    },
    setAvatarCustomization: (
      state,
      action: PayloadAction<{
        skinColor?: string
        hairColor?: string
        outfitType?: OutfitType
        outfitColor?: string
      }>
    ) => {
      if (action.payload.skinColor !== undefined) {
        state.skinColor = action.payload.skinColor
        localStorage.setItem('skyoffice_skin_color', action.payload.skinColor)
      }
      if (action.payload.hairColor !== undefined) {
        state.hairColor = action.payload.hairColor
        localStorage.setItem('skyoffice_hair_color', action.payload.hairColor)
      }
      if (action.payload.outfitType !== undefined) {
        state.outfitType = action.payload.outfitType
        localStorage.setItem('skyoffice_outfit_type', action.payload.outfitType)
      }
      if (action.payload.outfitColor !== undefined) {
        state.outfitColor = action.payload.outfitColor
        localStorage.setItem('skyoffice_outfit_color', action.payload.outfitColor)
      }
    },
    setCurrentStatus: (state, action: PayloadAction<string>) => {
      const target = state.statuses.find((s) => s.id === action.payload)
      if (target) {
        state.currentStatus = target
        localStorage.setItem('skyoffice_current_status_id', target.id)
        const game = phaserGame.scene.keys.game as any
        if (game?.myPlayer) {
          game.myPlayer.setPlayerStatus(target.color, target.name)
        }
      }
    },
    addStatus: (state, action: PayloadAction<{ name: string; color: string }>) => {
      const newStatus: UserStatus = {
        id: `status_${Date.now()}`,
        name: action.payload.name.trim(),
        color: action.payload.color,
      }
      state.statuses.push(newStatus)
      localStorage.setItem('skyoffice_statuses', JSON.stringify(state.statuses))
    },
    updateStatus: (state, action: PayloadAction<UserStatus>) => {
      const idx = state.statuses.findIndex((s) => s.id === action.payload.id)
      if (idx !== -1) {
        state.statuses[idx] = action.payload
        localStorage.setItem('skyoffice_statuses', JSON.stringify(state.statuses))
        if (state.currentStatus.id === action.payload.id) {
          state.currentStatus = action.payload
          const game = phaserGame.scene.keys.game as any
          if (game?.myPlayer) {
            game.myPlayer.setPlayerStatus(action.payload.color, action.payload.name)
          }
        }
      }
    },
    deleteStatus: (state, action: PayloadAction<string>) => {
      if (state.statuses.length <= 1) return
      state.statuses = state.statuses.filter((s) => s.id !== action.payload)
      localStorage.setItem('skyoffice_statuses', JSON.stringify(state.statuses))
      if (state.currentStatus.id === action.payload) {
        const fallback = state.statuses[0]
        state.currentStatus = fallback
        localStorage.setItem('skyoffice_current_status_id', fallback.id)
        const game = phaserGame.scene.keys.game as any
        if (game?.myPlayer) {
          game.myPlayer.setPlayerStatus(fallback.color, fallback.name)
        }
      }
    },
    resetToDefaultStatuses: (state) => {
      state.statuses = [...DEFAULT_STATUSES]
      localStorage.setItem('skyoffice_statuses', JSON.stringify(state.statuses))
      const fallback = state.statuses[0]
      state.currentStatus = fallback
      localStorage.setItem('skyoffice_current_status_id', fallback.id)
      const game = phaserGame.scene.keys.game as any
      if (game?.myPlayer) {
        game.myPlayer.setPlayerStatus(fallback.color, fallback.name)
      }
    },
  },
})

export const {
  toggleBackgroundMode,
  setSessionId,
  setVideoConnected,
  setLoggedIn,
  setPlayerNameMap,
  removePlayerNameMap,
  setShowJoystick,
  setMovementMode,
  setPlayerName,
  setAvatar,
  setAvatarCustomization,
  setCurrentStatus,
  addStatus,
  updateStatus,
  deleteStatus,
  resetToDefaultStatuses,
} = userSlice.actions

export default userSlice.reducer
