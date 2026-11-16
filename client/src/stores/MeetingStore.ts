import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MeetingRoomConfig, MeetingBooking } from '../types/core'

interface MeetingStoreState {
  meetingRooms: MeetingRoomConfig[]
  meetingBookings: MeetingBooking[]
  isMeetingDialogOpen: boolean
  selectedRoomId: string | null
  activeTab: number
}

const initialState: MeetingStoreState = {
  meetingRooms: [],
  meetingBookings: [],
  isMeetingDialogOpen: false,
  selectedRoomId: null,
  activeTab: 0,
}

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setMeetingData: (
      state,
      action: PayloadAction<{ meetingRooms: MeetingRoomConfig[]; meetingBookings: MeetingBooking[] }>
    ) => {
      state.meetingRooms = action.payload.meetingRooms || []
      state.meetingBookings = action.payload.meetingBookings || []
    },
    setMeetingRooms: (state, action: PayloadAction<MeetingRoomConfig[]>) => {
      state.meetingRooms = action.payload
    },
    setMeetingBookings: (state, action: PayloadAction<MeetingBooking[]>) => {
      state.meetingBookings = action.payload
    },
    openMeetingDialog: (
      state,
      action: PayloadAction<{ tab?: number; roomId?: string } | undefined>
    ) => {
      state.isMeetingDialogOpen = true
      if (action?.payload?.tab !== undefined) {
        state.activeTab = action.payload.tab
      }
      if (action?.payload?.roomId !== undefined) {
        state.selectedRoomId = action.payload.roomId
      }
    },
    closeMeetingDialog: (state) => {
      state.isMeetingDialogOpen = false
    },
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload
    },
    setSelectedRoomId: (state, action: PayloadAction<string | null>) => {
      state.selectedRoomId = action.payload
    },
    updateRoomMaxUsers: (
      state,
      action: PayloadAction<{ roomId: string; roomName: string; maxUsers: number }>
    ) => {
      const idx = state.meetingRooms.findIndex((r) => r.roomId === action.payload.roomId)
      if (idx !== -1) {
        state.meetingRooms[idx].maxUsers = action.payload.maxUsers
        state.meetingRooms[idx].roomName = action.payload.roomName
      } else {
        state.meetingRooms.push({
          roomId: action.payload.roomId,
          roomName: action.payload.roomName,
          maxUsers: action.payload.maxUsers,
        })
      }
    },
    addOrUpdateBooking: (state, action: PayloadAction<MeetingBooking>) => {
      const idx = state.meetingBookings.findIndex((b) => b.id === action.payload.id)
      if (idx !== -1) {
        state.meetingBookings[idx] = action.payload
      } else {
        state.meetingBookings.push(action.payload)
      }
    },
    removeBooking: (state, action: PayloadAction<string>) => {
      state.meetingBookings = state.meetingBookings.filter((b) => b.id !== action.payload)
    },
  },
})

export const {
  setMeetingData,
  setMeetingRooms,
  setMeetingBookings,
  openMeetingDialog,
  closeMeetingDialog,
  setActiveTab,
  setSelectedRoomId,
  updateRoomMaxUsers,
  addOrUpdateBooking,
  removeBooking,
} = meetingSlice.actions

export default meetingSlice.reducer
