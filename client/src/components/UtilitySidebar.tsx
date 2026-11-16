import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

import WidgetsIcon from '@mui/icons-material/Widgets'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LockIcon from '@mui/icons-material/Lock'

import { useAppDispatch, useAppSelector } from '../hooks'
import { WorkspaceUser } from '../types/core'
import { openMeetingDialog, setMeetingData } from '../stores/MeetingStore'
import MeetingRoomDialog from './MeetingRoomDialog'

const SidebarCard = styled.div<{ $collapsed: boolean }>`
  position: relative;
  width: 280px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  padding: ${(props) => (props.$collapsed ? '8px 12px' : '10px 12px')};
  color: #f8fafc;
  user-select: none;
  pointer-events: auto;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 600px) {
    width: calc(100vw - 32px);
  }
`

const ToggleOpenPill = styled.div`
  position: relative;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 5px 12px 5px 6px;
  color: #f8fafc;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(56, 189, 248, 0.4);
    transform: translateX(3px);
    box-shadow: 0 6px 20px rgba(56, 189, 248, 0.25);

    .chevron-icon {
      transform: translateX(2px);
      color: #38bdf8;
    }
  }

  .label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #f8fafc;
  }

  .chevron-icon {
    font-size: 16px;
    color: #94a3b8;
    transition: all 0.2s ease;
  }
`

const PillIconCircle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2));
  border: 1px solid rgba(56, 189, 248, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2));
  border: 1px solid rgba(56, 189, 248, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
`

const TitleText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.5px;
  }
`

const HeaderRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 2px;
`

const ModuleItem = styled.div<{ $accentColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.85);
    border-color: ${(props) => props.$accentColor};
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

    .chevron {
      color: ${(props) => props.$accentColor};
      transform: translateX(2px);
    }
  }

  .chevron {
    color: #64748b;
    transition: all 0.2s ease;
  }
`

const ModuleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const ModuleIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: ${(props) => props.$bg};
  border: 1px solid ${(props) => props.$color}40;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};
  flex-shrink: 0;
`

const ModuleTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 1.25;

  .module-title {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .module-sub {
    font-size: 11px;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const FooterNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 0 4px;
  font-size: 10px;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`

interface Props {
  users?: WorkspaceUser[]
}

