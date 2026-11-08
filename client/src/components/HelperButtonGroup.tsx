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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ShareIcon from '@mui/icons-material/Share'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import CloseIcon from '@mui/icons-material/Close'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import NearMeIcon from '@mui/icons-material/NearMe'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import HomeIcon from '@mui/icons-material/Home'

import { BackgroundMode } from '../../../types/BackgroundMode'
import { MovementMode, setMovementMode, toggleBackgroundMode, setLoggedIn } from '../stores/UserStore'
import { setRoomJoined } from '../stores/RoomStore'
import { openDesignMode, closeDesignMode } from '../stores/WorkspaceStore'
import { useAppSelector, useAppDispatch } from '../hooks'
import { getAvatarString, getColorByString } from '../util'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

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

const ModeSelector = styled.div`
  display: flex;
  gap: 4px;
  background: #111422;
  border-radius: 20px;
  padding: 4px;
  margin-top: 8px;
  margin-bottom: 8px;
`

const ModeButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? '#0284c7' : 'transparent')};
  color: ${(props) => (props.$active ? '#ffffff' : '#94a3b8')};
  border: none;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background: ${(props) => (props.$active ? '#0284c7' : 'rgba(255, 255, 255, 0.1)')};
  }

  svg {
    font-size: 16px;
  }
`

export default function HelperButtonGroup() {
  const [showRoomInfo, setShowRoomInfo] = useState(false)
  const [showControlGuide, setShowControlGuide] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const backgroundMode = useAppSelector((state) => state.user.backgroundMode)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const movementMode = useAppSelector((state) => state.user.movementMode)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const dispatch = useAppDispatch()

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
        {showControlGuide && (
          <Wrapper>
            <IconButton className="close" onClick={() => setShowControlGuide(false)} size="small">
              <CloseIcon />
            </IconButton>
            <Title>Điều Khiển & Thao Tác</Title>

            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
              Chế độ di chuyển:
            </div>
            <ModeSelector>
              <ModeButton
                $active={movementMode === 'wasd'}
                onClick={() => dispatch(setMovementMode('wasd'))}
              >
                <KeyboardIcon /> Phím WASD
              </ModeButton>
              <ModeButton
                $active={movementMode === 'mouse'}
                onClick={() => dispatch(setMovementMode('mouse'))}
              >
                <NearMeIcon /> Click Chuột
              </ModeButton>
              <ModeButton
                $active={movementMode === 'joystick'}
                onClick={() => dispatch(setMovementMode('joystick'))}
              >
                <VideogameAssetIcon /> Joystick
              </ModeButton>
            </ModeSelector>

            <ul>
              <li>
                <strong>W, A, S, D</strong> hoặc <strong>Click Chuột</strong> để di chuyển
              </li>
              <li>
                <strong>E</strong> để ngồi vào ghế (cả chế độ chuột và bàn phím)
              </li>
              <li>
                <strong>R</strong> để mở máy tính / bảng trắng
              </li>
              <li>
                <strong>Enter</strong> để mở khung chat
              </li>
              <li>
                <strong>ESC</strong> để đóng chat
              </li>
            </ul>
            <p className="tip">
              <LightbulbIcon />
              Video & Audio kết nối tự động khi bạn đứng gần người khác
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

            <Tooltip title="Room Info">
              <StyledFab
                size="small"
                onClick={() => {
                  setShowRoomInfo(!showRoomInfo)
                  setShowControlGuide(false)
                }}
              >
                <ShareIcon />
              </StyledFab>
            </Tooltip>

            <Tooltip title="Control Guide">
              <StyledFab
                size="small"
                onClick={() => {
                  setShowControlGuide(!showControlGuide)
                  setShowRoomInfo(false)
                }}
              >
                <HelpOutlineIcon />
              </StyledFab>
            </Tooltip>
          </>
        )}

        <Tooltip title="Visit Our GitHub">
          <StyledFab
            size="small"
            href="https://github.com/kevinshen56714/SkyOffice"
            target="_blank"
          >
            <GitHubIcon />
          </StyledFab>
        </Tooltip>
        <Tooltip title="Follow Us on Twitter">
          <StyledFab size="small" href="https://twitter.com/SkyOfficeApp" target="_blank">
            <TwitterIcon />
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
    </Backdrop>
  )
}
