import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import OutlinedInput from '@mui/material/OutlinedInput'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import CloseIcon from '@mui/icons-material/Close'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import EventNoteIcon from '@mui/icons-material/EventNote'
import ScheduleIcon from '@mui/icons-material/Schedule'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockIcon from '@mui/icons-material/Lock'
import SaveIcon from '@mui/icons-material/Save'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

import { useAppDispatch, useAppSelector } from '../hooks'
import {
  closeMeetingDialog,
  setActiveTab,
  setSelectedRoomId,
  updateRoomMaxUsers,
  setMeetingBookings,
  addOrUpdateBooking,
  removeBooking,
} from '../stores/MeetingStore'
import { setErrorNotice, setSuccessNotice } from '../stores/WorkspaceStore'
import {
  MeetingRoomConfig,
  MeetingBooking,
  WorkspaceUser,
  formatCreationDateTime,
} from '../types/core'

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    .icon-box {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2));
      border: 1px solid rgba(56, 189, 248, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #38bdf8;
    }

    h2 {
      font-size: 17px;
      font-weight: 700;
      margin: 0;
      color: #f8fafc;
    }

    span {
      font-size: 12px;
      color: #94a3b8;
    }
  }
`

const TabContainer = styled.div`
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .MuiTabs-indicator {
    background-color: #38bdf8;
    height: 3px;
  }

  .MuiTab-root {
    color: #94a3b8;
    font-size: 13px;
    font-weight: 600;
    text-transform: none;
    min-height: 48px;

    &.Mui-selected {
      color: #38bdf8;
    }
  }
`

const ContentWrapper = styled.div`
  padding: 20px;
  background: #0f172a;
  color: #f8fafc;
  min-height: 420px;
  max-height: 65vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
`

const RoomCard = styled.div<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.6)')};
  border: 1px solid ${(props) => (props.$active ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(56, 189, 248, 0.35);
    background: rgba(30, 41, 59, 0.85);
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .room-name {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .room-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
  }

  .info-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: #cbd5e1;

    .info-item {
      display: flex;
      align-items: center;
      gap: 6px;

      strong {
        color: #f1f5f9;
      }
    }

    .busy-tag {
      color: #f59e0b;
      font-weight: 600;
    }
  }

  .action-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
`

const FormBox = styled.div`
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormRow = styled.div`
  display: flex;
  gap: 14px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`

const ReadOnlyField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .val {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #f8fafc;
    font-weight: 600;
  }
`

const EmptyPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  gap: 10px;
  text-align: center;

  svg {
    font-size: 44px;
    color: #475569;
  }

  .hint {
    font-size: 12px;
    max-width: 320px;
    line-height: 1.5;
  }
