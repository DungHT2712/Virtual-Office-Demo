import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Badge from '@mui/material/Badge'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Tooltip from '@mui/material/Tooltip'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import RefreshIcon from '@mui/icons-material/Refresh'

import { useAppSelector } from '../hooks'

export interface NotificationItem {
  id: string
  targetUserId: string
  type: 'join_request' | 'join_accepted' | 'join_denied' | 'system'
  workspaceId: string
  workspaceName: string
  requesterId?: string
  requesterName?: string
  message?: string
  status?: 'pending' | 'accepted' | 'denied' | 'read' | 'unread'
  createdAt: number
}

export const isNotificationUnread = (item: NotificationItem) => {
  if (item.type === 'join_request') {
    return item.status === 'pending'
  }
  return item.status === 'unread' || !item.status
}

const RedDot = styled.span`
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444, 0 0 2px #f87171;
  flex-shrink: 0;
  animation: pulse-dot 1.8s infinite ease-in-out;

  @keyframes pulse-dot {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 4px #ef4444;
    }
    50% {
      transform: scale(1.3);
      box-shadow: 0 0 10px #ef4444, 0 0 4px #f87171;
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 4px #ef4444;
    }
  }
`

const StyledDialog = styled(Dialog)`
  z-index: 100000 !important;

  .MuiBackdrop-root {
    background: transparent !important;
    z-index: -1 !important;
  }

  .MuiDialog-container {
    pointer-events: auto !important;
    position: relative;
    z-index: 1 !important;
  }

  .MuiDialog-paper {
    background: #1b1e2e;
    color: #f1f5f9;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 18px;
    min-width: 480px;
    max-width: 600px;
    max-height: 85vh;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
    pointer-events: auto !important;
    position: relative;
    z-index: 10 !important;
  }
`

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }
  }
`

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 440px;
  overflow-y: auto;
  padding: 16px 4px;
`

const NotificationCard = styled.div<{ $type?: string; $unread?: boolean }>`
  background: ${(props) =>
    props.$unread ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid
    ${(props) =>
      props.$unread
        ? 'rgba(56, 189, 248, 0.45)'
        : props.$type === 'join_denied'
        ? 'rgba(239, 68, 68, 0.35)'
        : props.$type === 'join_accepted'
        ? 'rgba(34, 197, 94, 0.35)'
        : 'rgba(255, 255, 255, 0.1)'};
  border-left: ${(props) => (props.$unread ? '4px solid #ef4444' : undefined)};
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s;
  cursor: ${(props) => (props.$unread && props.$type !== 'join_request' ? 'pointer' : 'default')};

  &:hover {
    background: ${(props) =>
      props.$unread ? 'rgba(56, 189, 248, 0.13)' : 'rgba(255, 255, 255, 0.07)'};
  }

  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .icon-title {
      display: flex;
      align-items: center;
      gap: 10px;

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: ${(props) =>
          props.$type === 'join_denied'
            ? 'rgba(239, 68, 68, 0.15)'
            : props.$type === 'join_accepted'
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(56, 189, 248, 0.15)'};
        color: ${(props) =>
          props.$type === 'join_denied'
            ? '#f87171'
            : props.$type === 'join_accepted'
            ? '#4ade80'
            : '#38bdf8'};
      }

      .content-text {
        display: flex;
        flex-direction: column;

        .main-msg {
          font-weight: 600;
          font-size: 14px;
          color: #f1f5f9;
        }

        .sub-time {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 4px;
  }
`

