import React, { useState } from 'react'
import logo from '../images/logo.png'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import CorporateFareIcon from '@mui/icons-material/CorporateFare'
import FaceIcon from '@mui/icons-material/Face'
import EditIcon from '@mui/icons-material/Edit'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'

import { CustomRoomTable } from './CustomRoomTable'
import { CreateRoomForm } from './CreateRoomForm'
import ManageCharacterDialog from './ManageCharacterDialog'
import NotificationDialog from './NotificationDialog'
import { useAppSelector } from '../hooks'

const Backdrop = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  pointer-events: auto;
  max-height: 96vh;
`

const Wrapper = styled.div`
  background: #1b1e2e;
  border-radius: 20px;
  padding: 24px 32px;
  box-shadow: 0px 16px 36px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 560px;
  max-width: 860px;
  width: 90vw;
  max-height: 88vh;
  overflow-y: auto;
  overflow-x: hidden;
  color: #f1f5f9;
  pointer-events: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
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
`

const CustomRoomWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  justify-content: center;
  width: 100%;

  .tip {
    font-size: 18px;
    color: #38bdf8;
  }
`

const TitleWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .back-button {
    color: #94a3b8;
    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    color: #f8fafc;
    margin: 0;
  }
`

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: #f8fafc;
  text-align: center;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  margin: 0 0 18px 0;
`

const ProfileBanner = styled.div`
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 12px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .avatar-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #fff;
    }

    .details {
      .name {
        font-weight: 700;
        font-size: 15px;
        color: #f8fafc;
      }
      .model {
        font-size: 12px;
        color: #94a3b8;
      }
    }
  }
`

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`

const ActionCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease-in-out;

  &:hover {
    background: rgba(56, 189, 248, 0.08);
    border-color: #38bdf8;
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(56, 189, 248, 0.2);
  }

  .icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    font-size: 28px;
  }

  h3 {
    margin: 0 0 6px 0;
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
    color: #94a3b8;
  }
`

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    color: #38bdf8;
  }
`

const ProgressBar = styled(LinearProgress)`
  width: 360px;
