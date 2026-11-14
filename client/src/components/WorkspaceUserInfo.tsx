import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import Chip from '@mui/material/Chip'

import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

import { useAppSelector, useAppDispatch } from '../hooks'
import { setCurrentStatus } from '../stores/UserStore'
import NotificationDialog from './NotificationDialog'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

const Container = styled.div`
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  padding: 10px 14px;
  gap: 8px;
  min-width: 280px;
  max-width: 380px;
  color: #f8fafc;
  user-select: none;
  pointer-events: auto;
  transition: all 0.25s ease;

  @media (max-width: 600px) {
    min-width: 250px;
    max-width: calc(100vw - 32px);
    padding: 8px 12px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const WorkspaceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
`

const IconBadge = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
`

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 1.25;

  .label {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const ShareBtn = styled(IconButton)`
  padding: 4px !important;
  color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.1) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0;

  &:hover {
    background: rgba(56, 189, 248, 0.25) !important;
    color: #ffffff !important;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.4) !important;
  }
`

const TopRightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

const WebcamBtn = styled(IconButton)<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? '#10b981 !important' : 'rgba(30, 41, 59, 0.8) !important'};
  border: 1px solid
    ${(props) => (props.$active ? '#6ee7b7' : 'rgba(255, 255, 255, 0.12)')} !important;
  color: #ffffff !important;
  padding: 6px !important;
  box-shadow: ${(props) =>
    props.$active ? '0 0 10px rgba(16, 185, 129, 0.6) !important' : 'none'};
  transition: all 0.2s ease !important;

  &:hover {
    background: ${(props) => (props.$active ? '#059669 !important' : '#334155 !important')};
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4) !important;
  }
`

const NotificationBtn = styled(IconButton)`
  background: rgba(30, 41, 59, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: #e2e8f0 !important;
  padding: 6px !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: #334155 !important;
    color: #38bdf8 !important;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.3) !important;
  }
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  width: 100%;
`

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
`

const UserAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(147, 51, 234, 0.15);
  border: 1px solid rgba(147, 51, 234, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c084fc;
  flex-shrink: 0;
`

const StatusSelectContainer = styled.div`
  position: relative;
`

const StatusTrigger = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${(props) => (props.$isOpen ? 'rgba(51, 65, 85, 0.9)' : 'rgba(30, 41, 59, 0.85)')};
  border: 1px solid ${(props) => (props.$isOpen ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)')};
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(51, 65, 85, 0.9);
    border-color: #38bdf8;
  }
`

const StatusDot = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
  display: inline-block;
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
`

const StatusLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
`

const StatusDropdown = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 170px;
  z-index: 1100;
  backdrop-filter: blur(12px);
`

const DropdownHeader = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  padding: 4px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 3px;
`

const StatusOption = styled.div<{ $selected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${(props) => (props.$selected ? 'rgba(56, 189, 248, 0.15)' : 'transparent')};
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .status-name {
    font-size: 12px;
    font-weight: ${(props) => (props.$selected ? 700 : 500)};
    color: ${(props) => (props.$selected ? '#38bdf8' : '#f1f5f9')};
    flex: 1;
    white-space: nowrap;
  }
`

