import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

import WorkspacesIcon from '@mui/icons-material/Workspaces'
import ApartmentIcon from '@mui/icons-material/Apartment'
import HubIcon from '@mui/icons-material/Hub'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import TuneIcon from '@mui/icons-material/Tune'
import ListAltIcon from '@mui/icons-material/ListAlt'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { WorkspaceCompany, WorkspaceUser, CompanyWorkspaceConfig, DEFAULT_COMPANIES } from '../types/core'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setWorkspaceData } from '../stores/WorkspaceStore'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 760px;
    width: 95vw;
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const HeaderIconBox = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
`

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #f8fafc;
  }

  .subtitle {
    font-size: 12px;
    color: #94a3b8;
  }
`

const SectionCard = styled.div`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #10b981;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const SizeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
  }
`

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const SizeCard = styled.div<{ $selected: boolean }>`
  border: 2px solid ${(props) => (props.$selected ? '#10b981' : 'rgba(255, 255, 255, 0.1)')};
  background: ${(props) => (props.$selected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)')};
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  .name {
    font-size: 12px;
    font-weight: 700;
    color: ${(props) => (props.$selected ? '#10b981' : '#f1f5f9')};
  }

  .tiles {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`

const SwitchNoticeCard = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${(props) => (props.$active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)')};
  border: 1px solid ${(props) => (props.$active ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)')};
  color: #f1f5f9;
  font-size: 13px;
  margin-top: 10px;

  .icon {
    color: ${(props) => (props.$active ? '#f59e0b' : '#10b981')};
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .text-group {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .notice-title {
      font-weight: 700;
      color: ${(props) => (props.$active ? '#fbbf24' : '#34d399')};
    }

    .notice-desc {
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.4;
    }
  }
`

const WorkspaceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(30, 41, 59, 0.8);
  }
`

export type WorkspaceSizeType = 'SMALL' | 'MEDIUM' | 'LARGE' | 'XLARGE'

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  company: WorkspaceCompany
  users: WorkspaceUser[]
  onWorkspaceConfigChange?: (config: CompanyWorkspaceConfig) => void
}

export default function WorkspaceConfigDialog({
  open,
  onClose,
  roomId,
  company,
  users,
  onWorkspaceConfigChange,
}: Props) {
  const dispatch = useAppDispatch()
  const currentUserId = useAppSelector((state) => state.user.userId)
  const currentUserName = useAppSelector((state) => state.user.playerName)
  const roomName = useAppSelector((state) => state.room.roomName)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)

  const [tab, setTab] = useState(0)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Danh sách công ty có sẵn trong hệ thống (mỗi công ty có Company ID riêng)
  const [companiesList, setCompaniesList] = useState<WorkspaceCompany[]>(DEFAULT_COMPANIES)

  // 1. State cấu hình Workspace hiện tại
  const [selectedCompanyId, setSelectedCompanyId] = useState(company.id || 'comp_voc')
  const [selectedCompany, setSelectedCompany] = useState(company.name || 'Virtual Office Co.')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [requireLogin, setRequireLogin] = useState(false)
  const [savingCurrent, setSavingCurrent] = useState(false)

  // 2. State Tạo Workspace mới
  const [newWsName, setNewWsName] = useState('')
  const [newWsDescription, setNewWsDescription] = useState('')
  const [newWsSize, setNewWsSize] = useState<WorkspaceSizeType>('MEDIUM')
  const [newWsPassword, setNewWsPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [newWsCompanyId, setNewWsCompanyId] = useState(company.id || 'comp_voc')
  const [newWsCompany, setNewWsCompany] = useState(company.name || 'Virtual Office Co.')
  const [newWsDepartmentId, setNewWsDepartmentId] = useState('')
  const [newWsRequireLogin, setNewWsRequireLogin] = useState(true)
  const [creatingNew, setCreatingNew] = useState(false)

  // 3. State Danh sách Workspaces
  const [workspaceList, setWorkspaceList] = useState<any[]>([])

  // Load danh sách công ty từ server
  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.companies) && data.companies.length > 0) {
          setCompaniesList(data.companies)
        }
      }
    } catch (e) {
      console.warn('Could not load companies list:', e)
    }
  }

  // Load cấu hình của workspace hiện tại khi mở dialog hoặc roomId thay đổi
  useEffect(() => {
    if (!roomId) return

    let isMounted = true
    const loadCurrentWs = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.workspace && isMounted) {
            const ws = data.workspace
            if (ws.companyId) setSelectedCompanyId(ws.companyId)
            if (ws.companyName) setSelectedCompany(ws.companyName)
            setSelectedDepartmentId(ws.departmentId || '')
            setRequireLogin(!!ws.requireLogin)
          }
        }
      } catch (e) {
        console.warn('Could not load workspace config from API:', e)
      }
    }

    loadCompanies()
    loadCurrentWs()
    return () => {
      isMounted = false
    }
  }, [roomId, open, company])

  // Lấy danh sách phòng ban tương ứng với công ty đang chọn trong Tab 0
  const activeCompanyObj =
    companiesList.find((c) => c.id === selectedCompanyId || c.name === selectedCompany) || company
  const activeDepartments = activeCompanyObj?.departments || []

  // Lấy danh sách phòng ban tương ứng với công ty đang chọn trong Tab 1 (Tạo mới)
  const newWsCompanyObj =
    companiesList.find((c) => c.id === newWsCompanyId || c.name === newWsCompany) || company
  const newWsDepartments = newWsCompanyObj?.departments || []

  // Load danh sách workspace cho tab 2 (Danh Sách Workspace)
  const loadAllWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.workspaces)) {
          setWorkspaceList(data.workspaces)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (open && tab === 2) {
      loadAllWorkspaces()
    }
  }, [open, tab])

  // 1. Xử lý Lưu cấu hình Workspace hiện tại
  const handleSaveCurrent = async () => {
    setSavingCurrent(true)
    setErrorMsg('')
    setSuccessMsg('')

    let departmentName = ''
    if (selectedDepartmentId) {
      const deptObj = activeDepartments.find((d) => d.id === selectedDepartmentId)
      departmentName = deptObj ? deptObj.name : ''
    }

    const payload = {
      companyId: selectedCompanyId,
      companyName: selectedCompany,
      departmentId: selectedDepartmentId || '',
      departmentName,
      requireLogin,
    }

    try {
      const res = await fetch(`/api/workspaces/${roomId}/workspace-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setSuccessMsg('Đã cập nhật thiết lập Workspace thành công!')
          if (onWorkspaceConfigChange) {
            onWorkspaceConfigChange(payload)
          }
          // Lưu vào local cache
          localStorage.setItem(
            `skyoffice_core_workspace_config_${roomId}`,
            JSON.stringify(payload)
          )
          window.dispatchEvent(new Event('skyoffice_shared_workspaces_updated'))
          setTimeout(() => setSuccessMsg(''), 4000)
        } else {
          setErrorMsg(data.message || 'Không thể lưu thiết lập')
        }
      } else {
        setErrorMsg('Lỗi kết nối máy chủ')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi lưu cấu hình')
    } finally {
      setSavingCurrent(false)
    }
  }

  // 2. Xử lý Tạo Workspace mới
  const handleCreateNew = async () => {
    if (!newWsName.trim()) {
      setErrorMsg('Vui lòng nhập tên Workspace!')
      return
    }

    setCreatingNew(true)
    setErrorMsg('')
    setSuccessMsg('')

    let width = 50
    let height = 50
    if (newWsSize === 'SMALL') {
      width = 20
      height = 20
    } else if (newWsSize === 'LARGE') {
      width = 70
      height = 70
    } else if (newWsSize === 'XLARGE') {
      width = 100
      height = 100
    }

    let departmentName = ''
    if (newWsDepartmentId) {
      const deptObj = newWsDepartments.find((d) => d.id === newWsDepartmentId)
      departmentName = deptObj ? deptObj.name : ''
    }

    const payload = {
      name: newWsName.trim(),
      description: newWsDescription.trim(),
      password: newWsPassword ? newWsPassword.trim() : null,
      sizeType: newWsSize,
      width,
      height,
      ownerId: currentUserId,
      ownerName: currentUserName || 'Admin',
      shareMode: 'free',
      companyId: newWsCompanyId,
      companyName: newWsCompany,
      departmentId: newWsDepartmentId || '',
      departmentName,
      requireLogin: newWsRequireLogin,
      company: {
        ...newWsCompanyObj,
        id: newWsCompanyId,
        name: newWsCompany,
      },
      users: users && users.length > 0 ? users : undefined,
    }

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.workspace) {
          const created = data.workspace
          try {
            const stored = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
            stored.push({
              id: created.id,
              name: created.name,
              description: created.description,
              hasPassword: created.hasPassword,
              createdAt: Date.now(),
              sizeType: newWsSize,
              width,
              height,
              ownerId: currentUserId,
              ownerName: currentUserName || 'Admin',
              shareMode: 'free',
              sharedUsers: [currentUserId],
              companyId: newWsCompanyId,
              companyName: newWsCompany,
              departmentId: newWsDepartmentId || '',
              departmentName,
              requireLogin: newWsRequireLogin,
            })
            localStorage.setItem('saved_workspaces', JSON.stringify(stored))
          } catch (e) {
            console.error(e)
          }

          window.dispatchEvent(new Event('skyoffice_shared_workspaces_updated'))
          setSuccessMsg(
            `Tạo Workspace "${created.name}" thành công! Thông tin đã được thêm vào Manage Workspace.`
          )
          setNewWsName('')
          setNewWsDescription('')
          setNewWsPassword('')
          setTab(2) // Chuyển sang xem danh sách
          loadAllWorkspaces()
        } else {
          setErrorMsg(data.message || 'Lỗi khi tạo Workspace')
        }
      } else {
        setErrorMsg('Không thể kết nối đến máy chủ để tạo Workspace')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi tạo Workspace')
    } finally {
      setCreatingNew(false)
    }
  }

  // 3. Xử lý Chuyển sang Workspace khác
  const handleSwitchWorkspace = (targetWs: any) => {
    if (!lobbyJoined) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    if (targetWs.width && targetWs.height) {
      dispatch(
        setWorkspaceData({
          sizeType: targetWs.sizeType || 'MEDIUM',
          width: targetWs.width,
          height: targetWs.height,
        })
      )
    }
    bootstrap.network
      .joinCustomById(targetWs.id || targetWs.roomId || targetWs.name, null)
      .then(() => {
        onClose()
        bootstrap.launchGame()
      })
      .catch((err) => {
        console.error(err)
        setErrorMsg('Không thể vào workspace này (có thể cần mật khẩu bảo vệ)')
      })
  }

  // Lọc chỉ hiển thị những workspace do CÙNG CÔNG TY tạo (so sánh companyId hoặc companyName)
  const companyFilteredWorkspaces = workspaceList.filter((ws) => {
    if (ws.companyId && selectedCompanyId) {
      return ws.companyId === selectedCompanyId
    }
    return ws.companyName === selectedCompany
  })

  return (
    <StyledDialog open={open} onClose={onClose}>
      <HeaderRow>
        <HeaderLeft>
          <HeaderIconBox>
            <WorkspacesIcon sx={{ fontSize: 22 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập Workspace & Doanh nghiệp</span>
            <span className="subtitle">
              Phòng ban, phân quyền truy cập và quản lý workspace thuộc công ty
            </span>
          </TitleGroup>
        </HeaderLeft>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </HeaderRow>

      <Tabs
        value={tab}
        onChange={(_, val) => {
          setTab(val)
          setErrorMsg('')
          setSuccessMsg('')
        }}
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          px: 2,
          '& .MuiTab-root': {
            color: '#94a3b8',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
            minHeight: '44px',
            '&.Mui-selected': { color: '#10b981' },
          },
          '& .MuiTabs-indicator': { backgroundColor: '#10b981', height: '3px' },
        }}
      >
        <Tab icon={<TuneIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Workspace Hiện Tại" />
        <Tab icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Tạo Workspace Mới" />
        <Tab
          icon={<ListAltIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label={`Workspace Cùng Công Ty (${companyFilteredWorkspaces.length})`}
        />
      </Tabs>

      <DialogContent sx={{ p: 3, maxHeight: '65vh', overflowY: 'auto' }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
            {errorMsg}
          </Alert>
        )}
        {successMsg && (
          <Alert
            severity="success"
            sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}
            icon={<CheckCircleOutlineIcon />}
          >
            {successMsg}
          </Alert>
        )}

        {/* TAB 0: THIẾT LẬP WORKSPACE HIỆN TẠI */}
        {tab === 0 && (
          <div>
            <SectionCard>
              <CardTitle>
                <WorkspacesIcon sx={{ fontSize: 16 }} />
                Thông tin Workspace đang kết nối
              </CardTitle>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ color: '#94a3b8' }}>Tên Workspace: </span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>{roomName || 'SkyOffice'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Room ID: </span>
                  <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4, color: '#38bdf8' }}>
                    {roomId}
                  </code>
                </div>
              </div>

              {/* 1. Chọn Công ty */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Công ty (Chọn Công ty)</InputLabel>
                <Select
                  value={selectedCompanyId}
                  label="Công ty (Chọn Công ty)"
                  onChange={(e) => {
                    const id = e.target.value
                    setSelectedCompanyId(id)
                    const found = companiesList.find((c) => c.id === id)
                    if (found) setSelectedCompany(found.name)
                    setSelectedDepartmentId('') // Reset phòng ban khi đổi công ty
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <ApartmentIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                >
                  {companiesList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} {c.abbr ? `(${c.abbr})` : ''} — [ID: {c.id}]
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 2. Chọn Phòng ban (CÓ THỂ ĐỂ TRỐNG) */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Phòng ban thuộc công ty (Có thể để trống)</InputLabel>
                <Select
                  value={selectedDepartmentId}
                  label="Phòng ban thuộc công ty (Có thể để trống)"
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <HubIcon sx={{ color: '#c084fc', fontSize: 18 }} />
                    </InputAdornment>
                  }
                >
                  {/* Tùy chọn để trống */}
                  <MenuItem value="">
                    <em style={{ color: '#94a3b8' }}>-- Không chọn (Để trống phòng ban) --</em>
                  </MenuItem>
                  {activeDepartments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.head ? `(Trưởng bộ phận: ${dept.head})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Cần đăng nhập (tick chọn) */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 10, padding: '12px 14px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={requireLogin}
                      onChange={(e) => setRequireLogin(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <span style={{ fontWeight: 700, fontSize: 13, color: requireLogin ? '#fbbf24' : '#f8fafc' }}>
                      Cần đăng nhập khi vào Workspace
                    </span>
                  }
                />

                <SwitchNoticeCard $active={requireLogin}>
                  {requireLogin ? <VpnKeyIcon className="icon" /> : <LockOpenIcon className="icon" />}
                  <div className="text-group">
                    <span className="notice-title">
                      {requireLogin
                        ? 'Chế độ Bảo mật & Xác thực tài khoản kích hoạt'
                        : 'Chế độ Ra vào tự do'}
                    </span>
                    <span className="notice-desc">
                      {requireLogin
                        ? 'Trừ chủ workspace, khi các thành viên khác vào workspace này sẽ xuất hiện khung đăng nhập để kiểm tra tài khoản và mật khẩu (lấy từ danh sách User trong Core).'
                        : 'Không yêu cầu tài khoản. Bất kỳ ai có quyền truy cập đều có thể vào và tham gia trực tiếp.'}
                    </span>
                  </div>
                </SwitchNoticeCard>
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB 1: TẠO WORKSPACE MỚI */}
        {tab === 1 && (
          <div>
            <SectionCard>
              <CardTitle>
                <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                Thông tin & Kích thước Workspace
              </CardTitle>

              <TextField
                fullWidth
                size="small"
                label="Tên Workspace mới"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                placeholder="VD: Phòng Kỹ Thuật Dự Án Sky, Studio Sáng Tạo..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                  },
                }}
              />

              <SizeSelectorContainer>
                <label>Diện tích Workspace (Grid Area)</label>
                <SizeGrid>
                  <SizeCard
                    $selected={newWsSize === 'SMALL'}
                    onClick={() => setNewWsSize('SMALL')}
                  >
                    <div className="name">Nhỏ (Small)</div>
                    <div className="tiles">400 ô (20x20)</div>
                  </SizeCard>
                  <SizeCard
                    $selected={newWsSize === 'MEDIUM'}
                    onClick={() => setNewWsSize('MEDIUM')}
                  >
                    <div className="name">Vừa (Medium)</div>
                    <div className="tiles">2.500 ô (50x50)</div>
                  </SizeCard>
                  <SizeCard
                    $selected={newWsSize === 'LARGE'}
                    onClick={() => setNewWsSize('LARGE')}
                  >
                    <div className="name">Lớn (Large)</div>
                    <div className="tiles">4.900 ô (70x70)</div>
                  </SizeCard>
                  <SizeCard
                    $selected={newWsSize === 'XLARGE'}
                    onClick={() => setNewWsSize('XLARGE')}
                  >
                    <div className="name">Siêu lớn (XL)</div>
                    <div className="tiles">10.000 ô (100x100)</div>
                  </SizeCard>
                </SizeGrid>
              </SizeSelectorContainer>

              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Mô tả Workspace"
                value={newWsDescription}
                onChange={(e) => setNewWsDescription(e.target.value)}
                placeholder="Mục đích sử dụng, quy định chung..."
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                type={showNewPassword ? 'text' : 'password'}
                label="Mật khẩu bảo vệ phòng (Tùy chọn)"
                value={newWsPassword}
                onChange={(e) => setNewWsPassword(e.target.value)}
                sx={{
                  mb: 2,
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
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: '#94a3b8' }}
                      >
                        {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </SectionCard>

            <SectionCard>
              <CardTitle>
                <ApartmentIcon sx={{ fontSize: 16 }} />
                Thiết lập Doanh nghiệp & Xác thực
              </CardTitle>

              {/* Chọn Công ty */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Công ty (Chọn Công ty)</InputLabel>
                <Select
                  value={newWsCompanyId}
                  label="Công ty (Chọn Công ty)"
                  onChange={(e) => {
                    const id = e.target.value
                    setNewWsCompanyId(id)
                    const found = companiesList.find((c) => c.id === id)
                    if (found) setNewWsCompany(found.name)
                    setNewWsDepartmentId('')
                  }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <ApartmentIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                    </InputAdornment>
                  }
                >
                  {companiesList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} {c.abbr ? `(${c.abbr})` : ''} — [ID: {c.id}]
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Chọn Phòng ban (CÓ THỂ ĐỂ TRỐNG) */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Phòng ban thuộc công ty (Có thể để trống)</InputLabel>
                <Select
                  value={newWsDepartmentId}
                  label="Phòng ban thuộc công ty (Có thể để trống)"
                  onChange={(e) => setNewWsDepartmentId(e.target.value)}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <HubIcon sx={{ color: '#c084fc', fontSize: 18 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">
                    <em style={{ color: '#94a3b8' }}>-- Không chọn (Để trống phòng ban) --</em>
                  </MenuItem>
                  {newWsDepartments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} {dept.head ? `(Trưởng: ${dept.head})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Cần đăng nhập */}
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 10, padding: '12px 14px' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newWsRequireLogin}
                      onChange={(e) => setNewWsRequireLogin(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <span style={{ fontWeight: 700, fontSize: 13, color: newWsRequireLogin ? '#fbbf24' : '#f8fafc' }}>
                      Cần đăng nhập (Check tài khoản & mật khẩu từ User)
                    </span>
                  }
                />
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {newWsRequireLogin
                    ? '✓ Khi bật: Trừ chủ workspace, khi vào workspace sẽ có khung đăng nhập để check tài khoản và mật khẩu (lấy từ User).'
                    : '○ Khi tắt: Thành viên có thể ra vào tự do không cần đăng nhập.'}
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* TAB 2: DANH SÁCH WORKSPACE CÙNG CÔNG TY */}
        {tab === 2 && (
          <div>
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>
                  Workspace thuộc cùng công ty: <strong style={{ color: '#38bdf8' }}>{selectedCompany}</strong>
                </span>
                <span style={{ marginLeft: 8 }}>
                  <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, color: '#fbbf24', fontSize: 11 }}>
                    CompanyID: {selectedCompanyId}
                  </code>
                </span>
              </div>
              <Button
                size="small"
                variant="outlined"
                onClick={loadAllWorkspaces}
                sx={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', textTransform: 'none', fontSize: 12 }}
              >
                Làm mới danh sách
              </Button>
            </div>

            {companyFilteredWorkspaces.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: '#94a3b8', fontSize: 13 }}>
                Chưa có Workspace nào khác thuộc công ty <strong>{selectedCompany}</strong>.<br />
                Bạn có thể tạo thêm workspace mới cho công ty này ở tab <strong>"Tạo Workspace Mới"</strong>!
              </div>
            ) : (
              companyFilteredWorkspaces.map((ws) => {
                const isCurrent = ws.id === roomId || ws.name === roomName
                const isOwner = ws.ownerId === currentUserId

                return (
                  <WorkspaceItem key={ws.id || ws.name}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>{ws.name}</span>
                        {isCurrent && (
                          <Chip
                            label="Đang kết nối"
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
                          />
                        )}
                        {isOwner && (
                          <Chip
                            label="Chủ sở hữu"
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}
                          />
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                        <Chip
                          icon={<ApartmentIcon sx={{ fontSize: 12 }} />}
                          label={ws.companyName || selectedCompany}
                          size="small"
                          sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1' }}
                        />
                        {ws.departmentName ? (
                          <Chip
                            icon={<HubIcon sx={{ fontSize: 12 }} />}
                            label={ws.departmentName}
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}
                          />
                        ) : (
                          <Chip
                            label="Chưa phân phòng ban"
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8' }}
                          />
                        )}
                        {ws.requireLogin ? (
                          <Chip
                            icon={<VpnKeyIcon sx={{ fontSize: 12 }} />}
                            label="Cần đăng nhập"
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}
                          />
                        ) : (
                          <Chip
                            icon={<LockOpenIcon sx={{ fontSize: 12 }} />}
                            label="Ra vào tự do"
                            size="small"
                            sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      {!isCurrent && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSwitchWorkspace(ws)}
                          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: 12,
                            textTransform: 'none',
                            padding: '4px 12px',
                            '&:hover': { bgcolor: '#0369a1' },
                          }}
                        >
                          Vào Workspace
                        </Button>
                      )}
                    </div>
                  </WorkspaceItem>
                )
              })
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', textTransform: 'none' }}>
          Đóng
        </Button>

        {tab === 0 && (
          <Button
            variant="contained"
            onClick={handleSaveCurrent}
            disabled={savingCurrent}
            startIcon={<SaveIcon />}
            sx={{
              background: '#10b981',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#059669' },
            }}
          >
            {savingCurrent ? 'Đang lưu...' : 'Lưu thiết lập Workspace'}
          </Button>
        )}

        {tab === 1 && (
          <Button
            variant="contained"
            onClick={handleCreateNew}
            disabled={creatingNew}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              background: '#10b981',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#059669' },
            }}
          >
            {creatingNew ? 'Đang tạo...' : 'Tạo Workspace & Lưu Manage'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  )
}
