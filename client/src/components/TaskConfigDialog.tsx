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
import Checkbox from '@mui/material/Checkbox'

import TaskAltIcon from '@mui/icons-material/TaskAlt'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import DateRangeIcon from '@mui/icons-material/DateRange'
import PersonIcon from '@mui/icons-material/Person'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

import { WorkspaceTask, WorkspaceProject, WorkspaceUser } from '../types/core'

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
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
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
  color: #34d399;
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

const TaskListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const TaskItem = styled.div<{ $isCompleted: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
  gap: 10px;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$isCompleted ? 0.7 : 1)};

  &:hover {
    border-color: rgba(16, 185, 129, 0.35);
    background: rgba(30, 41, 59, 0.85);
  }
`

const TaskItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
`

const TaskContent = styled.div<{ $isCompleted: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;

  .title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .title {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
    text-decoration: ${(props) => (props.$isCompleted ? 'line-through' : 'none')};
  }

  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 11px;
    color: #94a3b8;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  tasks: WorkspaceTask[]
  projects: WorkspaceProject[]
  users: WorkspaceUser[]
  onSave: (updatedTasks: WorkspaceTask[]) => void
}

export default function TaskConfigDialog({
  open,
  onClose,
  roomId,
  tasks,
  projects,
  users,
  onSave,
}: Props) {
  const [taskList, setTaskList] = useState<WorkspaceTask[]>(tasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Form Thêm / Sửa Task
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formAssignee, setFormAssignee] = useState('')
  const [formStatus, setFormStatus] = useState<'Open' | 'Working' | 'Pending Review' | 'Completed' | 'Cancelled'>('Open')
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [formDueDate, setFormDueDate] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setTaskList(tasks)
  }, [tasks])

  const handleStartAdd = () => {
    setIsEditing(true)
    setEditId(null)
    setFormTitle('')
    setFormProjectId(projects[0]?.id || '')
    setFormAssignee(users[0]?.name || 'Admin')
    setFormStatus('Open')
    setFormPriority('Medium')
    setFormDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])
    setFormDescription('')
  }

  const handleStartEdit = (t: WorkspaceTask) => {
    setIsEditing(true)
    setEditId(t.id)
    setFormTitle(t.title)
    setFormProjectId(t.projectId || '')
    setFormAssignee(t.assigneeName || '')
    setFormStatus(t.status)
    setFormPriority(t.priority || 'Medium')
    setFormDueDate(t.dueDate || '')
    setFormDescription(t.description || '')
  }

  const handleToggleComplete = (taskId: string) => {
    setTaskList(
      taskList.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'Completed'
          return {
            ...t,
            status: isDone ? 'Working' : 'Completed',
            progress: isDone ? 50 : 100,
          }
        }
        return t
      })
    )
  }

  const handleSaveForm = () => {
    if (!formTitle.trim()) return

    const selectedProj = projects.find((p) => p.id === formProjectId)

    if (editId) {
      setTaskList(
        taskList.map((t) =>
          t.id === editId
            ? {
                ...t,
                title: formTitle.trim(),
                projectId: formProjectId,
                projectName: selectedProj ? selectedProj.name : t.projectName,
                assigneeName: formAssignee.trim(),
                status: formStatus,
                priority: formPriority,
                dueDate: formDueDate,
                progress: formStatus === 'Completed' ? 100 : t.progress || 0,
                description: formDescription.trim(),
              }
            : t
        )
      )
    } else {
      const newTask: WorkspaceTask = {
        id: 'task_' + Math.random().toString(36).substring(2, 9),
        title: formTitle.trim(),
        projectId: formProjectId,
        projectName: selectedProj ? selectedProj.name : undefined,
        assigneeName: formAssignee.trim() || 'Admin',
        status: formStatus,
        priority: formPriority,
        dueDate: formDueDate,
        progress: formStatus === 'Completed' ? 100 : 0,
        description: formDescription.trim(),
      }
      setTaskList([...taskList, newTask])
    }

    setIsEditing(false)
    setEditId(null)
  }

  const handleDelete = (id: string) => {
    setTaskList(taskList.filter((t) => t.id !== id))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_tasks_${roomId}`, JSON.stringify(taskList))
      await fetch(`/api/workspaces/${roomId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: taskList }),
      })
      onSave(taskList)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save tasks', err)
      onSave(taskList)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const filteredTasks = taskList.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchProject = projectFilter === 'All' || t.projectId === projectFilter
    const matchStatus = statusFilter === 'All' || t.status === statusFilter
    return matchSearch && matchProject && matchStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }
      case 'Working':
        return { bg: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' }
      case 'Pending Review':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' }
      case 'Cancelled':
        return { bg: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.3)' }
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' }
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

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      fontSize: '13px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
      '&:hover fieldset': { borderColor: '#34d399' },
      '&.Mui-focused fieldset': { borderColor: '#34d399' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: '13px' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#34d399' },
  }

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <HeaderRow>
        <HeaderLeft>
          <HeaderIconBox>
            <TaskAltIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập Task (Công việc & Phân công)</span>
            <span className="subtitle">Mô hình phân việc theo dự án chuẩn Frappe Task</span>
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
            Đã lưu danh sách Task thành công!
          </Alert>
        )}

        {isEditing ? (
          <SectionCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <CardTitle style={{ marginBottom: 0 }}>
                <TaskAltIcon fontSize="small" />
                {editId ? 'Chỉnh sửa Task' : 'Tạo Công việc mới (Frappe Task)'}
              </CardTitle>
              <IconButton size="small" onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <FormGrid>
              <TextField
                label="Tên công việc (Task Subject)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: Kiểm thử luồng chat realtime"
                sx={textFieldStyles}
              />

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Dự án (Project)</InputLabel>
                <Select
                  value={formProjectId}
                  label="Dự án (Project)"
                  onChange={(e) => setFormProjectId(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Trạng thái (Status)</InputLabel>
                <Select
                  value={formStatus}
                  label="Trạng thái (Status)"
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="Open">Open (Chưa bắt đầu)</MenuItem>
                  <MenuItem value="Working">Working (Đang thực hiện)</MenuItem>
                  <MenuItem value="Pending Review">Pending Review (Chờ duyệt)</MenuItem>
                  <MenuItem value="Completed">Completed (Đã xong)</MenuItem>
                  <MenuItem value="Cancelled">Cancelled (Hủy)</MenuItem>
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
                <InputLabel>Người phụ trách (Assignee)</InputLabel>
                <Select
                  value={formAssignee}
                  label="Người phụ trách (Assignee)"
                  onChange={(e) => setFormAssignee(e.target.value)}
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
                  {formAssignee && !users.some((u) => u.name === formAssignee) && (
                    <MenuItem value={formAssignee}>{formAssignee}</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Hạn chót (Due Date)"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                size="small"
                fullWidth
                sx={textFieldStyles}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Mô tả công việc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                size="small"
                fullWidth
                placeholder="Chi tiết công việc cần làm"
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
                disabled={!formTitle.trim()}
                sx={{
                  background: '#10b981',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { background: '#059669' },
                }}
              >
                {editId ? 'Cập Nhật Task' : 'Lưu Task'}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Tìm kiếm task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ ...textFieldStyles, width: '220px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ ...textFieldStyles, width: '160px' }}>
                <Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="All">Tất cả dự án</MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ ...textFieldStyles, width: '130px' }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="All">Tất cả trạng thái</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Working">Working</MenuItem>
                  <MenuItem value="Pending Review">Pending Review</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleStartAdd}
              sx={{
                background: '#10b981',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '13px',
                '&:hover': { background: '#059669' },
              }}
            >
              Thêm Task Mới
            </Button>
          </div>
        )}

        {/* Danh sách Task */}
        <SectionCard>
          <CardTitle>
            <TaskAltIcon fontSize="small" /> Danh sách Công việc ({filteredTasks.length})
          </CardTitle>

          {filteredTasks.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
              Chưa có công việc nào. Nhấn "Thêm Task Mới" để giao việc!
            </div>
          ) : (
            <TaskListContainer>
              {filteredTasks.map((t) => {
                const isCompleted = t.status === 'Completed'
                const sColor = getStatusColor(t.status)
                const pColor = getPriorityColor(t.priority)
                const projectName = t.projectName || projects.find((p) => p.id === t.projectId)?.name

                return (
                  <TaskItem key={t.id} $isCompleted={isCompleted}>
                    <TaskItemLeft>
                      <Tooltip title={isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu đã hoàn thành'}>
                        <Checkbox
                          checked={isCompleted}
                          onChange={() => handleToggleComplete(t.id)}
                          sx={{
                            color: '#64748b',
                            padding: '4px',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                      </Tooltip>
                      <TaskContent $isCompleted={isCompleted}>
                        <div className="title-row">
                          <span className="title">{t.title}</span>
                          <Chip
                            label={t.status}
                            size="small"
                            sx={{
                              fontSize: '10px',
                              height: '18px',
                              backgroundColor: sColor.bg,
                              color: sColor.color,
                              border: `1px solid ${sColor.border}`,
                            }}
                          />
                          {t.priority && (
                            <Chip
                              label={t.priority}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                height: '18px',
                                backgroundColor: pColor.bg,
                                color: pColor.color,
                              }}
                            />
                          )}
                        </div>
                        <div className="meta">
                          {projectName && (
                            <div className="meta-item">
                              <RocketLaunchIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
                              <span>{projectName}</span>
                            </div>
                          )}
                          {t.assigneeName && (
                            <div className="meta-item">
                              <PersonIcon sx={{ fontSize: 13, color: '#38bdf8' }} />
                              <span>{t.assigneeName}</span>
                            </div>
                          )}
                          {t.dueDate && (
                            <div className="meta-item">
                              <DateRangeIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                              <span>Hạn: {t.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </TaskContent>
                    </TaskItemLeft>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tooltip title="Chỉnh sửa Task">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(t)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#34d399' } }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa Task">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(t.id)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TaskItem>
                )
              })}
            </TaskListContainer>
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
            background: '#10b981',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '13px',
            '&:hover': { background: '#059669' },
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}
