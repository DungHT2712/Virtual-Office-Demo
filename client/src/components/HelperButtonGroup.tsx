import React, { useState } from 'react'
import styled from 'styled-components'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import ShareIcon from '@mui/icons-material/Share'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import CloseIcon from '@mui/icons-material/Close'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import NearMeIcon from '@mui/icons-material/NearMe'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import HomeIcon from '@mui/icons-material/Home'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'

import { BackgroundMode } from '../../../types/BackgroundMode'
import { MovementMode, setMovementMode, toggleBackgroundMode, setLoggedIn } from '../stores/UserStore'
import { setRoomJoined } from '../stores/RoomStore'
import { openDesignMode, closeDesignMode } from '../stores/WorkspaceStore'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import Game from '../scenes/Game'
import StatusDialog from './StatusDialog'
import NotificationDialog from './NotificationDialog'

const Backdrop = styled.div`
  position: fixed;
  display: flex;
  gap: 10px;
  bottom: 16px;
  right: 16px;
  align-items: flex-end;
  pointer-events: none !important;

  .wrapper-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: auto;
  }

  & > * {
    pointer-events: auto;
  }
`

const Wrapper = styled.div`
  position: relative;
  font-size: 16px;
  color: #eee;
  background: #222639;
  box-shadow: 0px 0px 5px #0000006f;
  border-radius: 16px;
  padding: 15px 35px 15px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .close {
    position: absolute;
    top: 15px;
    right: 15px;
  }

  .tip {
    margin-left: 12px;
    font-size: 13px;
    color: #c2c2c2;
    display: flex;
    align-items: center;
    svg {
      margin-right: 4px;
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`

const Title = styled.h3`
  font-size: 24px;
  color: #eee;
  text-align: center;
`

const RoomName = styled.div`
  max-width: 400px;
  max-height: 100px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;

  h3 {
    font-size: 24px;
    color: #eee;
  }
`

const RoomDescription = styled.div`
  max-width: 400px;
  max-height: 150px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 16px;
  color: #c2c2c2;
  display: flex;
  justify-content: center;
`

const StyledFab = styled(Fab)`
  &:hover {
    color: #1ea2df;
  }
`