export default function WorkspaceUserInfo() {
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  // Share Dialog State
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareMode, setShareMode] = useState<'free' | 'ask'>('free')
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)
  const [savingShareMode, setSavingShareMode] = useState(false)

  const roomName = useAppSelector((state) => state.room.roomName)
  const roomId = useAppSelector((state) => state.room.roomId)
  const playerName = useAppSelector((state) => state.user.playerName)
  const statuses = useAppSelector((state) => state.user.statuses)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const currentUser = useAppSelector((state) => state.user)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const dispatch = useAppDispatch()

  // Bật / tắt Webcam
  const handleToggleWebcam = () => {
    const game = phaserGame.scene.keys.game as Game
    if (game && game.network && game.network.webRTC) {
      if (videoConnected) {
        game.network.webRTC.stopUserMedia()
      } else {
        game.network.webRTC.getUserMedia()
      }
    }
  }

  // Mở Dialog Share Workspace
  const handleOpenShare = async () => {
    try {
      const res = await fetch('/api/workspaces')
      if (res.ok) {
        const list = await res.json()
        const currentWs = list.find((w: any) => w.roomId === roomId || w.id === roomId)
        if (currentWs) {
          setShareMode(currentWs.shareMode || 'free')
          setOwnerId(currentWs.ownerId || null)
        }
      }
    } catch (e) {}
    setCopiedNotification(false)
    setShareDialogOpen(true)
  }

  // Copy Workspace ID
  const handleCopyWorkspaceId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      setCopiedNotification(true)
      setTimeout(() => setCopiedNotification(false), 2500)
    }
  }

  // Cập nhật Share Mode
  const handleUpdateShareMode = async () => {
    if (!roomId) return
    setSavingShareMode(true)
    try {
      const res = await fetch(`/api/workspaces/${roomId}/share-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareMode,
          ownerId: currentUser.userId,
          ownerName: currentUser.playerName || 'Guest',
        }),
      })
      if (res.ok) {
        setShareDialogOpen(false)
        window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
      }
    } catch (e) {
    } finally {
      setSavingShareMode(false)
    }
  }

  // Cập nhật số thông báo thời gian thực
  useEffect(() => {
    if (!currentUser.userId) return

    const updateCount = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${encodeURIComponent(currentUser.userId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.notifications)) {
            const count = data.notifications.filter(
              (n: any) => n.status === 'pending' || n.status === 'unread' || !n.status
            ).length
            setUnreadCount(count)
          }
        }
      } catch (e) {}
    }
    updateCount()

    const onUnreadUpdate = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setUnreadCount(e.detail.count)
      }
    }
    window.addEventListener('skyoffice_unread_count_updated', onUnreadUpdate)
    const timer = setInterval(updateCount, 2500)
    return () => {
      window.removeEventListener('skyoffice_unread_count_updated', onUnreadUpdate)
      clearInterval(timer)
    }
  }, [currentUser.userId])

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false)
      }
    }
    if (statusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [statusMenuOpen])

  if (designMode) return null

  const displayRoomName = roomName || roomId || 'Không gian làm việc'
  const displayPlayerName = playerName || 'Guest'
  const isOwner = !ownerId || ownerId === currentUser.userId

  return (
    <>
      <Container>
        {/* Hàng trên: Thông tin Workspace + Nút Share + Nút Webcam & Nút Thông báo */}
        <TopRow>
          <WorkspaceSection>
            <IconBadge>
              <BusinessIcon sx={{ fontSize: 18 }} />
            </IconBadge>
            <TextBlock>
              <span className="label">Workspace</span>
              <span className="value" title={displayRoomName}>
                {displayRoomName}
              </span>
            </TextBlock>
            <Tooltip title="Chia sẻ Workspace">
              <ShareBtn
                size="small"
                onClick={handleOpenShare}
                aria-label="share workspace"
              >
                <ShareIcon sx={{ fontSize: 15 }} />
              </ShareBtn>
            </Tooltip>
          </WorkspaceSection>

          <TopRightActions>
            {/* Nút Bật / Tắt Webcam */}
            <Tooltip title={videoConnected ? 'Tắt Webcam / Camera' : 'Bật Webcam / Camera'}>
              <WebcamBtn
                size="small"
                $active={videoConnected}
                onClick={handleToggleWebcam}
                aria-label="toggle webcam"
              >
                <CameraAltIcon sx={{ fontSize: 17 }} />
              </WebcamBtn>
            </Tooltip>

            {/* Nút Thông Báo */}
            <Tooltip title={`Thông báo & yêu cầu (${unreadCount} chưa đọc)`}>
              <NotificationBtn
                size="small"
                onClick={() => setShowNotificationDialog(true)}
                aria-label="notifications"
              >
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsIcon
                    sx={{ fontSize: 17, color: unreadCount > 0 ? '#38bdf8' : '#e2e8f0' }}
                  />
                </Badge>
              </NotificationBtn>
            </Tooltip>
          </TopRightActions>
        </TopRow>

        <Divider />

        {/* Hàng dưới: Thông tin User + Dropdown Select Status */}
        <BottomRow>
          <UserSection>
            <UserAvatar>
              <PersonIcon sx={{ fontSize: 18 }} />
            </UserAvatar>
            <TextBlock>
              <span className="label">Người dùng</span>
              <span className="value" title={displayPlayerName}>
                {displayPlayerName}
              </span>
            </TextBlock>
          </UserSection>

          {/* Bảng chọn Status (Dropdown select gồm: Màu + status) */}
          <StatusSelectContainer ref={statusMenuRef}>
            <Tooltip title="Chọn trạng thái hoạt động">
              <StatusTrigger
                $isOpen={statusMenuOpen}
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              >
                <StatusDot style={{ backgroundColor: currentStatus?.color || '#107c41' }} />
                <StatusLabel>{currentStatus?.name || 'Sẵn sàng'}</StatusLabel>
                <ExpandMoreIcon
                  sx={{
                    fontSize: 16,
                    color: '#94a3b8',
                    transform: statusMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </StatusTrigger>
            </Tooltip>

            {statusMenuOpen && (
              <StatusDropdown>
                <DropdownHeader>Trạng thái</DropdownHeader>
                {statuses.map((s) => {
                  const isSelected = s.id === currentStatus?.id
                  return (
                    <StatusOption
                      key={s.id}
                      $selected={isSelected}
                      $color={s.color}
                      onClick={() => {
                        dispatch(setCurrentStatus(s.id))
                        setStatusMenuOpen(false)
                      }}
                    >
                      <StatusDot style={{ backgroundColor: s.color }} />
                      <span className="status-name">{s.name}</span>
                      {isSelected && <CheckIcon sx={{ fontSize: 16, color: '#38bdf8' }} />}
                    </StatusOption>
                  )
                })}
              </StatusDropdown>
            )}
          </StatusSelectContainer>
        </BottomRow>
      </Container>

      {/* DIALOG CHIA SẺ WORKSPACE */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        PaperProps={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '340px',
            maxWidth: '460px',
            padding: '4px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <ShareIcon sx={{ color: '#38bdf8', fontSize: 20 }} /> Chia Sẻ Workspace
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2.5 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 4 }}>
              Tên Workspace:
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
              {displayRoomName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
              Mã Workspace ID (Gửi mã này cho đồng nghiệp để vào phòng):
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <TextField
                fullWidth
                size="small"
                value={roomId || ''}
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#38bdf8',
                    fontSize: '13px',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleCopyWorkspaceId}
                startIcon={copiedNotification ? <CheckIcon /> : <ContentCopyIcon />}
                sx={{
                  background: copiedNotification ? '#16a34a' : '#0284c7',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: copiedNotification ? '#15803d' : '#0369a1',
                  },
                }}
              >
                {copiedNotification ? 'Đã Copy!' : 'Copy ID'}
              </Button>
            </div>
          </div>

          {/* Chế độ chia sẻ (Share Mode) */}
          {isOwner ? (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                Chế độ tham gia (Share Mode):
              </div>
              <FormControl component="fieldset">
                <RadioGroup
                  value={shareMode}
                  onChange={(e) => setShareMode(e.target.value as 'free' | 'ask')}
                >
                  <FormControlLabel
                    value="free"
                    control={<Radio size="small" sx={{ color: '#38bdf8', '&.Mui-checked': { color: '#38bdf8' } }} />}
                    label={
                      <div>
                        <b style={{ color: '#f8fafc', fontSize: '13px' }}>Free</b>{' '}
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          — Tự do gia nhập nếu có mã ID
                        </span>
                      </div>
                    }
                  />
                  <FormControlLabel
                    value="ask"
                    control={<Radio size="small" sx={{ color: '#f59e0b', '&.Mui-checked': { color: '#f59e0b' } }} />}
                    label={
                      <div>
                        <b style={{ color: '#f8fafc', fontSize: '13px' }}>Ask To Join</b>{' '}
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          — Cần chủ phòng duyệt mới được vào
                        </span>
                      </div>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                Chế độ tham gia hiện tại:
              </div>
              <Chip
                label={shareMode === 'ask' ? 'Ask To Join (Cần duyệt)' : 'Free (Tự do tham gia)'}
                size="small"
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor:
                    shareMode === 'ask' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  color: shareMode === 'ask' ? '#fbbf24' : '#4ade80',
                  border: `1px solid ${
                    shareMode === 'ask' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'
                  }`,
                }}
              />
              <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginTop: 6 }}>
                * Bạn chỉ có thể copy mã Workspace ID để chia sẻ. Chỉ chủ workspace mới có quyền cập nhật chế độ chia sẻ.
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShareDialogOpen(false)}
            sx={{ color: '#94a3b8', textTransform: 'none' }}
          >
            Đóng
          </Button>
          {isOwner && (
            <Button
              variant="contained"
              onClick={handleUpdateShareMode}
              disabled={savingShareMode}
              sx={{
                background: '#0284c7',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { background: '#0369a1' },
              }}
            >
              {savingShareMode ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog Thông báo & Yêu cầu */}
      <NotificationDialog
        open={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  )
}
