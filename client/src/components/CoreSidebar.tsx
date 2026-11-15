import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

import ApartmentIcon from '@mui/icons-material/Apartment'
import PeopleIcon from '@mui/icons-material/People'
import HubIcon from '@mui/icons-material/Hub'
import WorkspacesIcon from '@mui/icons-material/Workspaces'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { useAppSelector } from '../hooks'
import {
  WorkspaceCompany,
  WorkspaceUser,
  DEFAULT_COMPANY,
  CompanyWorkspaceConfig,
  DEFAULT_WORKSPACE_CONFIG,
} from '../types/core'
import CompanyConfigDialog from './CompanyConfigDialog'
import UserConfigDialog from './UserConfigDialog'
import WorkspaceConfigDialog from './WorkspaceConfigDialog'

const SidebarContainer = styled.div<{ $collapsed: boolean }>`
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
    transition: transform 0.2s ease, color 0.2s ease;
  }

  @media (max-width: 600px) {
    top: 130px;
  }
`

const HeaderRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const CoreIconBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(56, 189, 248, 0.3);
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
  gap: 10px;
  overflow: hidden;
`

const ModuleIconBox = styled.div<{ $color: string; $bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
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
  onCompanyChange?: (company: WorkspaceCompany) => void
  onUsersChange?: (users: WorkspaceUser[]) => void
}

export default function CoreSidebar({ onCompanyChange, onUsersChange }: Props) {
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const roomId = useAppSelector((state) => state.room.roomId)
  const roomName = useAppSelector((state) => state.room.roomName)
  const currentUserId = useAppSelector((state) => state.user.userId)
  const currentUserName = useAppSelector((state) => state.user.playerName)

  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem('skyoffice_core_sidebar_visible')
    return stored !== 'false'
  })

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('skyoffice_core_sidebar_collapsed') === 'true'
  })

  // State cho Company và User
  const [company, setCompany] = useState<WorkspaceCompany>(() => {
    try {
      const stored = localStorage.getItem(`skyoffice_core_company_${roomId}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return {
      ...DEFAULT_COMPANY,
      name: roomName || DEFAULT_COMPANY.name,
    }
  })

  const [users, setUsers] = useState<WorkspaceUser[]>(() => {
    try {
      const stored = localStorage.getItem(`skyoffice_core_users_${roomId}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return [
      {
        id: currentUserId,
        name: currentUserName,
        username: currentUserName.toLowerCase().replace(/\s+/g, ''),
        password: '',
        role: 'Workspace Owner',
        departmentId: 'dept_bod',
        status: 'active',
      },
    ]
  })

  // Dialog visibility
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false)
  const [openUserDialog, setOpenUserDialog] = useState(false)
  const [openWorkspaceDialog, setOpenWorkspaceDialog] = useState(false)
  const [isParent, setIsParent] = useState<boolean>(true)

  // State cấu hình Workspace
  const [workspaceConfig, setWorkspaceConfig] = useState<CompanyWorkspaceConfig>(() => {
    try {
      const stored = localStorage.getItem(`skyoffice_core_workspace_config_${roomId}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return {
      ...DEFAULT_WORKSPACE_CONFIG,
      companyName: roomName || DEFAULT_WORKSPACE_CONFIG.companyName,
    }
  })

  // Fetch từ server khi roomId thay đổi
  useEffect(() => {
    if (onCompanyChange) onCompanyChange(company)
  }, [company, onCompanyChange])

  useEffect(() => {
    if (onUsersChange) onUsersChange(users)
  }, [users, onUsersChange])

  useEffect(() => {
    if (!roomId) return

    let isMounted = true
    const fetchCoreData = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}/core`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && isMounted) {
            if (data.company) {
              setCompany(data.company)
              localStorage.setItem(`skyoffice_core_company_${roomId}`, JSON.stringify(data.company))
            }
            if (data.users && data.users.length > 0) {
              setUsers(data.users)
              localStorage.setItem(`skyoffice_core_users_${roomId}`, JSON.stringify(data.users))
            }
          }
        }

        // Fetch workspace settings
        const wsRes = await fetch(`/api/workspaces/${roomId}`)
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.success && wsData.workspace && isMounted) {
            const ws = wsData.workspace
            if (ws.isParent !== undefined) {
              setIsParent(ws.isParent !== false)
            }
            const cfg: CompanyWorkspaceConfig = {
              companyName: ws.companyName || company.name || 'Virtual Office Co.',
              departmentId: ws.departmentId || 'dept_tech',
              departmentName: ws.departmentName || 'Kỹ Thuật & Công Nghệ',
              requireLogin: !!ws.requireLogin,
            }
            setWorkspaceConfig(cfg)
            localStorage.setItem(`skyoffice_core_workspace_config_${roomId}`, JSON.stringify(cfg))
          }
        }
      } catch (err) {
        // Fallback to localStorage already initialized
        console.warn('Could not load core data from API, using cached state', err)
      }
    }

    fetchCoreData()
    return () => {
      isMounted = false
    }
  }, [roomId, currentUserId, currentUserName])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('skyoffice_core_sidebar_collapsed', String(next))
  }

  const handleToggleVisible = (nextVal: boolean) => {
    setVisible(nextVal)
    localStorage.setItem('skyoffice_core_sidebar_visible', String(nextVal))
  }

  if (designMode) return null

  return (
    <>
      {!visible ? (
        <Tooltip title="Mở thanh Core (Company, User...)">
          <ToggleOpenPill onClick={() => handleToggleVisible(true)}>
            <CoreIconBadge style={{ width: 22, height: 22, borderRadius: 6 }}>
              <HubIcon sx={{ fontSize: 13 }} />
            </CoreIconBadge>
            <span className="label">Core</span>
            <ChevronRightIcon className="chevron-icon" />
          </ToggleOpenPill>
        </Tooltip>
      ) : (
        <SidebarContainer $collapsed={collapsed}>
          {/* Header bar */}
          <HeaderRow>
            <HeaderLeft>
              <CoreIconBadge>
                <HubIcon sx={{ fontSize: 16 }} />
              </CoreIconBadge>
              <TitleText>
                <span className="name">Core</span>
                <Chip
                  label="Frappe"
                  size="small"
                  sx={{
                    height: '16px',
                    fontSize: '9px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    borderRadius: '4px',
                  }}
                />
              </TitleText>
            </HeaderLeft>

            <HeaderRightGroup>
              <Tooltip title={collapsed ? 'Mở rộng module' : 'Thu gọn module'}>
                <IconButton
                  size="small"
                  onClick={toggleCollapse}
                  sx={{
                    color: '#94a3b8',
                    padding: '3px',
                    '&:hover': { color: '#f8fafc', background: 'rgba(255, 255, 255, 0.08)' },
                  }}
                >
                  {collapsed ? (
                    <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Ẩn thanh Core">
                <IconButton
                  size="small"
                  onClick={() => handleToggleVisible(false)}
                  sx={{
                    color: '#94a3b8',
                    padding: '3px',
                    '&:hover': { color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)' },
                  }}
                >
                  <VisibilityOffIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </HeaderRightGroup>
          </HeaderRow>

          {/* Nội dung danh sách module khi không thu gọn */}
          {!collapsed && (
            <>
              <ModuleList>
                {/* 1. Module Company */}
                <ModuleItem
                  $accentColor="#38bdf8"
                  onClick={() => setOpenCompanyDialog(true)}
                >
                  <ModuleLeft>
                    <ModuleIconBox $color="#38bdf8" $bg="rgba(56, 189, 248, 0.15)">
                      <ApartmentIcon sx={{ fontSize: 18 }} />
                    </ModuleIconBox>
                    <ModuleTextBlock>
                      <span className="module-title">Company</span>
                      <span className="module-sub">
                        {company.departments.length} phòng ban • {company.name}
                      </span>
                    </ModuleTextBlock>
                  </ModuleLeft>
                  <ChevronRightIcon className="chevron" sx={{ fontSize: 18 }} />
                </ModuleItem>

                {/* 2. Module User */}
                <ModuleItem
                  $accentColor="#c084fc"
                  onClick={() => setOpenUserDialog(true)}
                >
                  <ModuleLeft>
                    <ModuleIconBox $color="#c084fc" $bg="rgba(168, 85, 247, 0.15)">
                      <PeopleIcon sx={{ fontSize: 18 }} />
                    </ModuleIconBox>
                    <ModuleTextBlock>
                      <span className="module-title">User</span>
                      <span className="module-sub">
                        {users.length} tài khoản • Mật khẩu & Quyền
                      </span>
                    </ModuleTextBlock>
                  </ModuleLeft>
                  <ChevronRightIcon className="chevron" sx={{ fontSize: 18 }} />
                </ModuleItem>

                {/* 3. Module Workspace */}
                <ModuleItem
                  $accentColor="#10b981"
                  onClick={() => setOpenWorkspaceDialog(true)}
                >
                  <ModuleLeft>
                    <ModuleIconBox $color="#10b981" $bg="rgba(16, 185, 129, 0.15)">
                      <WorkspacesIcon sx={{ fontSize: 18 }} />
                    </ModuleIconBox>
                    <ModuleTextBlock>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="module-title">Workspace</span>
                        <Chip
                          label={isParent ? 'Cha' : 'Con'}
                          size="small"
                          sx={{
                            height: '14px',
                            fontSize: '9px',
                            fontWeight: 700,
                            backgroundColor: isParent ? 'rgba(34, 197, 94, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                            color: isParent ? '#4ade80' : '#f472b6',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                      <span className="module-sub">
                        {workspaceConfig.departmentName
                          ? `${workspaceConfig.companyName} • ${workspaceConfig.departmentName}`
                          : workspaceConfig.companyName}
                        {' • '}
                        {workspaceConfig.requireLogin ? 'Cần đăng nhập' : 'Tự do'}
                      </span>
                    </ModuleTextBlock>
                  </ModuleLeft>
                  <ChevronRightIcon className="chevron" sx={{ fontSize: 18 }} />
                </ModuleItem>
              </ModuleList>

              <FooterNote>
                <span>Chuẩn Frappe ERP</span>
                <span>+ Thêm module sau này</span>
              </FooterNote>
            </>
          )}
        </SidebarContainer>
      )}

      {/* Dialog Thiết lập Company */}
      <CompanyConfigDialog
        open={openCompanyDialog}
        onClose={() => setOpenCompanyDialog(false)}
        roomId={roomId}
        roomName={roomName}
        company={company}
        isParent={isParent}
        users={users}
        onSave={(updatedCompany) => setCompany(updatedCompany)}
      />

      {/* Dialog Thiết lập User */}
      <UserConfigDialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        roomId={roomId}
        company={company}
        users={users}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onSave={(updatedUsers) => setUsers(updatedUsers)}
      />

      {/* Dialog Thiết lập Workspace */}
      <WorkspaceConfigDialog
        open={openWorkspaceDialog}
        onClose={() => setOpenWorkspaceDialog(false)}
        roomId={roomId}
        company={company}
        users={users}
        isParent={isParent}
        onWorkspaceConfigChange={(cfg) => setWorkspaceConfig(cfg)}
      />
    </>
  )
}
