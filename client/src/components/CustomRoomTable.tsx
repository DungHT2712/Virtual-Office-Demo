import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockIcon from '@mui/icons-material/Lock'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SearchIcon from '@mui/icons-material/Search'
import CheckIcon from '@mui/icons-material/Check'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import LogoutIcon from '@mui/icons-material/Logout'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import ApartmentIcon from '@mui/icons-material/Apartment'
import HubIcon from '@mui/icons-material/Hub'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

import { useAppSelector, useAppDispatch } from '../hooks'
import { removeAvailableRooms } from '../stores/RoomStore'
import { setWorkspaceData } from '../stores/WorkspaceStore'
import { setPlayerName } from '../stores/UserStore'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const ContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const UserInfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(56, 189, 248, 0.08);
  border: 1px dashed rgba(56, 189, 248, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: #cbd5e1;

  code {
    background: rgba(0, 0, 0, 0.3);
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
  }
`

const SearchBarWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;

  .search-input {
    flex: 1;

    .MuiOutlinedInput-root {
      background: rgba(255, 255, 255, 0.04);
      color: #f8fafc;
      border-radius: 8px;
      font-size: 13px;

      input {
        padding: 7px 10px;
      }

      fieldset {
        border-color: rgba(255, 255, 255, 0.15);
      }
      &:hover fieldset {
        border-color: #38bdf8;
      }
      &.Mui-focused fieldset {
        border-color: #38bdf8;
      }
    }
  }
`

const TabsContainer = styled.div`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .MuiTab-root {
    color: #94a3b8;
    text-transform: none;
    font-weight: 700;
    font-size: 13px;
    min-height: 36px;
    padding: 6px 12px;

    &.Mui-selected {
      color: #38bdf8;
    }
  }

  .MuiTabs-indicator {
    background-color: #38bdf8;
    height: 3px;
    border-radius: 3px;
  }
`

const CustomRoomTableContainer = styled(TableContainer)<{
  component: React.ElementType
}>`
  max-height: 290px;
  overflow-y: auto;
  overflow-x: auto;
  background: rgba(15, 23, 42, 0.6) !important;
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.08);

  /* Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #38bdf8;
  }

  table {
    min-width: 620px;
  }

  .MuiTableCell-root {
    padding: 7px 10px;
    font-size: 13px;
  }
`

const TableRowWrapper = styled(TableRow)`
  &:last-child td,
  &:last-child th {
    border: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .name {
    min-width: 110px;
    overflow-wrap: anywhere;
  }

  .description {
    min-width: 140px;
    overflow-wrap: anywhere;
  }
`

const MessageText = styled.p`
  margin: 24px;
  font-size: 15px;
  color: #94a3b8;
  text-align: center;
`

const StyledDialog = styled(Dialog)`
  z-index: 99999999 !important;

  .MuiBackdrop-root {
    z-index: 99999998 !important;
    background: rgba(0, 0, 0, 0.7);
  }

  .MuiDialog-paper {
    background: #1e2235;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 99999999 !important;
    min-width: 440px;
  }
`

export interface WorkspaceDisplayItem {
  roomId: string
  name: string
  description: string
  hasPassword: boolean
  clients: number
  sizeType?: string
  width?: number
  height?: number
  ownerId?: string
  ownerName?: string
  shareMode: 'free' | 'ask'
  sharedUsers: string[]
  pendingRequests: { userId: string; userName: string; requestedAt: number }[]
  companyName?: string
  departmentId?: string
  departmentName?: string
  requireLogin?: boolean
  metadata?: any
}

export const CustomRoomTable = () => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.user)
  const currentUserId = currentUser.userId
  const currentUserName = currentUser.playerName || 'Guest'

  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const availableRooms = useAppSelector((state) => state.room.availableRooms)

  // Tab State: 0: All, 1: My Workspace, 2: Shared Workspace
  const [activeTab, setActiveTab] = useState(0)

  // Search State
  const [searchWorkspaceId, setSearchWorkspaceId] = useState('')
  const [sharedWorkspaceIds, setSharedWorkspaceIds] = useState<string[]>([])
  const [serverWorkspaces, setServerWorkspaces] = useState<any[]>([])

  // Password Dialog State
  const [password, setPassword] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [passwordFieldEmpty, setPasswordFieldEmpty] = useState(false)

  // Workspace User Login Dialog State (for requireLogin)
  const [selectedAuthRoom, setSelectedAuthRoom] = useState<WorkspaceDisplayItem | null>(null)
  const [showUserAuthDialog, setShowUserAuthDialog] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [showAuthPass, setShowAuthPass] = useState(false)

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [targetDeleteRoom, setTargetDeleteRoom] = useState<{ id: string; name: string } | null>(null)

  // Remove from Shared Dialog State
  const [removeSharedDialogOpen, setRemoveSharedDialogOpen] = useState(false)
  const [targetRemoveSharedRoom, setTargetRemoveSharedRoom] = useState<{
    id: string
    name: string
    roomId: string
    metadataId?: string
  } | null>(null)

  // Share Dialog State
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [targetShareRoom, setTargetShareRoom] = useState<WorkspaceDisplayItem | null>(null)
  const [selectedShareMode, setSelectedShareMode] = useState<'free' | 'ask'>('free')
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Feedback Snackbar State
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Load shared workspace IDs from localStorage
  const loadSharedIds = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('skyoffice_shared_workspace_ids') || '[]')
      if (Array.isArray(stored)) {
        setSharedWorkspaceIds(stored)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Fetch workspaces from server API to ensure all persistent workspaces are visible
  const fetchServerWorkspaces = useCallback(async () => {
    try {
      const res = await fetch('/api/workspaces')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.workspaces)) {
          setServerWorkspaces(data.workspaces)
        }
      }
    } catch (e) {
      console.error('Failed to fetch workspaces from server API:', e)
    }
  }, [])

  useEffect(() => {
    loadSharedIds()
    fetchServerWorkspaces()

    const onSharedUpdated = () => {
      loadSharedIds()
      fetchServerWorkspaces()
    }
    window.addEventListener('skyoffice_shared_workspaces_updated', onSharedUpdated)
    window.addEventListener('storage', onSharedUpdated)
    const interval = setInterval(fetchServerWorkspaces, 1500)
    return () => {
      window.removeEventListener('skyoffice_shared_workspaces_updated', onSharedUpdated)
      window.removeEventListener('storage', onSharedUpdated)
      clearInterval(interval)
    }
  }, [loadSharedIds, fetchServerWorkspaces])

  // Merge availableRooms from Colyseus lobby with serverWorkspaces from storage
  // serverWorkspaces là nguồn dữ liệu chuẩn cho shareMode, sharedUsers, pendingRequests và ownerId
  const allWorkspaceItems: WorkspaceDisplayItem[] = React.useMemo(() => {
    const map = new Map<string, WorkspaceDisplayItem>()

    // 1. Khởi tạo từ availableRooms của Colyseus lobby (chứa live clients)
    availableRooms.forEach((r) => {
      const id = r.roomId
      const meta = r.metadata || {}
      map.set(id, {
        roomId: id,
        name: meta.name || id,
        description: meta.description || '',
        hasPassword: meta.hasPassword ?? false,
        clients: r.clients || 0,
        sizeType: meta.sizeType || 'MEDIUM',
        width: meta.width,
        height: meta.height,
        ownerId: meta.ownerId || '',
        ownerName: meta.ownerName || '',
        shareMode: meta.shareMode || 'free',
        sharedUsers: Array.isArray(meta.sharedUsers) ? meta.sharedUsers : [],
        pendingRequests: Array.isArray(meta.pendingRequests) ? meta.pendingRequests : [],
        companyName: meta.companyName || '',
        departmentId: meta.departmentId || '',
        departmentName: meta.departmentName || '',
        requireLogin: !!meta.requireLogin,
        metadata: meta,
      })
    })

    // 2. Ghi đè từ serverWorkspaces: Đảm bảo shareMode, sharedUsers, pendingRequests luôn mới nhất theo thời gian thực
    serverWorkspaces.forEach((sw) => {
      const id = sw.id || sw.name
      if (!id) return
      let activeRoom: WorkspaceDisplayItem | undefined
      if (sw.id && map.has(sw.id)) {
        activeRoom = map.get(sw.id)
      } else if (sw.name) {
        for (const [key, val] of map.entries()) {
          if (val.name === sw.name || val.metadata?.name === sw.name) {
            activeRoom = val
            map.delete(key) // Xóa key cũ để không bị duplicate phòng
            break
          }
        }
      }
      const finalRoomId = activeRoom?.roomId || id
      map.set(id, {
        roomId: finalRoomId,
        name: sw.name || activeRoom?.name || id,
        description: sw.description || activeRoom?.description || '',
        hasPassword: !!sw.hasPassword || (activeRoom?.hasPassword ?? false),
        clients: activeRoom?.clients || 0,
        sizeType: sw.sizeType || activeRoom?.sizeType || 'MEDIUM',
        width: sw.width || activeRoom?.width,
        height: sw.height || activeRoom?.height,
        ownerId: sw.ownerId || activeRoom?.ownerId || '',
        ownerName: sw.ownerName || activeRoom?.ownerName || '',
        shareMode: sw.shareMode || activeRoom?.shareMode || 'free',
        sharedUsers: Array.isArray(sw.sharedUsers) ? sw.sharedUsers : (activeRoom?.sharedUsers || []),
        pendingRequests: Array.isArray(sw.pendingRequests) ? sw.pendingRequests : (activeRoom?.pendingRequests || []),
        companyName: sw.companyName || activeRoom?.companyName || '',
        departmentId: sw.departmentId || activeRoom?.departmentId || '',
        departmentName: sw.departmentName || activeRoom?.departmentName || '',
        requireLogin: sw.requireLogin !== undefined ? !!sw.requireLogin : (activeRoom?.requireLogin ?? false),
        metadata: { ...activeRoom?.metadata, ...sw },
      })
    })

    // Also check saved_workspaces in localStorage to associate legacy workspaces with current user
    let localSaved: any[] = []
    try {
      localSaved = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
    } catch (e) {}

    const list = Array.from(map.values())
    return list.map((item) => {
      // If workspace name or ID is in user's saved_workspaces in this browser, claim/associate with current user
      const isSaved = localSaved.find((sw: any) => sw.name === item.name || sw.id === item.roomId)
      if (isSaved) {
        if (!item.ownerId) {
          fetch(`/api/workspaces/${item.roomId}/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ownerId: currentUserId, ownerName: currentUserName }),
          }).catch(() => null)
        }
        return { ...item, ownerId: item.ownerId || currentUserId, ownerName: item.ownerName || currentUserName }
      }
      return item
    })
  }, [availableRooms, serverWorkspaces, currentUserId, currentUserName])

  // Filter workspaces according to the requirements:
  // "Người dùng chỉ thấy được workspace do chính mình tạo, muốn thấy hoặc join vào workspace của người khác thì phải nhập mã workspace và được chấp thuận (nếu workspace đó bắt ask to join)"
  const { myWorkspaces, sharedWorkspaces } = React.useMemo(() => {
    const my: WorkspaceDisplayItem[] = []
    const shared: WorkspaceDisplayItem[] = []

    let localSaved: any[] = []
    try {
      localSaved = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
    } catch (e) {}

    allWorkspaceItems.forEach((ws) => {
      const isSavedLocally = localSaved.some(
        (sw: any) => sw.id === ws.roomId || sw.name === ws.name || (sw.id && sw.id === ws.metadata?.id)
      )
      const isOwner = ws.ownerId === currentUserId || isSavedLocally
      
      const hasEnteredCode =
        sharedWorkspaceIds.includes(ws.roomId) ||
        sharedWorkspaceIds.includes(ws.name) ||
        (ws.metadata?.id && sharedWorkspaceIds.includes(ws.metadata.id))
      const isApprovedUser = Array.isArray(ws.sharedUsers) && ws.sharedUsers.includes(currentUserId)
      const isPendingUser = Array.isArray(ws.pendingRequests) && ws.pendingRequests.some((r) => r.userId === currentUserId)

      // Đối với workspace của người khác:
      // - Chỉ hiển thị khi người dùng đã nhập mã workspace (hasEnteredCode) hoặc đã được duyệt (isApprovedUser)
      // - Nếu shareMode === 'ask': chỉ thấy và join khi đã được duyệt (isApprovedUser), hoặc hiển thị đang chờ duyệt nếu đã nhập mã
      const isShared =
        !isOwner &&
        ((ws.shareMode === 'free' && (hasEnteredCode || isApprovedUser)) ||
          (ws.shareMode === 'ask' && (isApprovedUser || (hasEnteredCode && isPendingUser))))

      if (isOwner) {
        my.push(ws)
      } else if (isShared) {
        shared.push(ws)
      }
    })

    return {
      myWorkspaces: my,
      sharedWorkspaces: shared,
    }
  }, [allWorkspaceItems, currentUserId, sharedWorkspaceIds])

  // Danh sách toàn bộ workspace thuộc về người dùng (Workspace tự tạo + Workspace đã nhập mã/được duyệt)
  const userAllWorkspaces = React.useMemo(() => {
    const combined = [...myWorkspaces, ...sharedWorkspaces]
    const seen = new Set<string>()
    return combined.filter((w) => {
      if (seen.has(w.roomId)) return false
      seen.add(w.roomId)
      return true
    })
  }, [myWorkspaces, sharedWorkspaces])

  // Current tab items: Tab 0 (All) chỉ hiển thị các workspace thuộc về người dùng
  const displayedWorkspaces =
    activeTab === 0 ? userAllWorkspaces : activeTab === 1 ? myWorkspaces : sharedWorkspaces

  // Xử lý Tìm kiếm và Thêm Workspace bằng Workspace ID
  const handleSearchAndAdd = async () => {
    const queryId = searchWorkspaceId.trim()
    if (!queryId) {
      setSnackbar({ open: true, message: 'Vui lòng nhập mã Workspace ID!', severity: 'error' })
      return
    }

    // 1. Kiểm tra nếu là workspace do mình tạo
    const isOwn = myWorkspaces.some(
      (w) => w.roomId === queryId || w.name === queryId || w.metadata?.id === queryId
    )
    if (isOwn) {
      setSnackbar({ open: true, message: 'Đây là Workspace do chính bạn tạo!', severity: 'info' })
      setSearchWorkspaceId('')
      return
    }

    // 2. Kiểm tra nếu phòng này ĐANG THỰC SỰ HIỂN THỊ trong danh sách shared của người dùng
    const alreadyInShared = sharedWorkspaces.some(
      (w) => w.roomId === queryId || w.name === queryId || w.metadata?.id === queryId
    )
    if (alreadyInShared) {
      setSnackbar({ open: true, message: 'Workspace này đã có trong danh sách của bạn!', severity: 'info' })
      setSearchWorkspaceId('')
      return
    }

    // 3. Tìm trên server
    try {
      const res = await fetch(`/api/workspaces/${encodeURIComponent(queryId)}`)
      if (!res.ok) {
        setSnackbar({ open: true, message: `Không tìm thấy Workspace với mã: "${queryId}"`, severity: 'error' })
        return
      }

      const data = await res.json()
      if (!data.success || !data.workspace) {
        setSnackbar({ open: true, message: `Không tìm thấy Workspace với mã: "${queryId}"`, severity: 'error' })
        return
      }

      const foundWs = data.workspace
      const targetId = foundWs.id || queryId
      const shareMode = foundWs.shareMode || 'free'

      // Kiểm tra lại nếu workspace tìm được là của chính mình
      if (myWorkspaces.some((w) => w.roomId === foundWs.id || w.name === foundWs.name)) {
        setSnackbar({ open: true, message: 'Đây là Workspace do chính bạn tạo!', severity: 'info' })
        setSearchWorkspaceId('')
        return
      }

      // Kiểm tra lại nếu workspace tìm được đang có mặt trong danh sách shared
      if (sharedWorkspaces.some((w) => w.roomId === foundWs.id || w.name === foundWs.name)) {
        setSnackbar({ open: true, message: 'Workspace này đã có trong danh sách của bạn!', severity: 'info' })
        setSearchWorkspaceId('')
        return
      }

      // Lưu vào danh sách Shared của người dùng
      const updatedShared = [...new Set([...sharedWorkspaceIds, targetId])]
      setSharedWorkspaceIds(updatedShared)
      localStorage.setItem('skyoffice_shared_workspace_ids', JSON.stringify(updatedShared))
      window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))

      // Nếu workspace là Free, gọi request-join để tự động thêm user vào sharedUsers
      if (shareMode === 'free') {
        await fetch(`/api/workspaces/${targetId}/request-join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, userName: currentUserName }),
        })
        setSnackbar({
          open: true,
          message: `Đã thêm thành công Workspace "${foundWs.name}" (Free) vào danh sách của bạn!`,
          severity: 'success',
        })
      } else {
        // shareMode === 'ask'
        const isApproved = Array.isArray(foundWs.sharedUsers) && foundWs.sharedUsers.includes(currentUserId)
        if (isApproved) {
          setSnackbar({
            open: true,
            message: `Workspace "${foundWs.name}" đã được chủ phòng chấp thuận trước đó, đã thêm vào danh sách!`,
            severity: 'success',
          })
        } else {
          // Tự động gửi yêu cầu tham gia tới chủ phòng
          await fetch(`/api/workspaces/${targetId}/request-join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, userName: currentUserName }),
          })
          setSnackbar({
            open: true,
            message: `Workspace "${foundWs.name}" yêu cầu phê duyệt. Đã gửi yêu cầu tham gia tới chủ phòng! Bạn chỉ có thể tham gia sau khi được chấp thuận.`,
            severity: 'info',
          })
        }
      }

      setSearchWorkspaceId('')
      await fetchServerWorkspaces()
    } catch (e) {
      console.error('Search error:', e)
      setSnackbar({ open: true, message: 'Lỗi khi tìm kiếm workspace!', severity: 'error' })
    }
  }

  // Xử lý gửi yêu cầu Ask To Join
  const handleAskToJoin = async (workspaceId: string, workspaceName: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, userName: currentUserName }),
      })
      const data = await res.json()
      if (data.success) {
        setSnackbar({
          open: true,
          message: `Đã gửi yêu cầu gia nhập Workspace "${workspaceName}" tới chủ phòng!`,
          severity: 'success',
        })
        window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
        await fetchServerWorkspaces()
      } else {
        setSnackbar({ open: true, message: data.message || 'Gửi yêu cầu thất bại', severity: 'error' })
      }
    } catch (e) {
      console.error(e)
      setSnackbar({ open: true, message: 'Có lỗi xảy ra khi gửi yêu cầu', severity: 'error' })
    }
  }

  // Xử lý Mở dialog Xác nhận Xóa Workspace khỏi Shared list
  const handleOpenRemoveSharedDialog = (ws: WorkspaceDisplayItem) => {
    setTargetRemoveSharedRoom({
      id: ws.roomId,
      name: ws.name,
      roomId: ws.roomId,
      metadataId: ws.metadata?.id,
    })
    setRemoveSharedDialogOpen(true)
  }

  // Xử lý Xác nhận Xóa Workspace khỏi Shared list
  const handleConfirmRemoveShared = async () => {
    if (!targetRemoveSharedRoom) return
    const { id, name, roomId, metadataId } = targetRemoveSharedRoom
    setRemoveSharedDialogOpen(false)
    setTargetRemoveSharedRoom(null)

    try {
      const idsToRemove = new Set([id, name, roomId, metadataId].filter(Boolean) as string[])
      const updated = sharedWorkspaceIds.filter((item) => !idsToRemove.has(item))
      setSharedWorkspaceIds(updated)
      localStorage.setItem('skyoffice_shared_workspace_ids', JSON.stringify(updated))

      await fetch(`/api/workspaces/${encodeURIComponent(roomId || id)}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      })

      window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
      await fetchServerWorkspaces()
      setSnackbar({
        open: true,
        message: `Đã xóa Workspace "${name}" khỏi danh sách của bạn`,
        severity: 'info',
      })
    } catch (e) {
      console.error('Error removing from shared list:', e)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa workspace khỏi danh sách',
        severity: 'error',
      })
    }
  }

  // Xử lý Mở dialog Share
  const handleOpenShare = (ws: WorkspaceDisplayItem) => {
    if (!ws.ownerId || ws.ownerId === currentUserId) {
      fetch(`/api/workspaces/${ws.roomId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: currentUserId, ownerName: currentUserName }),
      }).catch(() => null)
    }
    setTargetShareRoom(ws)
    setSelectedShareMode(ws.shareMode || 'free')
    setCopiedNotification(false)
    setShareDialogOpen(true)
  }

  // Xử lý Copy Workspace ID
  const handleCopyWorkspaceId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
    setSnackbar({ open: true, message: `Đã copy Workspace ID: ${id}`, severity: 'success' })
  }

  // Xử lý Cập nhật Share Mode (Free / Ask To Join)
  const handleUpdateShareMode = async () => {
    if (!targetShareRoom) return
    try {
      const res = await fetch(`/api/workspaces/${targetShareRoom.roomId}/share-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareMode: selectedShareMode,
          ownerId: currentUserId,
          ownerName: currentUserName,
        }),
      })
      if (res.ok) {
        setSnackbar({
          open: true,
          message: `Đã đổi chế độ chia sẻ thành: ${
            selectedShareMode === 'free' ? 'Free (Tự do)' : 'Ask To Join (Cần duyệt)'
          }`,
          severity: 'success',
        })
        setShareDialogOpen(false)
        window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
        await fetchServerWorkspaces()
      } else {
        const data = await res.json().catch(() => null)
        setSnackbar({
          open: true,
          message: data?.message || 'Không thể cập nhật chế độ chia sẻ!',
          severity: 'error',
        })
      }
    } catch (e) {
      console.error('Failed to update share mode:', e)
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật chế độ chia sẻ',
        severity: 'error',
      })
    }
  }

  // Xử lý Xóa Workspace (Chủ sở hữu)
  const handleDeleteRoomClick = (id: string, name: string) => {
    setTargetDeleteRoom({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!targetDeleteRoom) return
    const idToDelete = targetDeleteRoom.id
    const nameToDelete = targetDeleteRoom.name

    dispatch(removeAvailableRooms(idToDelete))

    try {
      const stored = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
      const updated = stored.filter((w: any) => w.id !== idToDelete && w.name !== nameToDelete)
      localStorage.setItem('saved_workspaces', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }

    setDeleteDialogOpen(false)
    setTargetDeleteRoom(null)

    try {
      const params = new URLSearchParams()
      if (nameToDelete) params.append('name', nameToDelete)
      params.append('requesterId', currentUserId)
      await fetch(`/api/workspaces/${idToDelete}?${params.toString()}`, { method: 'DELETE' }).catch(() => null)
    } catch (e) {
      console.error('Error deleting workspace on server:', e)
    }
    await fetchServerWorkspaces()
  }

  // Xử lý Join phòng
  const handleJoinClick = (roomId: string, pass: string | null) => {
    if (!lobbyJoined) return
    const targetRoom = allWorkspaceItems.find(
      (r) => r.roomId === roomId || r.name === roomId || (r.metadata && r.metadata.id === roomId)
    )
    const isOwner = targetRoom?.ownerId === currentUserId
    const isApproved = Array.isArray(targetRoom?.sharedUsers) && targetRoom?.sharedUsers.includes(currentUserId)
    if (targetRoom && targetRoom.shareMode === 'ask' && !isOwner && !isApproved) {
      setSnackbar({
        open: true,
        message: 'Bạn chưa được chủ workspace chấp thuận yêu cầu gia nhập!',
        severity: 'warning',
      })
      return
    }

    let targetWidth = targetRoom?.width || targetRoom?.metadata?.width
    let targetHeight = targetRoom?.height || targetRoom?.metadata?.height
    const targetSizeType = (targetRoom?.sizeType || targetRoom?.metadata?.sizeType || 'MEDIUM') as any

    if (!targetWidth || !targetHeight) {
      if (targetSizeType === 'SMALL') {
        targetWidth = 20
        targetHeight = 20
      } else if (targetSizeType === 'LARGE') {
        targetWidth = 70
        targetHeight = 70
      } else if (targetSizeType === 'XLARGE') {
        targetWidth = 100
        targetHeight = 100
      } else {
        targetWidth = 50
        targetHeight = 50
      }
    }

    dispatch(
      setWorkspaceData({
        sizeType: targetSizeType,
        width: targetWidth,
        height: targetHeight,
      })
    )

    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network
      .joinCustomById(roomId, pass)
      .then(() => bootstrap.launchGame())
      .catch((error) => {
        console.error(error)
        if (pass) setShowPasswordError(true)
      })
  }

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValidPassword = password !== ''

    if (isValidPassword === passwordFieldEmpty) setPasswordFieldEmpty(!passwordFieldEmpty)
    if (isValidPassword) handleJoinClick(selectedRoom, password)
  }

  const resetPasswordDialog = () => {
    setShowPasswordDialog(false)
    setPassword('')
    setPasswordFieldEmpty(false)
    setShowPasswordError(false)
  }

  // Xử lý Kiểm tra & Đăng nhập tài khoản User trước khi vào Workspace (cho requireLogin)
  const handleJoinWorkspaceAction = (ws: WorkspaceDisplayItem) => {
    const isOwner = ws.ownerId === currentUserId
    const isApproved = Array.isArray(ws.sharedUsers) && ws.sharedUsers.includes(currentUserId)
    if (ws.shareMode === 'ask' && !isOwner && !isApproved) {
      setSnackbar({
        open: true,
        message: 'Bạn chưa được chủ workspace chấp thuận yêu cầu gia nhập!',
        severity: 'warning',
      })
      return
    }

    if (ws.requireLogin && !isOwner) {
      // Trừ chủ workspace, khi vào workspace sẽ có khung đăng nhập để check tài khoản và mật khẩu
      setSelectedAuthRoom(ws)
      setAuthUsername('')
      setAuthPassword('')
      setAuthError('')
      setShowUserAuthDialog(true)
    } else if (ws.hasPassword) {
      setSelectedRoom(ws.roomId)
      setShowPasswordDialog(true)
    } else {
      // Không cần đăng nhập hoặc là chủ workspace: ra vào tự do
      handleJoinClick(ws.roomId, null)
    }
  }

  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authUsername.trim()) {
      setAuthError('Vui lòng nhập tên tài khoản (Username)!')
      return
    }
    setAuthLoading(true)
    setAuthError('')

    try {
      const res = await fetch(`/api/workspaces/${selectedAuthRoom?.roomId}/auth-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername.trim(),
          password: authPassword.trim(),
          userId: currentUserId,
        }),
      })

      const data = await res.json()
      if (data.success && data.verified) {
        setShowUserAuthDialog(false)
        if (data.user) {
          sessionStorage.setItem(`ws_auth_${selectedAuthRoom?.roomId}`, JSON.stringify(data.user))
          dispatch(setPlayerName(data.user.name))
        }
        if (selectedAuthRoom?.hasPassword) {
          setSelectedRoom(selectedAuthRoom.roomId)
          setShowPasswordDialog(true)
        } else {
          handleJoinClick(selectedAuthRoom!.roomId, null)
        }
      } else {
        setAuthError(data.message || 'Tài khoản hoặc mật khẩu không chính xác!')
      }
    } catch (err: any) {
      setAuthError(err.message || 'Lỗi kiểm tra đăng nhập')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <ContainerWrapper>
      {/* Thông báo thanh thông tin User ID */}
      <UserInfoBar>
        <div>
          Mã User ID của bạn: <code>{currentUserId}</code>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '12px' }}>
          Bạn chỉ xem được Workspace do chính mình tạo hoặc được chia sẻ
        </div>
      </UserInfoBar>

      {/* Thanh Search để nhập mã Workspace do người khác chia sẻ */}
      <SearchBarWrapper>
        <TextField
          className="search-input"
          size="small"
          placeholder="Nhập mã Workspace ID được chia sẻ (vd: 3E7gJcg8h)..."
          value={searchWorkspaceId}
          onChange={(e) => setSearchWorkspaceId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearchAndAdd()
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchAndAdd}
          sx={{
            background: '#0284c7',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 700,
            px: 2.5,
            height: '40px',
            borderRadius: '10px',
            '&:hover': { background: '#0369a1' },
          }}
        >
          Tìm & Thêm
        </Button>
      </SearchBarWrapper>

      {/* 3 Tab: All, My Workspace, Shared Workspace */}
      <TabsContainer>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="inherit"
          indicatorColor="primary"
        >
          <Tab label={`All (${userAllWorkspaces.length})`} />
          <Tab label={`My Workspace (${myWorkspaces.length})`} />
          <Tab label={`Shared Workspace (${sharedWorkspaces.length})`} />
        </Tabs>
      </TabsContainer>

      {/* Bảng danh sách Workspace */}
      {displayedWorkspaces.length === 0 ? (
        <MessageText>
          {activeTab === 1
            ? 'Bạn chưa tạo Workspace nào. Hãy bấm nút "Tạo Workspace Mới" bên dưới!'
            : activeTab === 2
            ? 'Bạn chưa có Workspace được chia sẻ nào. Hãy nhập mã Workspace ID vào thanh tìm kiếm ở trên để thêm!'
            : 'Hiện chưa có Workspace nào trong danh sách của bạn. Bạn chỉ thấy Workspace do chính mình tạo hoặc nhập mã Workspace được chia sẻ.'}
        </MessageText>
      ) : (
        <CustomRoomTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>Workspace Name</TableCell>
                <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>Description</TableCell>
                <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>Workspace ID</TableCell>
                <TableCell align="center" style={{ fontWeight: 700, color: '#f8fafc' }}>
                  Chế độ
                </TableCell>
                <TableCell align="center" style={{ fontWeight: 700, color: '#f8fafc' }}>
                  Số người
                </TableCell>
                <TableCell align="center" style={{ fontWeight: 700, color: '#f8fafc' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedWorkspaces.map((ws) => {
                const { roomId, name, description, hasPassword, clients, ownerId, shareMode, sharedUsers, pendingRequests } = ws
                const isOwner = ownerId === currentUserId
                const isApproved = sharedUsers?.includes(currentUserId)
                const isPending = pendingRequests?.some((r) => r.userId === currentUserId)

                // Xác định quyền hành động:
                // Nếu là Free hoặc Đã được duyệt hoặc là Chủ: hiển thị nút Join bình thường
                const canJoin = isOwner || shareMode === 'free' || isApproved

                return (
                  <TableRowWrapper key={roomId}>
                    <TableCell>
                      <div className="name" style={{ fontWeight: 600, color: '#ffffff' }}>
                        {name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {isOwner && (
                          <Chip
                            label="Chủ phòng"
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}
                          />
                        )}
                        {ws.companyName && (
                          <Chip
                            icon={<ApartmentIcon sx={{ fontSize: 11 }} />}
                            label={ws.companyName}
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}
                          />
                        )}
                        {ws.departmentName && (
                          <Chip
                            icon={<HubIcon sx={{ fontSize: 11 }} />}
                            label={ws.departmentName}
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}
                          />
                        )}
                        {ws.requireLogin ? (
                          <Chip
                            icon={<VpnKeyIcon sx={{ fontSize: 11 }} />}
                            label="Cần đăng nhập"
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}
                          />
                        ) : (
                          <Chip
                            icon={<LockOpenIcon sx={{ fontSize: 11 }} />}
                            label="Ra vào tự do"
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}
                          />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="description" style={{ color: '#cbd5e1', fontSize: '13px' }}>
                        {description || 'Không có mô tả'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Tooltip title="Bấm để copy ID">
                        <Chip
                          label={roomId}
                          size="small"
                          onClick={() => handleCopyWorkspaceId(roomId)}
                          icon={<ContentCopyIcon style={{ fontSize: 13 }} />}
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#38bdf8',
                            cursor: 'pointer',
                            '&:hover': { background: 'rgba(56, 189, 248, 0.2)' },
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={shareMode === 'free' ? 'Free' : 'Ask To Join'}
                        size="small"
                        sx={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor:
                            shareMode === 'free' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: shareMode === 'free' ? '#4ade80' : '#fbbf24',
                          border: `1px solid ${shareMode === 'free' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '15px' }}>
                        {clients}
                      </span>
                    </TableCell>

                    <TableCell align="center">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {/* 1. Nút JOIN hoặc ASK TO JOIN */}
                        {canJoin ? (
                          <Tooltip title={ws.requireLogin && !isOwner ? 'Yêu cầu tài khoản User' : hasPassword ? 'Cần mật khẩu' : ''}>
                            <Button
                              variant="contained"
                              size="small"
                              style={{
                                background: ws.requireLogin && !isOwner ? '#d97706' : '#0284c7',
                                color: '#ffffff',
                                fontWeight: 600,
                                textTransform: 'none',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                              }}
                              onClick={() => handleJoinWorkspaceAction(ws)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {ws.requireLogin && !isOwner ? (
                                  <VpnKeyIcon style={{ fontSize: 14 }} />
                                ) : (
                                  hasPassword && <LockIcon style={{ fontSize: 14 }} />
                                )}
                                Join
                              </div>
                            </Button>
                          </Tooltip>
                        ) : isPending ? (
                          <Tooltip title="Yêu cầu của bạn đang chờ chủ phòng phê duyệt trong cửa sổ thông báo">
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled
                                startIcon={<HourglassTopIcon style={{ fontSize: 14 }} />}
                                sx={{
                                  borderColor: '#f59e0b',
                                  color: '#fbbf24 !important',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  background: 'rgba(245, 158, 11, 0.1)',
                                }}
                              >
                                Đang chờ duyệt
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Gửi yêu cầu tới chủ workspace để được duyệt vào phòng">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<HowToRegIcon style={{ fontSize: 15 }} />}
                              onClick={() => handleAskToJoin(roomId, name)}
                              sx={{
                                background: '#d97706',
                                color: '#ffffff',
                                fontWeight: 700,
                                textTransform: 'none',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                '&:hover': { background: '#b45309' },
                              }}
                            >
                              Ask to Join
                            </Button>
                          </Tooltip>
                        )}

                        {/* 2. Nút SHARE */}
                        <Tooltip
                          title={
                            isOwner
                              ? 'Chia sẻ Workspace ID và quản lý chế độ Free / Ask to Join'
                              : 'Copy mã Workspace ID để chia sẻ'
                          }
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon style={{ fontSize: 14 }} />}
                            onClick={() => handleOpenShare(ws)}
                            sx={{
                              borderColor: 'rgba(56, 189, 248, 0.4)',
                              color: '#38bdf8',
                              fontWeight: 600,
                              textTransform: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              background: 'rgba(56, 189, 248, 0.08)',
                              '&:hover': {
                                background: 'rgba(56, 189, 248, 0.2)',
                                borderColor: '#38bdf8',
                              },
                            }}
                          >
                            Share
                          </Button>
                        </Tooltip>

                        {/* 3. Nút XÓA (Chủ phòng xóa phòng) hoặc RỜI KHỎI (Người được share bỏ theo dõi) */}
                        {isOwner ? (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineIcon style={{ fontSize: 14 }} />}
                            sx={{
                              borderColor: '#ef4444',
                              color: '#f87171',
                              fontWeight: 600,
                              textTransform: 'none',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              background: 'rgba(239, 68, 68, 0.08)',
                              '&:hover': { background: 'rgba(239, 68, 68, 0.2)' },
                            }}
                            onClick={() => handleDeleteRoomClick(roomId, name)}
                          >
                            Xóa
                          </Button>
                        ) : (
                          <Tooltip title="Xóa workspace này khỏi danh sách của bạn">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<LogoutIcon style={{ fontSize: 13 }} />}
                              sx={{
                                borderColor: 'rgba(148, 163, 184, 0.3)',
                                color: '#94a3b8',
                                fontWeight: 600,
                                textTransform: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                '&:hover': { borderColor: '#ef4444', color: '#f87171' },
                              }}
                              onClick={() => handleOpenRemoveSharedDialog(ws)}
                            >
                              Xóa khỏi list
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRowWrapper>
                )
              })}
            </TableBody>
          </Table>
        </CustomRoomTableContainer>
      )}

      {/* DIALOG SHARE WORKSPACE */}
      <StyledDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon sx={{ color: '#38bdf8' }} /> Chia Sẻ Workspace
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: 6 }}>Tên Workspace:</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              {targetShareRoom?.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: 6 }}>
              Mã Workspace ID (Đưa mã này cho người khác):
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextField
                fullWidth
                size="small"
                value={targetShareRoom?.roomId || ''}
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#38bdf8',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleCopyWorkspaceId(targetShareRoom?.roomId || '')}
                startIcon={copiedNotification ? <CheckIcon /> : <ContentCopyIcon />}
                sx={{
                  background: copiedNotification ? '#16a34a' : '#0284c7',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {copiedNotification ? 'Đã Copy!' : 'Copy ID'}
              </Button>
            </div>
          </div>

          {/* Chỉ chủ sở hữu mới có quyền thay đổi shareMode, người khác chỉ copy được mã */}
          {targetShareRoom?.ownerId === currentUserId ? (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                Chế độ tham gia (Share Mode):
              </div>
              <FormControl component="fieldset">
                <RadioGroup
                  value={selectedShareMode}
                  onChange={(e) => setSelectedShareMode(e.target.value as 'free' | 'ask')}
                >
                  <FormControlLabel
                    value="free"
                    control={<Radio sx={{ color: '#38bdf8', '&.Mui-checked': { color: '#38bdf8' } }} />}
                    label={
                      <div>
                        <b style={{ color: '#f8fafc' }}>Free</b>{' '}
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          — Tự do gia nhập nếu có Workspace ID
                        </span>
                      </div>
                    }
                  />
                  <FormControlLabel
                    value="ask"
                    control={<Radio sx={{ color: '#f59e0b', '&.Mui-checked': { color: '#f59e0b' } }} />}
                    label={
                      <div>
                        <b style={{ color: '#f8fafc' }}>Ask To Join</b>{' '}
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                          — Cần hỏi và xác nhận của chủ phòng để vào workspace
                        </span>
                      </div>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: 6 }}>
                Chế độ tham gia hiện tại:
              </div>
              <div>
                <Chip
                  label={
                    targetShareRoom?.shareMode === 'ask'
                      ? 'Ask To Join (Cần duyệt)'
                      : 'Free (Tự do tham gia)'
                  }
                  size="small"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor:
                      targetShareRoom?.shareMode === 'ask'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                    color: targetShareRoom?.shareMode === 'ask' ? '#fbbf24' : '#4ade80',
                    border: `1px solid ${
                      targetShareRoom?.shareMode === 'ask'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(34, 197, 94, 0.3)'
                    }`,
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: 8 }}>
                * Bạn chỉ có thể copy mã Workspace ID để chia sẻ. Chỉ chủ workspace mới có quyền cập nhật chế độ chia sẻ.
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setShareDialogOpen(false)}
            sx={{ color: '#94a3b8', textTransform: 'none' }}
          >
            Đóng
          </Button>
          {targetShareRoom?.ownerId === currentUserId && (
            <Button
              variant="contained"
              onClick={handleUpdateShareMode}
              sx={{
                background: '#0284c7',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                px: 2.5,
                '&:hover': { background: '#0369a1' },
              }}
            >
              Lưu Thiết Lập
            </Button>
          )}
        </DialogActions>
      </StyledDialog>

      {/* DIALOG NHẬP PASSWORD ĐỂ JOIN PHÒNG KHÓA */}
      <StyledDialog open={showPasswordDialog} onClose={resetPasswordDialog}>
        <form onSubmit={handlePasswordSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#f8fafc' }}>
            Workspace Yêu Cầu Mật Khẩu
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
              Workspace này được bảo vệ bằng mật khẩu. Vui lòng nhập mật khẩu để tham gia:
            </p>
            <TextField
              autoFocus
              fullWidth
              error={passwordFieldEmpty}
              helperText={passwordFieldEmpty && 'Vui lòng nhập mật khẩu'}
              value={password}
              label="Mật khẩu"
              type="password"
              variant="outlined"
              color="primary"
              onInput={(e) => {
                setPassword((e.target as HTMLInputElement).value)
              }}
            />
            {showPasswordError && (
              <Alert severity="error" variant="filled">
                Mật khẩu không chính xác!
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={resetPasswordDialog} sx={{ color: '#94a3b8', textTransform: 'none' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ background: '#0284c7', color: '#fff', textTransform: 'none', fontWeight: 700 }}
            >
              Tham Gia
            </Button>
          </DialogActions>
        </form>
      </StyledDialog>

      {/* DIALOG ĐĂNG NHẬP USER DÀNH CHO WORKSPACE CẦN ĐĂNG NHẬP */}
      <StyledDialog open={showUserAuthDialog} onClose={() => setShowUserAuthDialog(false)}>
        <form onSubmit={handleUserAuthSubmit}>
          <DialogTitle sx={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VpnKeyIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
            Đăng Nhập Vào Workspace
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                {selectedAuthRoom?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {selectedAuthRoom?.companyName && (
                  <Chip
                    icon={<ApartmentIcon sx={{ fontSize: 11 }} />}
                    label={selectedAuthRoom.companyName}
                    size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}
                  />
                )}
                {selectedAuthRoom?.departmentName && (
                  <Chip
                    icon={<HubIcon sx={{ fontSize: 11 }} />}
                    label={selectedAuthRoom.departmentName}
                    size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}
                  />
                )}
              </div>
            </div>

            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>
              Workspace này yêu cầu xác thực tài khoản & mật khẩu (lấy từ danh mục User). Vui lòng nhập thông tin đăng nhập của bạn:
            </p>

            <TextField
              autoFocus
              fullWidth
              label="Tên tài khoản (Username)"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#f8fafc',
                },
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu (Password)"
              type={showAuthPass ? 'text' : 'password'}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: '#f8fafc',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowAuthPass(!showAuthPass)}
                      sx={{ color: '#94a3b8' }}
                    >
                      {showAuthPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {authError && (
              <Alert severity="error" variant="filled" sx={{ fontSize: '13px' }}>
                {authError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setShowUserAuthDialog(false)}
              sx={{ color: '#94a3b8', textTransform: 'none' }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={authLoading}
              sx={{
                background: '#d97706',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { background: '#b45309' },
              }}
            >
              {authLoading ? 'Đang kiểm tra...' : 'Đăng Nhập & Vào'}
            </Button>
          </DialogActions>
        </form>
      </StyledDialog>

      {/* DIALOG XÁC NHẬN XÓA WORKSPACE */}
      <StyledDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '18px' }}>
          <DeleteOutlineIcon fontSize="medium" /> Xác Nhận Xóa Workspace?
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa vĩnh viễn Workspace <b style={{ color: '#f87171' }}>"{targetDeleteRoom?.name}"</b> (ID: <code style={{ color: '#38bdf8' }}>{targetDeleteRoom?.id}</code>) không?
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 8, marginBottom: 0 }}>
            Thao tác này sẽ xóa vĩnh viễn dữ liệu phòng và không thể hoàn tác.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              color: '#94a3b8',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { background: '#b91c1c' },
            }}
          >
            Xác Nhận Xóa
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* DIALOG XÁC NHẬN XÓA WORKSPACE KHỎI DANH SÁCH (NGƯỜI ĐƯỢC SHARE) */}
      <StyledDialog
        open={removeSharedDialogOpen}
        onClose={() => setRemoveSharedDialogOpen(false)}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '18px',
          }}
        >
          <LogoutIcon fontSize="medium" /> Xác Nhận Xóa Khỏi Danh Sách?
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa Workspace{' '}
            <b style={{ color: '#38bdf8' }}>"{targetRemoveSharedRoom?.name}"</b> khỏi danh sách của bạn không?
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 8, marginBottom: 0 }}>
            * Thao tác này chỉ gỡ Workspace khỏi danh sách của bạn và hoàn toàn không ảnh hưởng đến Workspace gốc của chủ phòng.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setRemoveSharedDialogOpen(false)}
            variant="outlined"
            sx={{
              color: '#94a3b8',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRemoveShared}
            sx={{
              background: '#ef4444',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { background: '#dc2626' },
            }}
          >
            Xác Nhận Xóa
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* SNACKBAR THÔNG BÁO FEEDBACK */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ContainerWrapper>
  )
}
