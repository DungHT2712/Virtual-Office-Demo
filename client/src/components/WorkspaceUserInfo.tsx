import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import BusinessIcon from '@mui/icons-material/Business'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckIcon from '@mui/icons-material/Check'

import { useAppSelector, useAppDispatch } from '../hooks'
import { setCurrentStatus } from '../stores/UserStore'
import NotificationDialog from './NotificationDialog'

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
  min-width: 270px;
  max-width: 360px;
  color: #f8fafc;
  user-select: none;
  pointer-events: auto;
  transition: all 0.25s ease;

  @media (max-width: 600px) {
    min-width: 240px;
    max-width: calc(100vw - 32px);
    padding: 8px 12px;
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

  const roomName = useAppSelector((state) => state.room.roomName)
  const roomId = useAppSelector((state) => state.room.roomId)
  const playerName = useAppSelector((state) => state.user.playerName)
  const statuses = useAppSelector((state) => state.user.statuses)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const currentUser = useAppSelector((state) => state.user)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const dispatch = useAppDispatch()

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

  return (
    <>
      <Container>
        {/* Hàng trên: Thông tin Workspace + Nút Thông báo */}
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
          </WorkspaceSection>

          <Tooltip title={`Thông báo & yêu cầu (${unreadCount} chưa đọc)`}>
            <NotificationBtn
              size="small"
              onClick={() => setShowNotificationDialog(true)}
              aria-label="notifications"
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsIcon sx={{ fontSize: 18, color: unreadCount > 0 ? '#38bdf8' : '#e2e8f0' }} />
              </Badge>
            </NotificationBtn>
          </Tooltip>
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

      {/* Dialog Thông báo & Yêu cầu */}
      <NotificationDialog
        open={showNotificationDialog}
        onClose={() => setShowNotificationDialog(false)}
        onUnreadCountChange={(count) => setUnreadCount(count)}
      />
    </>
  )
}
