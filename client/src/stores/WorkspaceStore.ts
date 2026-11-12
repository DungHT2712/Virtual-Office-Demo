import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import { phaserEvents, Event } from '../events/EventCenter'

export interface FloorData {
  floorNumber: number
  name: string
}

export interface FloorDoorData {
  id: string
  fromFloor: number
  toFloor: number
  gridX: number
  gridY: number
}

export interface WorkspaceFloorsConfig {
  floors: FloorData[]
  doors: FloorDoorData[]
}

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
  floor?: number
}

export interface FurnitureLayoutItem {
  id: string
  itemType: string
  gridX: number
  gridY: number
  orientation: number
  itemDirection?: string
  tint?: number
  floor?: number
}

export interface WorkspaceData {
  sizeType: string
  width: number
  height: number
  floorsConfig?: string
}

interface WorkspaceStoreState {
  workspace: WorkspaceData
  rooms: Record<string, RoomLayoutItem>
  furnitures: Record<string, FurnitureLayoutItem>
  designMode: boolean
  selectedTool: string | null
  cloneTemplate: FurnitureLayoutItem | null
  cloneTemplates: FurnitureLayoutItem[]
  cloneContinuous: boolean
  selectedFurnitureIds: string[]
  currentFloor: number
  floorsConfig: WorkspaceFloorsConfig
  errorNotice: string | null
  successNotice: string | null
}

const initialState: WorkspaceStoreState = {
  workspace: {
    sizeType: 'MEDIUM',
    width: 50,
    height: 50,
  },
  rooms: {},
  furnitures: {},
  designMode: false,
  selectedTool: null,
  cloneTemplate: null,
  cloneTemplates: [],
  cloneContinuous: false,
  selectedFurnitureIds: [],
  currentFloor: 1,
  floorsConfig: {
    floors: [{ floorNumber: 1, name: 'Tầng 1' }],
    doors: [],
  },
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
      state.cloneTemplates = []
      state.cloneContinuous = false
      state.selectedFurnitureIds = []
      phaserEvents.emit(Event.DESIGN_MODE_TOGGLED, false)
    },
    setSelectedTool: (state, action: PayloadAction<string | null>) => {
      state.selectedTool = action.payload
      if (action.payload !== 'clone') {
        state.cloneTemplate = null
        state.cloneTemplates = []
        state.cloneContinuous = false
      }
    },
    setCloneTemplate: (state, action: PayloadAction<FurnitureLayoutItem | null>) => {
      state.cloneTemplate = action.payload
      state.cloneTemplates = action.payload ? [action.payload] : []
    },
    setCloneTemplates: (state, action: PayloadAction<FurnitureLayoutItem[]>) => {
      state.cloneTemplates = action.payload
      state.cloneTemplate = action.payload.length > 0 ? action.payload[0] : null
    },
    setCloneContinuous: (state, action: PayloadAction<boolean>) => {
      state.cloneContinuous = action.payload
    },
    setWorkspaceData: (state, action: PayloadAction<WorkspaceData>) => {
      state.workspace = action.payload
      if (action.payload.floorsConfig) {
        try {
          const parsed = JSON.parse(action.payload.floorsConfig)
          if (parsed && Array.isArray(parsed.floors)) {
            state.floorsConfig = parsed
          }
        } catch (e) {
          console.error('Failed to parse floorsConfig:', e)
        }
      }
    },
    setCurrentFloor: (state, action: PayloadAction<number>) => {
      state.currentFloor = action.payload
    },
    setFloorsConfig: (state, action: PayloadAction<WorkspaceFloorsConfig>) => {
      state.floorsConfig = action.payload
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
  setCloneTemplates,
  setCloneContinuous,
  setSelectedFurnitureIds,
  clearSelectedFurnitureIds,
  setWorkspaceData,
  setCurrentFloor,
  setFloorsConfig,
  addOrUpdateRoom,
  removeRoom,
  addOrUpdateFurniture,
  removeFurniture,
  setErrorNotice,
  setSuccessNotice,
  clearNotices,
} = workspaceSlice.actions

export default workspaceSlice.reducer