`

export default function RoomSelectionDialog() {
  const [showCustomRoom, setShowCustomRoom] = useState(false)
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false)
  const [showCharacterDialog, setShowCharacterDialog] = useState(false)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showSnackbar, setShowSnackbar] = useState(false)

  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const currentUser = useAppSelector((state) => state.user)

  // Cập nhật số lượng thông báo / yêu cầu chưa duyệt theo thời gian thực (1.5s)
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

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => {
          setShowSnackbar(false)
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          style={{ background: '#ef4444', color: '#ffffff' }}
        >
          Đang kết nối đến máy chủ Colyseus, vui lòng thử lại sau giây lát!
        </Alert>
      </Snackbar>

      <Backdrop>
        <Wrapper>
          {showCharacterDialog ? (
            <ManageCharacterDialog onBack={() => setShowCharacterDialog(false)} />
          ) : showCreateRoomForm ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <IconButton className="back-button" onClick={() => setShowCreateRoomForm(false)}>
                  <ArrowBackIcon />
                </IconButton>
                <h1>Tạo Workspace Mới (New Workspace)</h1>
                <div style={{ width: 40 }} />
              </TitleWrapper>
              <CreateRoomForm />
            </CustomRoomWrapper>
          ) : showCustomRoom ? (
            <CustomRoomWrapper>
              <TitleWrapper>
                <IconButton className="back-button" onClick={() => setShowCustomRoom(false)}>
                  <ArrowBackIcon />
                </IconButton>
                <h1>
                  Quản Lý Workspace (Manage Workspace)
                  <Tooltip
                    title="Danh sách phòng được đồng bộ thời gian thực từ máy chủ!"
                    placement="top"
                  >
                    <IconButton>
                      <HelpOutlineIcon className="tip" />
                    </IconButton>
                  </Tooltip>
                </h1>
                <Tooltip title="Xem Thông Báo & Yêu Cầu">
                  <IconButton onClick={() => setShowNotificationDialog(true)} sx={{ color: '#38bdf8' }}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </TitleWrapper>
              <CustomRoomTable />
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <Button
                  variant="contained"
                  style={{ background: '#0284c7', color: '#ffffff', textTransform: 'none' }}
                  onClick={() => setShowCreateRoomForm(true)}
                >
                  Tạo Workspace Mới
                </Button>
              </div>
            </CustomRoomWrapper>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <img src={logo} alt="SkyOffice logo" style={{ height: 54, borderRadius: 8 }} />
              </div>
              <Title>Gather Town Workspace Hub</Title>
              <Subtitle>Chọn chế độ để bắt đầu làm việc trong không gian văn phòng ảo</Subtitle>

              {/* PROFILE BANNER: Hiển thị nhân vật đã được thiết lập */}
              <ProfileBanner>
                <div className="user-info">
                  <div className="avatar-icon">
                    <FaceIcon fontSize="inherit" />
                  </div>
                  <div className="details">
                    <div className="name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          backgroundColor: currentUser.currentStatus?.color || '#107c41',
                          display: 'inline-block',
                          border: '1.5px solid #ffffff',
                          flexShrink: 0,
                          boxShadow: `0 0 5px ${currentUser.currentStatus?.color || '#107c41'}`,
                        }}
                      />
                      {currentUser.playerName || 'Guest'}
                    </div>
                    <div className="model">
                      Nhân vật: <strong>{currentUser.avatar?.toUpperCase() || 'ADAM'}</strong> ({currentUser.outfitType || 'casual'})
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tooltip title="Xem Thông Báo & Yêu Cầu">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <Badge badgeContent={unreadCount} color="error">
                          <NotificationsIcon style={{ fontSize: 18 }} />
                        </Badge>
                      }
                      onClick={() => setShowNotificationDialog(true)}
                      sx={{
                        color: unreadCount > 0 ? '#38bdf8' : '#cbd5e1',
                        borderColor: unreadCount > 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)',
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: unreadCount > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        '&:hover': {
                          background: 'rgba(56, 189, 248, 0.25)',
                          borderColor: '#38bdf8',
                        },
                      }}
                    >
                      Thông Báo {unreadCount > 0 && `(${unreadCount})`}
                    </Button>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setShowCharacterDialog(true)}
                    sx={{
                      color: '#38bdf8',
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      textTransform: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Chỉnh Sửa Ngoại Hình
                  </Button>
                </div>
              </ProfileBanner>

              {/* 2 LỰA CHỌN CHÍNH Ở TRANG CHỦ */}
              <CardGrid>
                <ActionCard
                  onClick={() => setShowCreateRoomForm(true)}
                >
                  <div className="icon-wrapper">
                    <AddBusinessIcon fontSize="inherit" />
                  </div>
                  <h3>New Workspace</h3>
                  <p>
                    Khởi tạo văn phòng mới với diện tích tùy chỉnh (Nhỏ 20x20, Vừa 50x50, Lớn 70x70, Siêu lớn 100x100).
                  </p>
                </ActionCard>

                <ActionCard
                  onClick={() => setShowCustomRoom(true)}
                >
                  <div className="icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                    <CorporateFareIcon fontSize="inherit" />
                  </div>
                  <h3>Manage Workspace</h3>
                  <p>
                    Quản lý và tham gia danh sách các Workspace riêng đang hoạt động.
                  </p>
                </ActionCard>
              </CardGrid>
            </>
          )}
        </Wrapper>

        {!lobbyJoined && (
          <ProgressBarWrapper>
            <h3>Đang kết nối tới máy chủ...</h3>
            <ProgressBar color="secondary" />
          </ProgressBarWrapper>
        )}
      </Backdrop>

      <NotificationDialog
        open={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  )
}
