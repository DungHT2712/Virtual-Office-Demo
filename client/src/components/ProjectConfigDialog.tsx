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
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import DateRangeIcon from '@mui/icons-material/DateRange'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'

import { WorkspaceProject, WorkspaceCompany, WorkspaceUser, WorkspaceTask } from '../types/core'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 780px;
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
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
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
  color: #fbbf24;
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

const ProjectListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
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

const ProjectCard = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(245, 158, 11, 0.35);
    background: rgba(30, 41, 59, 0.8);
  }
`

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  .name-block {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
  }

  .code {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
  }
`

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .progress-bar {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);

    .MuiLinearProgress-bar {
      border-radius: 3px;
      background: linear-gradient(90deg, #f59e0b, #10b981);
    }
  }

  .percent {
    font-size: 11px;
    font-weight: 700;
    color: #f8fafc;
    min-width: 34px;
    text-align: right;
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  projects: WorkspaceProject[]
  tasks: WorkspaceTask[]
  company: WorkspaceCompany
  users: WorkspaceUser[]
  onSave: (updatedProjects: WorkspaceProject[]) => void
}

export default function ProjectConfigDialog({
  open,
  onClose,
  roomId,
  projects,
  tasks,
  company,
  users,
  onSave,
}: Props) {
  const [projectList, setProjectList] = useState<WorkspaceProject[]>(projects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  // Form Thêm / Sửa Project
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formStatus, setFormStatus] = useState<'Open' | 'Completed' | 'Cancelled' | 'On Hold'>('Open')
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [formDeptId, setFormDeptId] = useState('')
  const [formManager, setFormManager] = useState('')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState('')
  const [formProgress, setFormProgress] = useState(0)
  const [formDescription, setFormDescription] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setProjectList(projects)
  }, [projects])

  const handleStartAdd = () => {
    setIsEditing(true)
    setEditId(null)
    setFormName('')
    setFormCode('PROJ-' + String(projectList.length + 1).padStart(3, '0'))
    setFormStatus('Open')
    setFormPriority('Medium')
    setFormDeptId(company.departments[0]?.id || '')
    setFormManager(users[0]?.name || '')
    setFormStartDate(new Date().toISOString().split('T')[0])
    setFormEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
    setFormProgress(0)
    setFormDescription('')
  }

  const handleStartEdit = (proj: WorkspaceProject) => {
    setIsEditing(true)
    setEditId(proj.id)
    setFormName(proj.name)
    setFormCode(proj.code || '')
    setFormStatus(proj.status)
    setFormPriority(proj.priority || 'Medium')
    setFormDeptId(proj.departmentId || '')
    setFormManager(proj.managerName || '')
    setFormStartDate(proj.startDate || '')
    setFormEndDate(proj.endDate || '')
    setFormProgress(proj.progress || 0)
    setFormDescription(proj.description || '')
  }

  const handleSaveForm = () => {
    if (!formName.trim()) return

    if (editId) {
      setProjectList(
        projectList.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: formName.trim(),
                code: formCode.trim(),
                status: formStatus,
                priority: formPriority,
                departmentId: formDeptId,
                managerName: formManager.trim(),
                startDate: formStartDate,
                endDate: formEndDate,
                progress: formProgress,
                description: formDescription.trim(),
              }
            : p
        )
      )
    } else {
      const newProj: WorkspaceProject = {
        id: 'proj_' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        code: formCode.trim() || 'PROJ-' + Math.floor(Math.random() * 900 + 100),
        status: formStatus,
        priority: formPriority,
        departmentId: formDeptId || company.departments[0]?.id,
        managerName: formManager.trim() || 'Admin',
        startDate: formStartDate,
        endDate: formEndDate,
        progress: formProgress,
        description: formDescription.trim(),
      }
      setProjectList([...projectList, newProj])
    }

    setIsEditing(false)
    setEditId(null)
  }

  const handleDelete = (id: string) => {
    setProjectList(projectList.filter((p) => p.id !== id))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_projects_${roomId}`, JSON.stringify(projectList))
      await fetch(`/api/workspaces/${roomId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: projectList }),
      })
      onSave(projectList)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save projects', err)
      onSave(projectList)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const filteredProjects = projectList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }
      case 'On Hold':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }
      case 'Cancelled':
        return { bg: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' }
      default:
        return { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' }
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return { bg: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }
      case 'High':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
      case 'Medium':
        return { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1' }
    }
  }

  const getDepartmentName = (id?: string) => {
    const dept = company.departments.find((d) => d.id === id)
    return dept ? dept.name : ''
  }

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId).length
  }

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      fontSize: '13px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
      '&:hover fieldset': { borderColor: '#fbbf24' },
      '&.Mui-focused fieldset': { borderColor: '#fbbf24' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: '13px' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#fbbf24' },
  }

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <HeaderRow>
        <HeaderLeft>
          <HeaderIconBox>
            <RocketLaunchIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập Project (Dự án & Tiến độ)</span>
            <span className="subtitle">Mô hình quản lý dự án chuẩn Frappe Projects</span>
          </TitleGroup>
        </HeaderLeft>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </HeaderRow>

      <DialogContent sx={{ p: 3 }}>
        {saveSuccess && (
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
          >
            Đã lưu danh sách Project thành công!
          </Alert>
        )}

        {isEditing ? (
          <SectionCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <CardTitle style={{ marginBottom: 0 }}>
                <RocketLaunchIcon fontSize="small" />
                {editId ? 'Chỉnh sửa thông tin Dự án' : 'Tạo Dự án mới (Frappe Project)'}
              </CardTitle>
              <IconButton size="small" onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <FormGrid>
              <TextField
                label="Tên Dự án (Project Name)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: Triển khai Hạ tầng Số"
                sx={textFieldStyles}
              />
              <TextField
                label="Mã Dự án (Project Code)"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: PROJ-001"
                sx={textFieldStyles}
              />

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Trạng thái (Status)</InputLabel>
                <Select
                  value={formStatus}
                  label="Trạng thái (Status)"
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="Open">Open (Đang mở)</MenuItem>
                  <MenuItem value="Completed">Completed (Hoàn thành)</MenuItem>
                  <MenuItem value="On Hold">On Hold (Tạm dừng)</MenuItem>
                  <MenuItem value="Cancelled">Cancelled (Đã hủy)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Mức độ ưu tiên (Priority)</InputLabel>
                <Select
                  value={formPriority}
                  label="Mức độ ưu tiên (Priority)"
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="Low">Low (Thấp)</MenuItem>
                  <MenuItem value="Medium">Medium (Trung bình)</MenuItem>
                  <MenuItem value="High">High (Cao)</MenuItem>
                  <MenuItem value="Urgent">Urgent (Khẩn cấp)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Phòng ban phụ trách</InputLabel>
                <Select
                  value={formDeptId}
                  label="Phòng ban phụ trách"
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

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Người quản trị (Project Manager)</InputLabel>
                <Select
                  value={formManager}
                  label="Người quản trị (Project Manager)"
                  onChange={(e) => setFormManager(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.name}>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      <span style={{ color: '#94a3b8', fontSize: '11px', marginLeft: 6 }}>
                        (@{u.username})
                      </span>
                    </MenuItem>
                  ))}
                  {formManager && !users.some((u) => u.name === formManager) && (
                    <MenuItem value={formManager}>{formManager}</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Ngày bắt đầu (Start Date)"
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                size="small"
                fullWidth
                sx={textFieldStyles}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Ngày hoàn thành (End Date)"
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                size="small"
                fullWidth
                sx={textFieldStyles}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Tiến độ hoàn thành (%)"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={formProgress}
                onChange={(e) => setFormProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                size="small"
                fullWidth
                sx={textFieldStyles}
              />

              <TextField
                label="Mô tả dự án"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                size="small"
                fullWidth
                placeholder="Mô tả chi tiết mục tiêu của dự án"
                sx={textFieldStyles}
              />
            </FormGrid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveForm}
                disabled={!formName.trim()}
                sx={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { background: '#d97706' },
                }}
              >
                {editId ? 'Cập Nhật Dự Án' : 'Lưu Dự Án'}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
              <TextField
                placeholder="Tìm kiếm dự án theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ ...textFieldStyles, width: '260px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ ...textFieldStyles, width: '130px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="All">Tất cả ({projectList.length})</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleStartAdd}
              sx={{
                background: '#f59e0b',
                color: '#0f172a',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '13px',
                '&:hover': { background: '#d97706' },
              }}
            >
              Thêm Dự Án Mới
            </Button>
          </div>
        )}

        {/* Danh sách dự án */}
        <SectionCard>
          <CardTitle>
            <RocketLaunchIcon fontSize="small" /> Danh sách Dự án ({filteredProjects.length})
          </CardTitle>

          {filteredProjects.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
              Chưa có dự án nào phù hợp. Nhấn "Thêm Dự Án Mới" để tạo dự án đầu tiên!
            </div>
          ) : (
            <ProjectListContainer>
              {filteredProjects.map((proj) => {
                const sColor = getStatusColor(proj.status)
                const pColor = getPriorityColor(proj.priority)
                const taskCount = getProjectTaskCount(proj.id)
                const deptName = getDepartmentName(proj.departmentId)

                return (
                  <ProjectCard key={proj.id}>
                    <ProjectHeader>
                      <div className="name-block">
                        <span className="code">{proj.code || 'PROJ'}</span>
                        <span className="name">{proj.name}</span>
                        <Chip
                          label={proj.status}
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: '20px',
                            backgroundColor: sColor.bg,
                            color: sColor.color,
                            border: `1px solid ${sColor.border}`,
                          }}
                        />
                        {proj.priority && (
                          <Chip
                            label={proj.priority}
                            size="small"
                            sx={{
                              fontSize: '10px',
                              height: '20px',
                              backgroundColor: pColor.bg,
                              color: pColor.color,
                            }}
                          />
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <Tooltip title="Chỉnh sửa Dự án">
                          <IconButton
                            size="small"
                            onClick={() => handleStartEdit(proj)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#fbbf24' } }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa Dự án">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(proj.id)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </ProjectHeader>

                    {/* Progress Bar */}
                    <ProgressRow>
                      <LinearProgress
                        className="progress-bar"
                        variant="determinate"
                        value={proj.progress || 0}
                      />
                      <span className="percent">{proj.progress || 0}%</span>
                    </ProgressRow>

                    {/* Project Meta Info */}
                    <ProjectMeta>
                      {proj.managerName && (
                        <div className="meta-item">
                          <PersonIcon sx={{ fontSize: 14, color: '#fbbf24' }} />
                          <span>{proj.managerName}</span>
                        </div>
                      )}
                      {deptName && (
                        <div className="meta-item">
                          <BusinessIcon sx={{ fontSize: 14, color: '#38bdf8' }} />
                          <span>{deptName}</span>
                        </div>
                      )}
                      {(proj.startDate || proj.endDate) && (
                        <div className="meta-item">
                          <DateRangeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <span>
                            {proj.startDate || '...'} → {proj.endDate || '...'}
                          </span>
                        </div>
                      )}
                      <div className="meta-item" style={{ marginLeft: 'auto', fontWeight: 600, color: '#f8fafc' }}>
                        <span>{taskCount} tasks</span>
                      </div>
                    </ProjectMeta>
                  </ProjectCard>
                )
              })}
            </ProjectListContainer>
          )}
        </SectionCard>
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
            background: '#f59e0b',
            color: '#0f172a',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '13px',
            '&:hover': { background: '#d97706' },
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}