`

interface Props {
  users?: WorkspaceUser[]
}

export default function MeetingRoomDialog({ users = [] }: Props) {
  const dispatch = useAppDispatch()
  const isOpen = useAppSelector((state) => state.meeting.isMeetingDialogOpen)
  const activeTab = useAppSelector((state) => state.meeting.activeTab)
  const selectedRoomId = useAppSelector((state) => state.meeting.selectedRoomId)
  const meetingRoomsConfig = useAppSelector((state) => state.meeting.meetingRooms)
  const meetingBookings = useAppSelector((state) => state.meeting.meetingBookings)
  const roomsInOffice = useAppSelector((state) => state.workspace.rooms)
  const currentUserName = useAppSelector((state) => state.user.playerName) || 'Guest'
  const currentUserId = useAppSelector((state) => state.user.userId)
  const roomId = useAppSelector((state) => state.room.roomId)

  // Danh sách các phòng họp có trên bản đồ (tự động cập nhật khi người dùng tạo/sửa phòng)
  const officeMeetingRooms = useMemo(() => {
    const list = Object.values(roomsInOffice || {})
    // Lọc các phòng là phòng họp (roomType === 'meeting' hoặc tên có chứa từ họp), nếu không có thì lấy tất cả phòng
    const meetingTypeRooms = list.filter(
      (r) => r.roomType === 'meeting' || r.name.toLowerCase().includes('họp')
    )
    return meetingTypeRooms.length > 0 ? meetingTypeRooms : list
  }, [roomsInOffice])

  // Lấy cấu hình số lượng tối đa cho mỗi phòng
  const getRoomMaxUsers = (id: string): number => {
    const cfg = meetingRoomsConfig.find((c) => c.roomId === id)
    return cfg ? cfg.maxUsers : 10
  }

  // State cho cấu hình số người tối đa ở Tab 0
  const [editingCapacityRoomId, setEditingCapacityRoomId] = useState<string | null>(null)
  const [tempCapacity, setTempCapacity] = useState<number>(10)

  // State cho Form đặt phòng ở Tab 1
  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const [bookingDate, setBookingDate] = useState<string>(todayStr)
  const [bookingRoomId, setBookingRoomId] = useState<string>('')
  const [bookingHost, setBookingHost] = useState<string>(currentUserName)
  const [bookingReason, setBookingReason] = useState<string>('')
  const [bookingStartTime, setBookingStartTime] = useState<string>('09:00')
  const [bookingEndTime, setBookingEndTime] = useState<string>('10:00')
  const [bookingParticipants, setBookingParticipants] = useState<string[]>([])
  const [creationTimeString, setCreationTimeString] = useState<string>(formatCreationDateTime())

  // State cho Edit Modal ở Tab 2
  const [editingBooking, setEditingBooking] = useState<MeetingBooking | null>(null)
  const [editHost, setEditHost] = useState<string>('')
  const [editReason, setEditReason] = useState<string>('')
  const [editDate, setEditDate] = useState<string>('')
  const [editStartTime, setEditStartTime] = useState<string>('')
  const [editEndTime, setEditEndTime] = useState<string>('')
  const [editParticipants, setEditParticipants] = useState<string[]>([])

  // Danh sách user khả dụng (gộp workspace users và current user nếu chưa có)
  const availableUsers = useMemo(() => {
    const map = new Map<string, string>()
    if (currentUserName) map.set(currentUserName, currentUserName)
    users.forEach((u) => {
      map.set(u.name || u.username, u.name || u.username)
    })
    return Array.from(map.values())
  }, [users, currentUserName])

  // Khi mở dialog hoặc chuyển phòng chọn, cập nhật default room
  useEffect(() => {
    if (officeMeetingRooms.length > 0) {
      if (selectedRoomId && officeMeetingRooms.some((r) => r.id === selectedRoomId)) {
        setBookingRoomId(selectedRoomId)
      } else if (!bookingRoomId || !officeMeetingRooms.some((r) => r.id === bookingRoomId)) {
        setBookingRoomId(officeMeetingRooms[0].id)
      }
    }
  }, [officeMeetingRooms, selectedRoomId])

  // Khi mở form đặt phòng, cập nhật thời gian tạo hiện tại theo format dd/mm/yyyy - h:m:s
  useEffect(() => {
    if (isOpen && activeTab === 1) {
      setCreationTimeString(formatCreationDateTime())
    }
  }, [isOpen, activeTab])

  // Tự động load dữ liệu phòng họp từ server khi dialog mở
  useEffect(() => {
    if (!isOpen || !roomId) return
    const fetchMeetingData = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}/meeting-data`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            if (data.meetingRooms) {
              dispatch({ type: 'meeting/setMeetingRooms', payload: data.meetingRooms })
            }
            if (data.meetingBookings) {
              dispatch(setMeetingBookings(data.meetingBookings))
            }
          }
        }
      } catch (err) {
        console.warn('Could not load meeting data from API:', err)
      }
    }
    fetchMeetingData()
  }, [isOpen, roomId, dispatch])

  // Tính chuỗi thời gian bận cho phòng họp theo ngày: ví dụ (6:00 - 7:00) (12:00 - 14:00)
  const getBusyIntervalsString = (rId: string, date: string): string => {
    const bookingsOnDate = meetingBookings.filter((b) => b.roomId === rId && b.date === date)
    if (bookingsOnDate.length === 0) return '(Trống cả ngày)'
    // Sắp xếp theo giờ bắt đầu
    const sorted = [...bookingsOnDate].sort((a, b) => a.startTimestamp - b.startTimestamp)
    return sorted.map((b) => `(${b.startTime} - ${b.endTime})`).join(' ')
  }

  // Lưu thiết lập số lượng người tối đa cho phòng họp
  const handleSaveMaxUsers = async (targetRoomId: string, targetRoomName: string) => {
    const val = Number(tempCapacity)
    if (isNaN(val) || val <= 0) {
      dispatch(setErrorNotice('Số lượng người tối đa phải lớn hơn 0!'))
      return
    }

    const currentConfigs = [...meetingRoomsConfig]
    const idx = currentConfigs.findIndex((c) => c.roomId === targetRoomId)
    if (idx !== -1) {
      currentConfigs[idx] = { ...currentConfigs[idx], maxUsers: val, roomName: targetRoomName }
    } else {
      currentConfigs.push({ roomId: targetRoomId, roomName: targetRoomName, maxUsers: val })
    }

    dispatch(updateRoomMaxUsers({ roomId: targetRoomId, roomName: targetRoomName, maxUsers: val }))
    setEditingCapacityRoomId(null)

    if (roomId) {
      try {
        const res = await fetch(`/api/workspaces/${roomId}/meeting-rooms-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingRooms: currentConfigs }),
        })
        if (res.ok) {
          dispatch(setSuccessNotice(`Đã cập nhật số người tối đa cho ${targetRoomName}: ${val} người`))
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Xử lý tạo lịch đặt phòng
  const handleCreateBooking = async () => {
    const selectedRoom = officeMeetingRooms.find((r) => r.id === bookingRoomId)
    if (!selectedRoom) {
      dispatch(setErrorNotice('Vui lòng chọn phòng họp hợp lệ!'))
      return
    }

    if (!bookingReason.trim()) {
      dispatch(setErrorNotice('Vui lòng nhập lý do đặt phòng họp!'))
      return
    }

    if (!bookingDate || !bookingStartTime || !bookingEndTime) {
      dispatch(setErrorNotice('Vui lòng điền đầy đủ ngày và khoảng thời gian họp!'))
      return
    }

    const startTs = new Date(`${bookingDate}T${bookingStartTime}:00`).getTime()
    const endTs = new Date(`${bookingDate}T${bookingEndTime}:00`).getTime()

    // Bắt buộc thời gian bắt đầu phải sớm hơn kết thúc
    if (startTs >= endTs) {
      dispatch(setErrorNotice('Thời gian bắt đầu bắt buộc phải sớm hơn thời gian kết thúc!'))
      return
    }

    // Bắt buộc không nằm trong khoảng thời gian đã được đặt
    const roomBookings = meetingBookings.filter((b) => b.roomId === bookingRoomId)
    const overlap = roomBookings.find(
      (b) => startTs < b.endTimestamp && endTs > b.startTimestamp
    )
    if (overlap) {
      dispatch(
        setErrorNotice(
          `Khoảng thời gian này đã bị trùng với lịch họp khác (${overlap.startTime} - ${overlap.endTime})! Vui lòng chọn khung giờ khác.`
        )
      )
      return
    }

    const targetHostName = (bookingHost || currentUserName).trim()
    const foundHostUser = users.find((u) => (u.name || u.username) === targetHostName)
    const hostId = foundHostUser ? foundHostUser.id : (targetHostName === currentUserName ? currentUserId : '')

    const payload: Partial<MeetingBooking> = {
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      createdAt: creationTimeString,
      createdAtTimestamp: Date.now(),
      host: targetHostName,
      hostId: hostId,
      reason: bookingReason.trim(),
      date: bookingDate,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      startTimestamp: startTs,
      endTimestamp: endTs,
      participants: bookingParticipants,
    }

    try {
      const res = await fetch(`/api/workspaces/${roomId || 'default'}/meeting-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        dispatch(addOrUpdateBooking(data.booking))
        dispatch(setSuccessNotice(`Đặt phòng họp "${selectedRoom.name}" thành công!`))
        setBookingReason('')
        setBookingParticipants([])
        dispatch(setActiveTab(2)) // Chuyển sang xem lịch đã đặt
      } else {
        dispatch(setErrorNotice(data.message || 'Lỗi khi đặt phòng họp'))
      }
    } catch (err: any) {
      dispatch(setErrorNotice(err.message || 'Không thể kết nối đến máy chủ'))
    }
  }

  // Mở modal sửa booking
  const handleOpenEditBooking = (b: MeetingBooking) => {
    if (Date.now() >= b.startTimestamp) {
      dispatch(setErrorNotice('Không thể sửa cuộc họp khi đã đến hoặc qua thời gian họp!'))
      return
    }
    setEditingBooking(b)
    setEditHost(b.host)
    setEditReason(b.reason)
    setEditDate(b.date)
    setEditStartTime(b.startTime)
    setEditEndTime(b.endTime)
    setEditParticipants([...b.participants])
  }

  // Xác nhận lưu sửa booking
  const handleSaveEditBooking = async () => {
    if (!editingBooking) return

    if (Date.now() >= editingBooking.startTimestamp) {
      dispatch(setErrorNotice('Không thể sửa cuộc họp khi đã đến hoặc qua thời gian họp!'))
      setEditingBooking(null)
      return
    }

    if (!editReason.trim()) {
      dispatch(setErrorNotice('Vui lòng nhập lý do cuộc họp!'))
      return
    }

    const startTs = new Date(`${editDate}T${editStartTime}:00`).getTime()
    const endTs = new Date(`${editDate}T${editEndTime}:00`).getTime()

    if (startTs >= endTs) {
      dispatch(setErrorNotice('Thời gian bắt đầu bắt buộc phải sớm hơn thời gian kết thúc!'))
      return
    }

    // Kiểm tra trùng với các booking khác cùng phòng
    const otherBookings = meetingBookings.filter(
      (b) => b.id !== editingBooking.id && b.roomId === editingBooking.roomId
    )
    const overlap = otherBookings.find(
      (b) => startTs < b.endTimestamp && endTs > b.startTimestamp
    )
    if (overlap) {
      dispatch(
        setErrorNotice(
          `Khoảng thời gian này đã bị trùng với lịch họp khác (${overlap.startTime} - ${overlap.endTime})!`
        )
      )
      return
    }

    const targetEditHost = (editHost || editingBooking.host).trim()
    const foundEditUser = users.find((u) => (u.name || u.username) === targetEditHost)
    const editHostId = foundEditUser ? foundEditUser.id : (targetEditHost === currentUserName ? currentUserId : '')

    const updatePayload = {
      host: targetEditHost,
      hostId: editHostId,
      reason: editReason.trim(),
      date: editDate,
      startTime: editStartTime,
      endTime: editEndTime,
      startTimestamp: startTs,
      endTimestamp: endTs,
      participants: editParticipants,
    }

    try {
      const res = await fetch(
        `/api/workspaces/${roomId || 'default'}/meeting-bookings/${editingBooking.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        }
      )
      const data = await res.json()
      if (res.ok && data.success) {
        dispatch(addOrUpdateBooking(data.booking))
        dispatch(setSuccessNotice('Cập nhật thông tin đặt phòng thành công!'))
        setEditingBooking(null)
      } else {
        dispatch(setErrorNotice(data.message || 'Lỗi khi cập nhật đặt phòng'))
      }
    } catch (err: any) {
      dispatch(setErrorNotice(err.message || 'Không thể kết nối đến máy chủ'))
    }
  }

  // Xử lý xóa lịch đặt phòng
  const handleDeleteBooking = async (b: MeetingBooking) => {
    if (Date.now() >= b.startTimestamp) {
      dispatch(setErrorNotice('Không thể xóa cuộc họp khi đã đến hoặc qua thời gian họp!'))
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch đặt phòng "${b.roomName}" (${b.startTime} - ${b.endTime})?`)) {
      return
    }

    try {
      const res = await fetch(
        `/api/workspaces/${roomId || 'default'}/meeting-bookings/${b.id}`,
        {
          method: 'DELETE',
        }
      )
      const data = await res.json()
      if (res.ok && data.success) {
        dispatch(removeBooking(b.id))
        dispatch(setSuccessNotice('Đã xóa lịch đặt phòng thành công!'))
      } else {
        dispatch(setErrorNotice(data.message || 'Lỗi khi xóa đặt phòng'))
      }
    } catch (err: any) {
      dispatch(setErrorNotice(err.message || 'Không thể kết nối đến máy chủ'))
    }
  }

  const selectedRoomForBooking = officeMeetingRooms.find((r) => r.id === bookingRoomId)

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => dispatch(closeMeetingDialog())}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogHeader>
          <div className="title-group">
            <div className="icon-box">
              <MeetingRoomIcon fontSize="small" />
            </div>
            <div>
              <h2>Quản Lý Tiện Ích Phòng Họp</h2>
              <span>Danh sách phòng, thiết lập số lượng tối đa & đặt phòng riêng tư</span>
            </div>
          </div>
          <IconButton onClick={() => dispatch(closeMeetingDialog())} style={{ color: '#94a3b8' }}>
            <CloseIcon />
          </IconButton>
        </DialogHeader>

        <TabContainer>
          <Tabs
            value={activeTab}
            onChange={(_, val) => dispatch(setActiveTab(val))}
            variant="fullWidth"
          >
            <Tab
              icon={<MeetingRoomIcon fontSize="small" />}
              iconPosition="start"
              label={`Danh Sách Phòng Họp (${officeMeetingRooms.length})`}
            />
            <Tab
              icon={<ScheduleIcon fontSize="small" />}
              iconPosition="start"
              label="Đặt Phòng Họp"
            />
            <Tab
              icon={<EventNoteIcon fontSize="small" />}
              iconPosition="start"
              label={`Lịch Đã Đặt (${meetingBookings.length})`}
            />
          </Tabs>
        </TabContainer>

        <ContentWrapper>
          {/* TAB 0: DANH SÁCH PHÒNG HỌP & THIẾT LẬP SỐ LƯỢNG NGƯỜI TỐI ĐA */}
          {activeTab === 0 && (
            <div>
              {officeMeetingRooms.length === 0 ? (
                <EmptyPlaceholder>
                  <MeetingRoomIcon />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                    Chưa có phòng họp nào trên bản đồ
                  </div>
                  <div className="hint">
                    Bật chế độ Thiết Kế (Design Mode) và chọn công cụ "Phòng Họp" để vẽ phòng trên bản đồ. Danh sách sẽ tự động cập nhật ngay lập tức!
                  </div>
                </EmptyPlaceholder>
              ) : (
                officeMeetingRooms.map((room) => {
                  const maxUsers = getRoomMaxUsers(room.id)
                  const isEditing = editingCapacityRoomId === room.id

                  return (
                    <RoomCard key={room.id}>
                      <div className="top-row">
                        <div className="room-name">
                          <MeetingRoomIcon style={{ color: '#38bdf8', fontSize: '20px' }} />
                          {room.name}
                        </div>
                        <div className="room-badge">Tầng {room.floor || 1}</div>
                      </div>

                      <div className="info-row">
                        <div className="info-item">
                          Kích thước: <strong>{room.width}x{room.height} ô</strong> ({room.width * 32}x{room.height * 32}px)
                        </div>
                        <div className="info-item">
                          Số lượng người tối đa:
                          {isEditing ? (
                            <TextField
                              size="small"
                              type="number"
                              value={tempCapacity}
                              onChange={(e) => setTempCapacity(Number(e.target.value))}
                              inputProps={{ min: 1, max: 100 }}
                              style={{ width: '80px', margin: '0 8px' }}
                              sx={{
                                input: { color: '#fff', padding: '4px 8px' },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { borderColor: '#38bdf8' },
                                },
                              }}
                            />
                          ) : (
                            <strong style={{ color: '#38bdf8', fontSize: '14px', marginLeft: '4px' }}>
                              {maxUsers} người
                            </strong>
                          )}
                        </div>
                      </div>

                      <div className="action-row">
                        {isEditing ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setEditingCapacityRoomId(null)}
                              style={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={() => handleSaveMaxUsers(room.id, room.name)}
                              style={{ backgroundColor: '#0284c7', color: '#fff' }}
                            >
                              Lưu Số Lượng
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => {
                                setEditingCapacityRoomId(room.id)
                                setTempCapacity(maxUsers)
                              }}
                              style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                            >
                              Thiết Lập Số Người
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<AddCircleOutlineIcon />}
                              onClick={() => {
                                setBookingRoomId(room.id)
                                dispatch(setSelectedRoomId(room.id))
                                dispatch(setActiveTab(1))
                              }}
                              style={{ backgroundColor: '#0284c7', color: '#fff' }}
                            >
                              Đặt Phòng Này
                            </Button>
                          </>
                        )}
                      </div>
                    </RoomCard>
                  )
                })
              )}
            </div>
          )}

          {/* TAB 1: ĐẶT PHÒNG HỌP */}
          {activeTab === 1 && (
            <div>
              {/* Danh sách các phòng họp với thông tin: Tên phòng, Số lượng tối đa, Thời gian bận */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    1. Danh Sách Phòng & Thời Gian Bận
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Xem ngày:</span>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      style={{
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>

                {officeMeetingRooms.map((room) => {
                  const maxUsers = getRoomMaxUsers(room.id)
                  const busyTimes = getBusyIntervalsString(room.id, bookingDate)
                  const isSelected = bookingRoomId === room.id

                  return (
                    <RoomCard
                      key={room.id}
                      $active={isSelected}
                      onClick={() => setBookingRoomId(room.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="top-row">
                        <div className="room-name">
                          <MeetingRoomIcon style={{ color: isSelected ? '#38bdf8' : '#94a3b8' }} />
                          {room.name}
                        </div>
                        <Chip
                          label={isSelected ? 'Đang chọn' : 'Nhấn để chọn'}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                        />
                      </div>
                      <div className="info-row">
                        <div className="info-item">
                          Số lượng người tối đa: <strong style={{ color: '#38bdf8' }}>{maxUsers} người</strong>
                        </div>
                        <div className="info-item">
                          Thời gian bận: <span className="busy-tag">{busyTimes}</span>
                        </div>
                      </div>
                    </RoomCard>
                  )
                })}
              </div>

              {/* Form Thông Tin Đặt Phòng */}
              {selectedRoomForBooking && (
                <FormBox>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                    2. Thông Tin Đặt Phòng: {selectedRoomForBooking.name}
                  </div>

                  <FormRow>
                    {/* Tên phòng (Read only) */}
                    <ReadOnlyField>
                      <label>Tên phòng</label>
                      <div className="val">{selectedRoomForBooking.name}</div>
                    </ReadOnlyField>

                    {/* Thời gian tạo (Read only - Datetime hiện tại format dd/mm/yyyy - h:m:s) */}
                    <ReadOnlyField>
                      <label>Thời gian tạo</label>
                      <div className="val">{creationTimeString}</div>
                    </ReadOnlyField>
                  </FormRow>

                  <FormRow>
                    {/* Chủ phòng: Mặc định người tạo, có thể chọn người khác */}
                    <FormControl fullWidth size="small">
                      <InputLabel id="host-select-label" style={{ color: '#94a3b8' }}>Chủ phòng</InputLabel>
                      <Select
                        labelId="host-select-label"
                        value={bookingHost}
                        label="Chủ phòng"
                        onChange={(e) => setBookingHost(e.target.value)}
                        sx={{
                          color: '#fff',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                          '& .MuiSvgIcon-root': { color: '#94a3b8' },
                        }}
                      >
                        {availableUsers.map((u) => (
                          <MenuItem key={u} value={u}>
                            {u} {u === currentUserName ? '(Bạn)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Ngày họp */}
                    <TextField
                      size="small"
                      type="date"
                      label="Ngày họp"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                      fullWidth
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      }}
                    />
                  </FormRow>

                  {/* Lý do cuộc họp */}
                  <TextField
                    size="small"
                    label="Lý do cuộc họp"
                    placeholder="Ví dụ: Họp bàn giao tiến độ dự án, Họp sprint..."
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                    fullWidth
                    required
                    sx={{
                      input: { color: '#fff' },
                      '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    }}
                  />

                  <FormRow>
                    {/* Thời gian bắt đầu (Time picker) */}
                    <TextField
                      size="small"
                      type="time"
                      label="Thời gian bắt đầu"
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                      fullWidth
                      required
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      }}
                    />

                    {/* Thời gian kết thúc (Time picker) */}
                    <TextField
                      size="small"
                      type="time"
                      label="Thời gian kết thúc"
                      value={bookingEndTime}
                      onChange={(e) => setBookingEndTime(e.target.value)}
                      InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                      fullWidth
                      required
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      }}
                    />
                  </FormRow>

                  {/* Người tham gia: Cho phép chọn nhiều User */}
                  <FormControl fullWidth size="small">
                    <InputLabel id="participants-label" style={{ color: '#94a3b8' }}>Người tham gia (Chọn nhiều người)</InputLabel>
                    <Select
                      labelId="participants-label"
                      multiple
                      value={bookingParticipants}
                      onChange={(e) => {
                        const val = e.target.value
                        setBookingParticipants(typeof val === 'string' ? val.split(',') : val)
                      }}
                      input={<OutlinedInput label="Người tham gia (Chọn nhiều người)" />}
                      renderValue={(selected) => (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {selected.map((val) => (
                            <Chip key={val} label={val} size="small" style={{ backgroundColor: '#1e293b', color: '#38bdf8' }} />
                          ))}
                        </div>
                      )}
                      sx={{
                        color: '#fff',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                        '& .MuiSvgIcon-root': { color: '#94a3b8' },
                      }}
                    >
                      {availableUsers.map((u) => (
                        <MenuItem key={u} value={u}>
                          <Checkbox checked={bookingParticipants.indexOf(u) > -1} />
                          <ListItemText primary={u} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ScheduleIcon />}
                      onClick={handleCreateBooking}
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                        fontWeight: 700,
                        padding: '8px 24px',
                      }}
                    >
                      Xác Nhận Đặt Phòng
                    </Button>
                  </div>
                </FormBox>
              )}
            </div>
          )}

          {/* TAB 2: LỊCH ĐÃ ĐẶT (XÓA / SỬA NẾU CHƯA ĐẾN GIỜ) */}
          {activeTab === 2 && (
            <div>
              {meetingBookings.length === 0 ? (
                <EmptyPlaceholder>
                  <EventNoteIcon />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                    Chưa có lịch đặt phòng nào
                  </div>
                  <div className="hint">
                    Chuyển sang tab "Đặt Phòng Họp" để lên lịch họp cho nhóm của bạn.
                  </div>
                </EmptyPlaceholder>
              ) : (
                meetingBookings.map((b) => {
                  const now = Date.now()
                  const isUpcoming = now < b.startTimestamp
                  const isOngoing = now >= b.startTimestamp && now <= b.endTimestamp
                  const isEnded = now > b.endTimestamp

                  return (
                    <RoomCard key={b.id}>
                      <div className="top-row">
                        <div className="room-name">
                          <MeetingRoomIcon style={{ color: '#38bdf8' }} />
                          {b.roomName}
                        </div>
                        {isUpcoming && (
                          <Chip label="Sắp diễn ra" size="small" style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }} />
                        )}
                        {isOngoing && (
                          <Chip label="🔴 Đang diễn ra (Khóa riêng tư)" size="small" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700 }} />
                        )}
                        {isEnded && (
                          <Chip label="Đã kết thúc" size="small" style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }} />
                        )}
                      </div>

                      <div className="info-row">
                        <div className="info-item">
                          Thời gian: <strong style={{ color: '#38bdf8' }}>{b.date} | {b.startTime} - {b.endTime}</strong>
                        </div>
                        <div className="info-item">
                          Chủ phòng: <strong>{b.host}</strong>
                        </div>
                        <div className="info-item">
                          Thời gian tạo: <span style={{ color: '#94a3b8' }}>{b.createdAt}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '13px', color: '#e2e8f0' }}>
                        Lý do: <em>{b.reason}</em>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                        <PeopleAltIcon fontSize="inherit" />
                        Người tham gia ({b.participants?.length || 0}):{' '}
                        {b.participants && b.participants.length > 0 ? (
                          <span style={{ color: '#cbd5e1' }}>{b.participants.join(', ')}</span>
                        ) : (
                          <span style={{ color: '#64748b' }}>Không có người tham gia thêm</span>
                        )}
                      </div>

                      <div className="action-row">
                        {isUpcoming ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEditBooking(b)}
                              style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                            >
                              Sửa Lịch
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              onClick={() => handleDeleteBooking(b)}
                            >
                              Xóa
                            </Button>
                          </>
                        ) : (
                          <Tooltip title="Chỉ được phép sửa hoặc xóa khi chưa đến thời gian họp">
                            <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                              <LockIcon style={{ fontSize: '13px', verticalAlign: 'middle', marginRight: '4px' }} />
                              Đã đến hoặc qua giờ họp (Khóa sửa/xóa)
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </RoomCard>
                  )
                })
              )}
            </div>
          )}
        </ContentWrapper>
      </Dialog>

      {/* MODAL SỬA LỊCH ĐẶT PHÒNG */}
      {editingBooking && (
        <Dialog
          open={!!editingBooking}
          onClose={() => setEditingBooking(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: '#0f172a',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            },
          }}
        >
          <DialogTitle style={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            Chỉnh Sửa Lịch Đặt Phòng: {editingBooking.roomName}
          </DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '16px' }}>
            <FormControl fullWidth size="small">
              <InputLabel id="edit-host-label" style={{ color: '#94a3b8' }}>Chủ phòng</InputLabel>
              <Select
                labelId="edit-host-label"
                value={editHost}
                label="Chủ phòng"
                onChange={(e) => setEditHost(e.target.value)}
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                  '& .MuiSvgIcon-root': { color: '#94a3b8' },
                }}
              >
                {availableUsers.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u} {u === currentUserName ? '(Bạn)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Lý do cuộc họp"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
              fullWidth
              required
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            />

            <TextField
              size="small"
              type="date"
              label="Ngày họp"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
              fullWidth
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <TextField
                size="small"
                type="time"
                label="Giờ bắt đầu"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                fullWidth
                sx={{
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                }}
              />
              <TextField
                size="small"
                type="time"
                label="Giờ kết thúc"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                fullWidth
                sx={{
                  input: { color: '#fff' },
                  '& .MuiOutlinedInput-root fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                }}
              />
            </div>

            <FormControl fullWidth size="small">
              <InputLabel id="edit-participants-label" style={{ color: '#94a3b8' }}>Người tham gia</InputLabel>
              <Select
                labelId="edit-participants-label"
                multiple
                value={editParticipants}
                onChange={(e) => {
                  const val = e.target.value
                  setEditParticipants(typeof val === 'string' ? val.split(',') : val)
                }}
                input={<OutlinedInput label="Người tham gia" />}
                renderValue={(selected) => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selected.map((val) => (
                      <Chip key={val} label={val} size="small" style={{ backgroundColor: '#1e293b', color: '#38bdf8' }} />
                    ))}
                  </div>
                )}
                sx={{
                  color: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#38bdf8' },
                  '& .MuiSvgIcon-root': { color: '#94a3b8' },
                }}
              >
                {availableUsers.map((u) => (
                  <MenuItem key={u} value={u}>
                    <Checkbox checked={editParticipants.indexOf(u) > -1} />
                    <ListItemText primary={u} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions style={{ padding: '14px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Button onClick={() => setEditingBooking(null)} style={{ color: '#94a3b8' }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEditBooking}
              style={{ backgroundColor: '#0284c7', color: '#fff' }}
            >
              Lưu Thay Đổi
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