export default function UtilitySidebar({ users = [] }: Props) {
  const dispatch = useAppDispatch()
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const roomId = useAppSelector((state) => state.room.roomId)
  const meetingRoomsConfig = useAppSelector((state) => state.meeting.meetingRooms)
  const meetingBookings = useAppSelector((state) => state.meeting.meetingBookings)
  const roomsInOffice = useAppSelector((state) => state.workspace.rooms)

  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem('skyoffice_utility_sidebar_visible')
    return stored !== 'false'
  })

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('skyoffice_utility_sidebar_collapsed') === 'true'
  })

  // Đếm số lượng phòng họp trên bản đồ
  const totalMeetingRooms = Object.values(roomsInOffice || {}).filter(
    (r) => r.roomType === 'meeting' || r.name.toLowerCase().includes('họp')
  ).length

  // Đếm số lượng cuộc họp đang diễn ra
  const now = Date.now()
  const activeMeetingsCount = meetingBookings.filter(
    (b) => now >= b.startTimestamp && now <= b.endTimestamp
  ).length

  // Tải dữ liệu ban đầu từ API
  useEffect(() => {
    if (!roomId) return

    const fetchMeetingData = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}/meeting-data`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            dispatch(
              setMeetingData({
                meetingRooms: data.meetingRooms || [],
                meetingBookings: data.meetingBookings || [],
              })
            )
          }
        }
      } catch (err) {
        console.warn('Could not load meeting data:', err)
      }
    }

    fetchMeetingData()
    // Định kỳ refresh 15 giây để cập nhật trạng thái họp
    const interval = setInterval(fetchMeetingData, 15000)
    return () => clearInterval(interval)
  }, [roomId, dispatch])

  const toggleVisible = (val: boolean) => {
    setVisible(val)
    localStorage.setItem('skyoffice_utility_sidebar_visible', String(val))
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('skyoffice_utility_sidebar_collapsed', String(next))
  }

  if (designMode) return null

  // Khi đang bị ẩn, hiện Pill thu nhỏ
  if (!visible) {
    return (
      <>
        <ToggleOpenPill onClick={() => toggleVisible(true)} title="Mở thanh Tiện ích">
          <PillIconCircle>
            <WidgetsIcon style={{ fontSize: 13 }} />
          </PillIconCircle>
          <span className="label">Tiện ích</span>
          {activeMeetingsCount > 0 && (
            <Chip
              label={activeMeetingsCount}
              size="small"
              style={{
                height: 16,
                fontSize: 10,
                backgroundColor: '#ef4444',
                color: '#fff',
                fontWeight: 700,
                padding: '0 4px',
              }}
            />
          )}
          <ChevronRightIcon className="chevron-icon" />
        </ToggleOpenPill>
        <MeetingRoomDialog users={users} />
      </>
    )
  }

  return (
    <>
      <SidebarCard $collapsed={collapsed}>
        {/* Header */}
        <HeaderRow>
          <HeaderLeft>
            <IconBadge>
              <WidgetsIcon style={{ fontSize: 15 }} />
            </IconBadge>
            <TitleText>
              <span className="name">TIỆN ÍCH</span>
              {activeMeetingsCount > 0 && (
                <Chip
                  label={`${activeMeetingsCount} đang họp`}
                  size="small"
                  style={{
                    height: 18,
                    fontSize: 10,
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontWeight: 700,
                  }}
                />
              )}
            </TitleText>
          </HeaderLeft>

          <HeaderRightGroup>
            <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn'}>
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                style={{ color: '#94a3b8', padding: 2 }}
              >
                {collapsed ? (
                  <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
                ) : (
                  <KeyboardArrowUpIcon style={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Ẩn tiện ích">
              <IconButton
                size="small"
                onClick={() => toggleVisible(false)}
                style={{ color: '#64748b', padding: 2 }}
              >
                <VisibilityOffIcon style={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </HeaderRightGroup>
        </HeaderRow>

        {/* Danh sách các tính năng tiện ích */}
        {!collapsed && (
          <>
            <ModuleList>
              {/* Tính năng 1: Phòng họp */}
              <ModuleItem
                $accentColor="#38bdf8"
                onClick={() => dispatch(openMeetingDialog({ tab: 0 }))}
              >
                <ModuleLeft>
                  <ModuleIconBox
                    $bg="linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2))"
                    $color="#38bdf8"
                  >
                    <MeetingRoomIcon style={{ fontSize: 16 }} />
                  </ModuleIconBox>
                  <ModuleTextBlock>
                    <span className="module-title">Phòng Họp</span>
                    <span className="module-sub">
                      {totalMeetingRooms} phòng • {meetingBookings.length} lịch đặt
                    </span>
                  </ModuleTextBlock>
                </ModuleLeft>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {activeMeetingsCount > 0 && (
                    <LockIcon style={{ fontSize: 14, color: '#ef4444' }} />
                  )}
                  <ChevronRightIcon className="chevron" style={{ fontSize: 18 }} />
                </div>
              </ModuleItem>
            </ModuleList>

            <FooterNote>
              <span>Tiện ích văn phòng ảo SkyOffice</span>
              <span style={{ color: '#38bdf8', cursor: 'pointer' }} onClick={() => dispatch(openMeetingDialog({ tab: 1 }))}>
                + Đặt phòng
              </span>
            </FooterNote>
          </>
        )}
      </SidebarCard>

      {/* Modal Quản lý & Đặt phòng họp */}
      <MeetingRoomDialog users={users} />
    </>
  )
}
