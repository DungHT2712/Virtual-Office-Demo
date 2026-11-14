import React, { useState } from 'react'
import styled from 'styled-components'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import NearMeIcon from '@mui/icons-material/NearMe'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import HomeIcon from '@mui/icons-material/Home'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { MovementMode, setMovementMode, setLoggedIn } from '../stores/UserStore'
import { setRoomJoined } from '../stores/RoomStore'
import { openDesignMode, closeDesignMode } from '../stores/WorkspaceStore'
import { useAppSelector, useAppDispatch } from '../hooks'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import StatusDialog from './StatusDialog'

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

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const FunctionButtonsWrapper = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  max-width: ${(props) => (props.$collapsed ? '0px' : '650px')};
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  transform: ${(props) => (props.$collapsed ? 'scale(0.85)' : 'scale(1)')};
  transform-origin: right center;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease,
    transform 0.25s ease;
  pointer-events: ${(props) => (props.$collapsed ? 'none' : 'auto')};
`

const StyledFab = styled(Fab)`
  &:hover {
    color: #1ea2df;
  }
`

export default function HelperButtonGroup() {
  const [collapsed, setCollapsed] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
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
        {showStatusDialog && <StatusDialog onClose={() => setShowStatusDialog(false)} />}
      </div>

      <ButtonGroup>
        <FunctionButtonsWrapper $collapsed={collapsed}>
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

            </>
          )}

          {/* NÚT CHUYỂN ĐỔI TRẠNG THÁI HOẠT ĐỘNG (MICROSOFT TEAMS) */}
          <Tooltip title={`Trạng thái: ${currentStatus?.name || 'Sẵn sàng'} (Bấm để thay đổi)`}>
            <StyledFab
              size="small"
              onClick={() => {
                setShowStatusDialog(!showStatusDialog)
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
        </FunctionButtonsWrapper>

        {/* NÚT THU GỌN / ẨN HIỆN CÁC NÚT CHỨC NĂNG */}
        <Tooltip title={collapsed ? 'Hiện các nút chức năng' : 'Thu gọn các nút chức năng'}>
          <StyledFab
            size="small"
            onClick={() => {
              setCollapsed(!collapsed)
              if (!collapsed) {
                setShowStatusDialog(false)
              }
            }}
            sx={{
              background: collapsed ? '#0284c7' : '#1e293b',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: collapsed ? '0 0 12px rgba(2, 132, 199, 0.5)' : undefined,
              '&:hover': {
                background: collapsed ? '#0369a1' : '#334155',
              },
            }}
          >
            {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
    </Backdrop>
  )
}
