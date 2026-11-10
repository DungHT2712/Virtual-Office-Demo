import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { phaserEvents, Event } from '../events/EventCenter'

export interface RoomLayoutItem {
  id: string
  roomType: string
  name: string
  gridX: number
  gridY: number
  width: number
  height: number
  doorX?: number
  doorY?: number
}

export interface FurnitureLayoutItem {
  id: string
  itemType: string
  gridX: number
  gridY: number
  orientation: number
  itemDirection?: string
  tint?: number
}

export interface WorkspaceData {
  sizeType: string
  width: number
  height: number
}

interface WorkspaceStoreState {
  workspace: WorkspaceData
  rooms: Record<string, RoomLayoutItem>
  furnitures: Record<string, FurnitureLayoutItem>
  designMode: boolean
  selectedTool: string | null
  cloneTemplate: FurnitureLayoutItem | null
  cloneContinuous: boolean
  selectedFurnitureIds: string[]
  errorNotice: string | null
  successNotice: string | null
}

const initialState: WorkspaceStoreState = {
  workspace: {
    sizeType: 'MEDIUM',
    width: 30,
    height: 30,
  },
  rooms: {},
  furnitures: {},
  designMode: false,
  selectedTool: null,
  cloneTemplate: null,
  cloneContinuous: false,
  selectedFurnitureIds: [],
  errorNotice: null,
  successNotice: null,
}

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    openDesignMode: (state) => {
      const game = phaserGame.scene.keys.game as Game
      if (game && game.disableKeys) game.disableKeys()
      state.designMode = true
      state.errorNotice = null
      state.successNotice = null
      phaserEvents.emit(Event.DESIGN_MODE_TOGGLED, true)
    },
    closeDesignMode: (state) => {
      const game = phaserGame.scene.keys.game as Game
      if (game && game.enableKeys) game.enableKeys()
      state.designMode = false
      state.cloneTemplate = null
      state.cloneContinuous = false
      state.selectedFurnitureIds = []
      phaserEvents.emit(Event.DESIGN_MODE_TOGGLED, false)
    },
    setSelectedTool: (state, action: PayloadAction<string | null>) => {
      state.selectedTool = action.payload
      if (action.payload !== 'clone') {
        state.cloneTemplate = null
        state.cloneContinuous = false
      }
    },
    setCloneTemplate: (state, action: PayloadAction<FurnitureLayoutItem | null>) => {
      state.cloneTemplate = action.payload
    },
    setCloneContinuous: (state, action: PayloadAction<boolean>) => {
      state.cloneContinuous = action.payload
    },
    setWorkspaceData: (state, action: PayloadAction<WorkspaceData>) => {
      state.workspace = action.payload
    },
    addOrUpdateRoom: (state, action: PayloadAction<RoomLayoutItem>) => {
      state.rooms[action.payload.id] = action.payload
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      delete state.rooms[action.payload]
    },
    addOrUpdateFurniture: (state, action: PayloadAction<FurnitureLayoutItem>) => {
      state.furnitures[action.payload.id] = action.payload
    },
    removeFurniture: (state, action: PayloadAction<string>) => {
      delete state.furnitures[action.payload]
      state.selectedFurnitureIds = state.selectedFurnitureIds.filter((id) => id !== action.payload)
    },
    setSelectedFurnitureIds: (state, action: PayloadAction<string[]>) => {
      state.selectedFurnitureIds = action.payload
    },
    clearSelectedFurnitureIds: (state) => {
      state.selectedFurnitureIds = []
    },
    setErrorNotice: (state, action: PayloadAction<string | null>) => {
      state.errorNotice = action.payload
    },
    setSuccessNotice: (state, action: PayloadAction<string | null>) => {
      state.successNotice = action.payload
    },
    clearNotices: (state) => {
      state.errorNotice = null
      state.successNotice = null
    },
  },
})

export const {
  openDesignMode,
  closeDesignMode,
  setSelectedTool,
  setCloneTemplate,
  setCloneContinuous,
  setSelectedFurnitureIds,
  clearSelectedFurnitureIds,
  setWorkspaceData,
  addOrUpdateRoom,
  removeRoom,
  addOrUpdateFurniture,
  removeFurniture,
  setErrorNotice,
  setSuccessNotice,
  clearNotices,
} = workspaceSlice.actions

export default workspaceSlice.reducer
