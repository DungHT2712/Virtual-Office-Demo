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

export function getInitialBackgroundMode() {
  const currentHour = new Date().getHours()
  return currentHour > 6 && currentHour <= 18 ? BackgroundMode.DAY : BackgroundMode.NIGHT
}

export type MovementMode = 'mouse' | 'wasd' | 'joystick'

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
    skinColor: '#f5cfa0',
    hairColor: '#4a3728',
    outfitType: 'casual' as OutfitType,
    outfitColor: '#3b82f6',
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
    setAvatarCustomization: (
      state,
      action: PayloadAction<{
        skinColor?: string
        hairColor?: string
        outfitType?: OutfitType
        outfitColor?: string
      }>
    ) => {
      if (action.payload.skinColor !== undefined) state.skinColor = action.payload.skinColor
      if (action.payload.hairColor !== undefined) state.hairColor = action.payload.hairColor
      if (action.payload.outfitType !== undefined) state.outfitType = action.payload.outfitType
      if (action.payload.outfitColor !== undefined) state.outfitColor = action.payload.outfitColor
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
  setAvatarCustomization,
} = userSlice.actions

export default userSlice.reducer