export default function HelperButtonGroup() {
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const backgroundMode = useAppSelector((state) => state.user.backgroundMode)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const movementMode = useAppSelector((state) => state.user.movementMode)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const currentUser = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()

  // Cập nhật số lượng thông báo / yêu cầu theo thời gian thực (1.5s)
  React.useEffect(() => {
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

  const handleLeaveWorkspace = () => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    if (bootstrap) {
      bootstrap.leaveGame()
    }
    dispatch(closeDesignMode())
    dispatch(setLoggedIn(false))
    dispatch(setRoomJoined(false))
    setShowLeaveConfirm(false)
  }

  return (
    <Backdrop>
      <div className="wrapper-group">
        {showStatusDialog && <StatusDialog onClose={() => setShowStatusDialog(false)} />}
        {showRoomInfo && (
          <Wrapper>
            <IconButton className="close" onClick={() => setShowRoomInfo(false)} size="small">
              <CloseIcon />
            </IconButton>
            <RoomName>
              <Avatar style={{ background: getColorByString(roomName) }}>
                {getAvatarString(roomName)}
              </Avatar>
              <h3>{roomName}</h3>
            </RoomName>
            <RoomDescription>
              <ArrowRightIcon /> {roomDescription}
            </RoomDescription>
            <p className="tip">
              <LightbulbIcon />
              Chia sẻ link này để mời đồng nghiệp vào cùng Workspace!
            </p>
          </Wrapper>
        )}
      </div>

      <ButtonGroup>
        {roomJoined && (
          <>
            {/* NÚT CHUYỂN ĐỔI MOVEMENT MODE NHANH */}
            <Tooltip
              title={`Chế độ di chuyển: ${
                movementMode === 'mouse'
                  ? 'Click Chuột'
                  : movementMode === 'wasd'
                  ? 'Phím WASD'
                  : 'Joystick'
              } (Bấm để đổi)`}
            >
              <StyledFab
                size="small"
                onClick={() => {
                  const modes: MovementMode[] = ['mouse', 'wasd', 'joystick']
                  const nextMode = modes[(modes.indexOf(movementMode) + 1) % modes.length]
                  dispatch(setMovementMode(nextMode))
                }}
                sx={{
                  background:
                    movementMode === 'mouse'
                      ? '#0891b2'
                      : movementMode === 'wasd'
                      ? '#2563eb'
                      : '#9333ea',
                  color: '#ffffff',
                  '&:hover': {
                    background:
                      movementMode === 'mouse'
                        ? '#0e7490'
                        : movementMode === 'wasd'
                        ? '#1d4ed8'
                        : '#7e22ce',
                  },
                }}
              >
                {movementMode === 'mouse' && <NearMeIcon />}
                {movementMode === 'wasd' && <KeyboardIcon />}
                {movementMode === 'joystick' && <VideogameAssetIcon />}
              </StyledFab>
            </Tooltip>

            {/* NÚT QUAY VỀ TRANG CHỦ / RỜI WORKSPACE */}
            <Tooltip title="Rời Workspace (Quay Về Trang Chủ)">
              <StyledFab
                size="small"
                onClick={() => setShowLeaveConfirm(true)}
                sx={{
                  background: '#f97316',
                  color: '#ffffff',
                  '&:hover': { background: '#ea580c' },
                }}
              >
                <HomeIcon />
              </StyledFab>
            </Tooltip>

            {/* NÚT THIẾT KẾ WORKSPACE (NỘI THẤT & PHÒNG) */}
            <Tooltip
              title={
                designMode
                  ? 'Đang Thiết Kế (Bấm để Hoàn Tất & Thoát Design)'
                  : 'Chế Độ Thiết Kế (Bảng Nội Thất & Phòng)'
              }
            >
              <StyledFab
                size="small"
                onClick={() => {
                  if (designMode) {
                    dispatch(closeDesignMode())
                  } else {
                    dispatch(openDesignMode())
                  }
                }}
                sx={{
                  background: designMode ? '#10b981' : '#0284c7',
                  color: '#ffffff',
                  boxShadow: designMode
                    ? '0 0 15px rgba(16, 185, 129, 0.8), 0 0 5px #10b981'
                    : undefined,
                  border: designMode ? '2px solid #ffffff' : undefined,
                  '&:hover': { background: designMode ? '#059669' : '#0369a1' },
                }}
              >
                <SquareFootIcon />
              </StyledFab>
            </Tooltip>

            {/* Nút Kết nối Webcam / Camera với icon Máy ảnh */}
            <Tooltip
              title={
                videoConnected
                  ? 'Tắt Webcam / Camera'
                  : 'Bật Webcam / Camera'
              }
            >
              <StyledFab
                size="small"
                onClick={handleToggleWebcam}
                sx={{
                  background: videoConnected ? '#10b981' : '#334155',
                  color: '#ffffff',
                  boxShadow: videoConnected ? '0 0 12px rgba(16, 185, 129, 0.8)' : undefined,
                  border: videoConnected ? '1.5px solid #6ee7b7' : undefined,
                  '&:hover': {
                    background: videoConnected ? '#059669' : '#475569',
                  },
                }}
              >
                <CameraAltIcon />
              </StyledFab>
            </Tooltip>

            {/* NÚT THÔNG BÁO VÀ YÊU CẦU GIA NHẬP */}
            <Tooltip title="Thông Báo & Yêu Cầu">
              <StyledFab
                size="small"
                onClick={() => setShowNotificationDialog(true)}
                sx={{
                  background: '#1e293b',
                  color: unreadCount > 0 ? '#38bdf8' : '#ffffff',
                  border: unreadCount > 0 ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                  '&:hover': { background: '#334155' },
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon style={{ fontSize: 20 }} />
                </Badge>
              </StyledFab>
            </Tooltip>

            <Tooltip title="Room Info">
              <StyledFab
                size="small"
                onClick={() => {
                  setShowRoomInfo(!showRoomInfo)
                  setShowStatusDialog(false)
                }}
              >
                <ShareIcon />
              </StyledFab>
            </Tooltip>
          </>
        )}

        {/* NÚT CHUYỂN ĐỔI TRẠNG THÁI HOẠT ĐỘNG (MICROSOFT TEAMS) */}
        <Tooltip title={`Trạng thái: ${currentStatus?.name || 'Sẵn sàng'} (Bấm để thay đổi)`}>
          <StyledFab
            size="small"
            onClick={() => {
              setShowStatusDialog(!showStatusDialog)
              setShowRoomInfo(false)
            }}
            sx={{
              background: '#1e293b',
              border: `2px solid ${currentStatus?.color || '#107c41'}`,
              boxShadow: `0 0 10px ${currentStatus?.color || '#107c41'}88`,
              '&:hover': {
                background: '#334155',
              },
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: currentStatus?.color || '#107c41',
                border: '1.5px solid #ffffff',
                display: 'inline-block',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
              }}
            />
          </StyledFab>
        </Tooltip>

        <Tooltip title="Switch Background Theme">
          <StyledFab size="small" onClick={() => dispatch(toggleBackgroundMode())}>
            {backgroundMode === BackgroundMode.DAY ? <DarkModeIcon /> : <LightModeIcon />}
          </StyledFab>
        </Tooltip>
      </ButtonGroup>

      {/* DIALOG XÁC NHẬN RỜI WORKSPACE VỀ TRANG CHỦ */}
      <Dialog
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        style={{ zIndex: 99999999 }}
        sx={{ zIndex: 99999999 }}
        PaperProps={{
          style: {
            background: '#1e2235',
            color: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#f8fafc' }}>
          Quay Về Trang Chủ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#94a3b8', fontSize: '14px' }}>
            Bạn có chắc chắn muốn rời khỏi Workspace hiện tại để quay về trang chủ chọn hoặc tạo Workspace khác không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowLeaveConfirm(false)}
            sx={{ color: '#94a3b8', textTransform: 'none' }}
          >
            Ở lại
          </Button>
          <Button
            variant="contained"
            onClick={handleLeaveWorkspace}
            startIcon={<ExitToAppIcon />}
            sx={{
              background: '#f97316',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#ea580c' },
            }}
          >
            Rời Workspace
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationDialog
        open={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </Backdrop>
  )
}
