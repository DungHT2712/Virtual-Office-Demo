import Peer from 'peerjs'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ShareScreenManager from '../web/ShareScreenManager'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { sanitizeId } from '../util'

interface ComputerState {
  computerDialogOpen: boolean
  computerId: null | string
  myStream: null | MediaStream
  peerStreams: Map<
    string,
    {
      stream: MediaStream
      call: Peer.MediaConnection
    }
  >
  shareScreenManager: null | ShareScreenManager
}

const initialState: ComputerState = {
  computerDialogOpen: false,
  computerId: null,
  myStream: null,
  peerStreams: new Map(),
  shareScreenManager: null,
}

export const computerSlice = createSlice({
  name: 'computer',
  initialState,
  reducers: {
    openComputerDialog: (
      state,
      action: PayloadAction<{ computerId: string; myUserId: string }>
    ) => {
      if (state.computerDialogOpen) return
      if (!state.shareScreenManager) {
        state.shareScreenManager = new ShareScreenManager(action.payload.myUserId)
      }
      const game = phaserGame.scene.keys.game as Game
      game.disableKeys()
      state.shareScreenManager.onOpen()
      state.computerDialogOpen = true
      state.computerId = action.payload.computerId
    },
    closeComputerDialog: (state) => {
      // Tell server the computer dialog is closed.
      const game = phaserGame.scene.keys.game as Game
      game.enableKeys()
      if (state.computerId) {
        game.network.disconnectFromComputer(state.computerId)
      }
      for (const { call } of state.peerStreams.values()) {
        call.close()
      }
      state.shareScreenManager?.onClose()
      state.computerDialogOpen = false
      state.myStream = null
      state.computerId = null
      state.peerStreams.clear()
    },
    setMyStream: (state, action: PayloadAction<null | MediaStream>) => {
      state.myStream = action.payload
    },
    addVideoStream: (
      state,
      action: PayloadAction<{ id: string; call: Peer.MediaConnection; stream: MediaStream }>
    ) => {
      const sanitized = sanitizeId(action.payload.id)
      const newMap = new Map(state.peerStreams)
      newMap.set(sanitized, {
        call: action.payload.call,
        stream: action.payload.stream,
      })
      state.peerStreams = newMap
    },
    removeVideoStream: (state, action: PayloadAction<string>) => {
      const sanitized = sanitizeId(action.payload)
      const newMap = new Map(state.peerStreams)
      newMap.delete(sanitized)
      state.peerStreams = newMap
    },
  },
})

export const {
  closeComputerDialog,
  openComputerDialog,
  setMyStream,
  addVideoStream,
  removeVideoStream,
} = computerSlice.actions

export default computerSlice.reducer
