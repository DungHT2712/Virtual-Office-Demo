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

import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

import { WorkspaceUser, WorkspaceCompany } from '../types/core'
import { useAppDispatch } from '../hooks'
import { setPlayerName } from '../stores/UserStore'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

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
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c084fc;
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
  color: #c084fc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const UserListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  margin-top: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
`

const UserItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(168, 85, 247, 0.3);
    background: rgba(30, 41, 59, 0.8);
  }
`

const UserInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const AvatarBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
`

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
  }

  .username {
    font-size: 12px;
    color: #94a3b8;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #cbd5e1;
    margin-top: 2px;
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  company: WorkspaceCompany
  users: WorkspaceUser[]
  currentUserId: string
  currentUserName: string
  onSave: (updatedUsers: WorkspaceUser[]) => void
}

export default function UserConfigDialog({
  open,
  onClose,
  roomId,
  company,
  users,
  currentUserId,
  currentUserName,
  onSave,
}: Props) {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState(0)
  const [userList, setUserList] = useState<WorkspaceUser[]>(users)
  const [searchTerm, setSearchTerm] = useState('')

  // Form thêm / sửa user
  const [isEditing, setIsEditing] = useState(false)
  const [editUserId, setEditUserId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formDeptId, setFormDeptId] = useState('')
  const [formRole, setFormRole] = useState('Member')
  const [showPassword, setShowPassword] = useState(false)

  // Current user's own profile state
  const [myName, setMyName] = useState(currentUserName)
  const [myUsername, setMyUsername] = useState(
    localStorage.getItem('skyoffice_user_login_name') || currentUserName.toLowerCase().replace(/\s+/g, '')
  )
  const [myPassword, setMyPassword] = useState(
    localStorage.getItem('skyoffice_user_password') || ''
  )
  const [showMyPassword, setShowMyPassword] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    setUserList(users)
  }, [users])

  useEffect(() => {
    setMyName(currentUserName)
  }, [currentUserName])

  const handleGeneratePassword = (target: 'form' | 'my') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
    let gen = ''
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (target === 'form') {
      setFormPassword(gen)
      setShowPassword(true)
    } else {
      setMyPassword(gen)
      setShowMyPassword(true)
    }
  }

  const handleStartAdd = () => {
    setIsEditing(true)
    setEditUserId(null)
    setFormName('')
    setFormUsername('')
    setFormPassword('')
    setFormEmail('')
    setFormDeptId(company.departments[0]?.id || '')
    setFormRole('Member')
    setShowPassword(false)
  }

  const handleStartEdit = (user: WorkspaceUser) => {
    setIsEditing(true)
    setEditUserId(user.id)
    setFormName(user.name)
    setFormUsername(user.username)
    setFormPassword(user.password || '')
    setFormEmail(user.email || '')
    setFormDeptId(user.departmentId || '')
    setFormRole(user.role || 'Member')
    setShowPassword(false)
  }

  const handleSaveFormUser = () => {
    if (!formName.trim() || !formUsername.trim()) return

    if (editUserId) {
      // Cập nhật user hiện tại
      setUserList(
        userList.map((u) =>
          u.id === editUserId
            ? {
                ...u,
                name: formName.trim(),
                username: formUsername.trim(),
                password: formPassword,
                email: formEmail.trim(),
                departmentId: formDeptId,
                role: formRole,
              }
            : u
        )
      )
    } else {
      // Thêm mới user
      const newUser: WorkspaceUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: formName.trim(),
        username: formUsername.trim(),
        password: formPassword,
        email: formEmail.trim() || `${formUsername.trim()}@${company.domain || 'office.local'}`,
        departmentId: formDeptId || company.departments[0]?.id,
        role: formRole,
        status: 'active',
      }
      setUserList([...userList, newUser])
    }

    setIsEditing(false)
    setEditUserId(null)
  }

  const handleDeleteUser = (id: string) => {
    setUserList(userList.filter((u) => u.id !== id))
  }

  const handleSaveMyProfile = () => {
    if (!myName.trim()) return
    localStorage.setItem('skyoffice_player_name', myName.trim())
    localStorage.setItem('skyoffice_user_login_name', myUsername.trim())
    localStorage.setItem('skyoffice_user_password', myPassword)

    // Cập nhật Redux Store
    dispatch(setPlayerName(myName.trim()))

    // Cập nhật Phaser player tag
    const game = phaserGame.scene.keys.game as Game
    if (game && game.myPlayer) {
      game.myPlayer.setPlayerName(myName.trim())
    }

    // Cập nhật trong userList nếu có user trùng ID hoặc trùng Username
    const updatedUsers = userList.map((u) => {
      if (u.id === currentUserId || u.name === currentUserName) {
        return {
          ...u,
          name: myName.trim(),
          username: myUsername.trim(),
          password: myPassword,
        }
      }
      return u
    })
    setUserList(updatedUsers)

    setStatusMsg('Đã cập nhật thông tin cá nhân của bạn!')
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 2000)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_core_users_${roomId}`, JSON.stringify(userList))
      await fetch(`/api/workspaces/${roomId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: userList }),
      })
      onSave(userList)
      setStatusMsg('Đã lưu cấu hình người dùng Workspace thành công!')
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save users', err)
      onSave(userList)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      fontSize: '13px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
      '&:hover fieldset': { borderColor: '#c084fc' },
      '&.Mui-focused fieldset': { borderColor: '#c084fc' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: '13px' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#c084fc' },
  }

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return 'Chưa phân bổ'
    const found = company.departments.find((d) => d.id === deptId)
    return found ? found.name : deptId
  }

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <HeaderRow>
        <HeaderLeft>
          <HeaderIconBox>
            <PeopleIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập User (Người dùng, Mật khẩu & Phân quyền)</span>
            <span className="subtitle">Mô hình quản lý nhân sự & tài khoản Frappe ERP</span>
          </TitleGroup>
        </HeaderLeft>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </HeaderRow>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          px: 3,
          '& .MuiTab-root': {
            color: '#94a3b8',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            '&.Mui-selected': { color: '#c084fc' },
          },
          '& .MuiTabs-indicator': { backgroundColor: '#c084fc' },
        }}
      >
        <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tài khoản của bạn" />
        <Tab
          icon={<PeopleIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={`Danh sách người dùng (${userList.length})`}
        />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {saveSuccess && (
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
          >
            {statusMsg || 'Đã lưu thiết lập thành công!'}
          </Alert>
        )}

        {activeTab === 0 && (
          <div>
            <SectionCard>
              <CardTitle>
                <PersonIcon fontSize="small" /> Thông tin tài khoản đăng nhập hiện tại
              </CardTitle>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 14 }}>
                Thiết lập Tên hiển thị, Tên đăng nhập và Mật khẩu cho tài khoản cá nhân của bạn trong Workspace.
              </div>

              <FormGrid>
                <TextField
                  label="Họ và Tên (Full Name)"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: Nguyễn Văn A"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Tên đăng nhập (Username / User)"
                  value={myUsername}
                  onChange={(e) => setMyUsername(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: nguyenvana"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Mật khẩu (Password)"
                  type={showMyPassword ? 'text' : 'password'}
                  value={myPassword}
                  onChange={(e) => setMyPassword(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Nhập mật khẩu"
                  sx={textFieldStyles}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowMyPassword(!showMyPassword)}
                          sx={{ color: '#94a3b8' }}
                        >
                          {showMyPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                        <Tooltip title="Tạo mật khẩu ngẫu nhiên">
                          <IconButton
                            size="small"
                            onClick={() => handleGeneratePassword('my')}
                            sx={{ color: '#c084fc' }}
                          >
                            <AutoFixHighIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleSaveMyProfile}
                    startIcon={<SaveIcon />}
                    sx={{
                      background: '#9333ea',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      height: '40px',
                      px: 3,
                      '&:hover': { background: '#7e22ce' },
                    }}
                  >
                    Lưu Tài Khoản Này
                  </Button>
                </div>
              </FormGrid>
            </SectionCard>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            {isEditing ? (
              <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <CardTitle style={{ marginBottom: 0 }}>
                    <VpnKeyIcon fontSize="small" />
                    {editUserId ? 'Chỉnh sửa thông tin User' : 'Thêm User mới vào Workspace'}
                  </CardTitle>
                  <IconButton size="small" onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>

                <FormGrid>
                  <TextField
                    label="Tên đầy đủ (Full Name)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="VD: Trần Thị B"
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Tên đăng nhập (Username)"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="VD: tranthib"
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Mật khẩu (Password)"
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Nhập hoặc tạo mật khẩu"
                    sx={textFieldStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: '#94a3b8' }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                          <Tooltip title="Tạo mật khẩu ngẫu nhiên">
                            <IconButton
                              size="small"
                              onClick={() => handleGeneratePassword('form')}
                              sx={{ color: '#c084fc' }}
                            >
                              <AutoFixHighIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Email liên hệ"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="VD: user@office.local"
                    sx={textFieldStyles}
                  />

                  {/* Phòng ban liên kết từ Company */}
                  <FormControl fullWidth size="small" sx={textFieldStyles}>
                    <InputLabel>Phòng ban (Department)</InputLabel>
                    <Select
                      value={formDeptId}
                      label="Phòng ban (Department)"
                      onChange={(e) => setFormDeptId(e.target.value)}
                      sx={{ color: '#f8fafc' }}
                    >
                      {company.departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Vai trò Frappe Role Profile */}
                  <FormControl fullWidth size="small" sx={textFieldStyles}>
                    <InputLabel>Vai trò (Role Profile)</InputLabel>
                    <Select
                      value={formRole}
                      label="Vai trò (Role Profile)"
                      onChange={(e) => setFormRole(e.target.value)}
                      sx={{ color: '#f8fafc' }}
                    >
                      <MenuItem value="Workspace Owner">Workspace Owner (Chủ sở hữu)</MenuItem>
                      <MenuItem value="System Manager">System Manager (Quản trị viên)</MenuItem>
                      <MenuItem value="Department Head">Department Head (Trưởng phòng)</MenuItem>
                      <MenuItem value="Member">Member (Thành viên)</MenuItem>
                      <MenuItem value="Guest">Guest (Khách)</MenuItem>
                    </Select>
                  </FormControl>
                </FormGrid>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <Button onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveFormUser}
                    disabled={!formName.trim() || !formUsername.trim()}
                    sx={{
                      background: '#9333ea',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: '#7e22ce' },
                    }}
                  >
                    {editUserId ? 'Cập Nhật User' : 'Thêm User'}
                  </Button>
                </div>
              </SectionCard>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <TextField
                  placeholder="Tìm kiếm theo Tên hoặc Username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ ...textFieldStyles, width: '280px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleStartAdd}
                  sx={{
                    background: '#9333ea',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    '&:hover': { background: '#7e22ce' },
                  }}
                >
                  Thêm User Mới
                </Button>
              </div>
            )}

            {/* Danh sách người dùng */}
            <SectionCard>
              <CardTitle>
                <PeopleIcon fontSize="small" /> Danh sách người dùng ({filteredUsers.length})
              </CardTitle>

              {filteredUsers.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                  Không tìm thấy người dùng nào.
                </div>
              ) : (
                <UserListContainer>
                  {filteredUsers.map((user) => (
                    <UserItem key={user.id}>
                      <UserInfoLeft>
                        <AvatarBadge>{(user.name || 'U').charAt(0).toUpperCase()}</AvatarBadge>
                        <UserDetails>
                          <div className="name-row">
                            <span className="name">{user.name}</span>
                            {user.id === currentUserId && (
                              <Chip
                                label="Bạn"
                                size="small"
                                sx={{
                                  fontSize: '10px',
                                  height: '18px',
                                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                                  color: '#38bdf8',
                                }}
                              />
                            )}
                            <Chip
                              label={user.role || 'Member'}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                height: '18px',
                                backgroundColor:
                                  user.role === 'Workspace Owner'
                                    ? 'rgba(245, 158, 11, 0.2)'
                                    : 'rgba(168, 85, 247, 0.2)',
                                color: user.role === 'Workspace Owner' ? '#fbbf24' : '#c084fc',
                              }}
                            />
                          </div>
                          <div className="username">@{user.username}</div>
                          <div className="meta">
                            <span>Phòng ban: {getDepartmentName(user.departmentId)}</span>
                            {user.password ? <span>• Mật khẩu: ••••••••</span> : <span>• Chưa đặt mật khẩu</span>}
                          </div>
                        </UserDetails>
                      </UserInfoLeft>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <Tooltip title="Chỉnh sửa User">
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(user)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#c084fc' } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {user.id !== currentUserId && (
                          <Tooltip title="Xóa User">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUser(user.id)}
                              sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    </UserItem>
                  ))}
                </UserListContainer>
              )}
            </SectionCard>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', textTransform: 'none' }}>
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveAll}
          disabled={saving}
          startIcon={<SaveIcon />}
          sx={{
            background: '#9333ea',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
            '&:hover': { background: '#7e22ce' },
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}