const EmptyNotice = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 14px;

  svg {
    font-size: 44px;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 8px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`

interface NotificationDialogProps {
  open: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export default function NotificationDialog({
  open,
  onClose,
  onUnreadCountChange,
}: NotificationDialogProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [activeTab, setActiveTab] = useState(0) // 0: Tất cả, 1: Yêu cầu gia nhập, 2: Tin thông báo
  const [loading, setLoading] = useState(false)
  const currentUser = useAppSelector((state) => state.user)

  const fetchNotifications = useCallback(async () => {
    if (!currentUser.userId) return
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(currentUser.userId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
          const unreadOrPending = data.notifications.filter(isNotificationUnread).length
          if (onUnreadCountChange) onUnreadCountChange(unreadOrPending)
          window.dispatchEvent(
            new CustomEvent('skyoffice_unread_count_updated', { detail: { count: unreadOrPending } })
          )

          // 1. Tự động thêm workspace đã được duyệt vào shared list của requester
          data.notifications.forEach((n: NotificationItem) => {
            if (n.type === 'join_accepted' && n.workspaceId) {
              try {
                const storedShared = JSON.parse(
                  localStorage.getItem('skyoffice_shared_workspace_ids') || '[]'
                )
                if (!storedShared.includes(n.workspaceId)) {
                  storedShared.push(n.workspaceId)
                  localStorage.setItem('skyoffice_shared_workspace_ids', JSON.stringify(storedShared))
                  window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
                }
              } catch (e) {
                console.error(e)
              }
            }
          })

          // 2. Tự động xóa workspace bị từ chối khỏi shared list của requester
          data.notifications.forEach((n: NotificationItem) => {
            if (n.type === 'join_denied' && n.workspaceId) {
              try {
                const storedShared = JSON.parse(
                  localStorage.getItem('skyoffice_shared_workspace_ids') || '[]'
                )
                if (storedShared.includes(n.workspaceId)) {
                  const updated = storedShared.filter((id: string) => id !== n.workspaceId)
                  localStorage.setItem('skyoffice_shared_workspace_ids', JSON.stringify(updated))
                  window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))
                }
              } catch (e) {
                console.error(e)
              }
            }
          })
        }
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e)
    }
  }, [currentUser.userId, onUnreadCountChange])

  // Định kỳ tải thông báo theo thời gian thực (chỉ poll khi mở cửa sổ)
  useEffect(() => {
    if (!open) return
    fetchNotifications()
    const timer = setInterval(fetchNotifications, 2500)
    return () => clearInterval(timer)
  }, [open, fetchNotifications])

  // Xử lý đánh dấu 1 thông báo là đã đọc (thao tác -> mất dấu chấm đỏ và note - 1)
  const handleMarkSingleAsRead = async (id: string) => {
    try {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, status: 'read' as const } : n))
        const newCount = next.filter(isNotificationUnread).length
        if (onUnreadCountChange) onUnreadCountChange(newCount)
        window.dispatchEvent(
          new CustomEvent('skyoffice_unread_count_updated', { detail: { count: newCount } })
        )
        return next
      })
      await fetch(`/api/notifications/${id}/mark-read`, { method: 'POST' })
    } catch (e) {
      console.error('Failed to mark notification as read:', e)
    }
  }

  // Xử lý đánh dấu tất cả thông báo dạng tin nhắn là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => {
        const next = prev.map((n) =>
          n.type !== 'join_request' && (n.status === 'unread' || !n.status)
            ? { ...n, status: 'read' as const }
            : n
        )
        const newCount = next.filter(isNotificationUnread).length
        if (onUnreadCountChange) onUnreadCountChange(newCount)
        window.dispatchEvent(
          new CustomEvent('skyoffice_unread_count_updated', { detail: { count: newCount } })
        )
        return next
      })
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId }),
      })
    } catch (e) {
      console.error('Failed to mark all as read:', e)
    }
  }

  // Xử lý Accept hoặc Deny yêu cầu gia nhập (thao tác -> mất dấu chấm đỏ và note - 1)
  const handleRespond = async (
    workspaceId: string,
    requesterId: string,
    action: 'accept' | 'deny',
    notificationId: string
  ) => {
    try {
      setLoading(true)
      // Cập nhật giao diện tức thì
      setNotifications((prev) => {
        const next = prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: (action === 'accept' ? 'accepted' : 'denied') as any }
            : n
        )
        const newCount = next.filter(isNotificationUnread).length
        if (onUnreadCountChange) onUnreadCountChange(newCount)
        window.dispatchEvent(
          new CustomEvent('skyoffice_unread_count_updated', { detail: { count: newCount } })
        )
        return next
      })

      const res = await fetch(`/api/workspaces/${workspaceId}/respond-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUser.userId,
          requesterId,
          action,
          notificationId,
        }),
      })

      window.dispatchEvent(new CustomEvent('skyoffice_shared_workspaces_updated'))

      if (res.ok) {
        await fetchNotifications()
      }
    } catch (e) {
      console.error('Failed to respond to request:', e)
    } finally {
      setLoading(false)
    }
  }

  // Xóa 1 thông báo
  const handleDeleteNotification = async (id: string) => {
    try {
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id)
        const newCount = next.filter(isNotificationUnread).length
        if (onUnreadCountChange) onUnreadCountChange(newCount)
        window.dispatchEvent(
          new CustomEvent('skyoffice_unread_count_updated', { detail: { count: newCount } })
        )
        return next
      })
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    } catch (e) {
      console.error(e)
    }
  }

  // Xóa toàn bộ thông báo
  const handleClearAll = async () => {
    try {
      setNotifications([])
      if (onUnreadCountChange) onUnreadCountChange(0)
      window.dispatchEvent(
        new CustomEvent('skyoffice_unread_count_updated', { detail: { count: 0 } })
      )
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.userId }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const joinRequests = notifications.filter((n) => n.type === 'join_request')
  const generalNotifs = notifications.filter((n) => n.type !== 'join_request')

  const unreadTotal = notifications.filter(isNotificationUnread).length
  const unreadRequests = joinRequests.filter(isNotificationUnread).length
  const unreadGeneral = generalNotifs.filter(isNotificationUnread).length

  let displayed = notifications
  if (activeTab === 1) displayed = joinRequests
  if (activeTab === 2) displayed = generalNotifs

  return (
    <StyledDialog
      open={open}
      onClose={(_event, reason) => {
        // Chỉ đóng khi bấm nút X, bấm ra ngoài không đóng
        if (reason === 'backdropClick') return
      }}
      BackdropProps={{
        style: {
          backgroundColor: 'transparent',
        },
      }}
    >
      <HeaderWrapper>
        <div className="title-group">
          <Badge badgeContent={unreadTotal} color="error">
            <NotificationsIcon style={{ color: '#38bdf8', fontSize: 24 }} />
          </Badge>
          <h2>Thông Báo & Yêu Cầu</h2>
          <Tooltip title="Làm mới">
            <IconButton size="small" onClick={fetchNotifications} sx={{ color: '#94a3b8' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon />
        </IconButton>
      </HeaderWrapper>

      <div style={{ padding: '0 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              color: '#94a3b8',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              minHeight: '44px',
              '&.Mui-selected': { color: '#38bdf8' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#38bdf8' },
          }}
        >
          <Tab
            label={
              <span>
                Tất cả ({notifications.length})
                {unreadTotal > 0 && (
                  <span style={{ color: '#f87171', marginLeft: 4, fontWeight: 700 }}>
                    ({unreadTotal} mới)
                  </span>
                )}
              </span>
            }
          />
          <Tab
            label={
              <span>
                Yêu cầu ({joinRequests.length})
                {unreadRequests > 0 && (
                  <span style={{ color: '#f87171', marginLeft: 4, fontWeight: 700 }}>
                    ({unreadRequests})
                  </span>
                )}
              </span>
            }
          />
          <Tab
            label={
              <span>
                Thông báo ({generalNotifs.length})
                {unreadGeneral > 0 && (
                  <span style={{ color: '#f87171', marginLeft: 4, fontWeight: 700 }}>
                    ({unreadGeneral})
                  </span>
                )}
              </span>
            }
          />
        </Tabs>
      </div>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {displayed.length === 0 ? (
          <EmptyNotice>
            <InfoIcon />
            <p>Hiện không có thông báo nào trong mục này.</p>
          </EmptyNotice>
        ) : (
          <NotificationList>
            {displayed.map((item) => {
              const isJoinReq = item.type === 'join_request'
              const isUnread = isNotificationUnread(item)
              const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })

              return (
                <NotificationCard
                  key={item.id}
                  $type={item.type}
                  $unread={isUnread}
                  onClick={() => {
                    // Thao tác bấm vào thẻ thông báo chưa đọc -> đánh dấu đã đọc (-1 note, tắt chấm đỏ)
                    if (!isJoinReq && isUnread) {
                      handleMarkSingleAsRead(item.id)
                    }
                  }}
                  title={!isJoinReq && isUnread ? 'Bấm vào để đánh dấu đã đọc' : undefined}
                >
                  <div className="top-row">
                    <div className="icon-title">
                      {/* Dấu chấm đỏ ở đầu thông báo hoặc yêu cầu chưa đọc/chưa duyệt */}
                      {isUnread && (
                        <Tooltip title="Chưa đọc / Chưa xử lý">
                          <RedDot />
                        </Tooltip>
                      )}

                      <div className="icon">
                        {isJoinReq ? (
                          <GroupAddIcon fontSize="small" />
                        ) : item.type === 'join_accepted' ? (
                          <CheckCircleIcon fontSize="small" />
                        ) : item.type === 'join_denied' ? (
                          <CancelIcon fontSize="small" />
                        ) : (
                          <InfoIcon fontSize="small" />
                        )}
                      </div>
                      <div className="content-text">
                        <div className="main-msg">
                          {isJoinReq ? (
                            <span>
                              Người dùng <b style={{ color: '#38bdf8' }}>{item.requesterName}</b>{' '}
                              (ID: <code>{item.requesterId}</code>) yêu cầu tham gia workspace{' '}
                              <b style={{ color: '#f8fafc' }}>{item.workspaceName || item.workspaceId}</b>
                            </span>
                          ) : (
                            <span>{item.message}</span>
                          )}
                        </div>
                        <div className="sub-time">{formattedTime}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Nút thao tác nhanh Đã Xem cho thông báo chưa đọc */}
                      {!isJoinReq && isUnread && (
                        <Tooltip title="Đánh dấu đã xem">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckIcon style={{ fontSize: 13 }} />}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkSingleAsRead(item.id)
                            }}
                            sx={{
                              color: '#38bdf8',
                              borderColor: 'rgba(56, 189, 248, 0.4)',
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'none',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              '&:hover': {
                                background: 'rgba(56, 189, 248, 0.25)',
                                borderColor: '#38bdf8',
                              },
                            }}
                          >
                            Đã xem
                          </Button>
                        </Tooltip>
                      )}

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(item.id)
                        }}
                        sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>

                  {/* Hành động cho yêu cầu gia nhập: Thao tác Accept hoặc Deny sẽ tắt chấm đỏ và -1 note */}
                  {isJoinReq && (
                    <div className="action-buttons">
                      {item.status === 'pending' ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={loading}
                            startIcon={<CheckIcon />}
                            onClick={() =>
                              handleRespond(
                                item.workspaceId,
                                item.requesterId || '',
                                'accept',
                                item.id
                              )
                            }
                            sx={{
                              background: '#16a34a',
                              color: '#fff',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '12px',
                              '&:hover': { background: '#15803d' },
                            }}
                          >
                            Chấp Nhận (Accept)
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={loading}
                            startIcon={<ClearIcon />}
                            onClick={() =>
                              handleRespond(
                                item.workspaceId,
                                item.requesterId || '',
                                'deny',
                                item.id
                              )
                            }
                            sx={{
                              borderColor: '#ef4444',
                              color: '#f87171',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '12px',
                              background: 'rgba(239, 68, 68, 0.08)',
                              '&:hover': { background: 'rgba(239, 68, 68, 0.2)' },
                            }}
                          >
                            Từ Chối (Deny)
                          </Button>
                        </>
                      ) : item.status === 'accepted' ? (
                        <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>
                          ✓ Đã chấp thuận
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>
                          ✕ Đã từ chối
                        </span>
                      )}
                    </div>
                  )}
                </NotificationCard>
              )
            })}
          </NotificationList>
        )}

        {displayed.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {generalNotifs.some(isNotificationUnread) ? (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  color: '#38bdf8',
                  textTransform: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  '&:hover': { color: '#7dd3fc' },
                }}
              >
                Đánh dấu tất cả thông báo đã đọc
              </Button>
            ) : (
              <div />
            )}
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{ color: '#94a3b8', textTransform: 'none', fontSize: '12px' }}
            >
              Xóa tất cả thông báo
            </Button>
          </div>
        )}
      </DialogContent>
    </StyledDialog>
  )
}
