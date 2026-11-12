import React, { useState } from 'react'
import styled from 'styled-components'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

import { useAppSelector, useAppDispatch } from '../hooks'
import {
  UserStatus,
  setCurrentStatus,
  addStatus,
  updateStatus,
  deleteStatus,
  resetToDefaultStatuses,
} from '../stores/UserStore'

const Container = styled.div`
  position: relative;
  width: 360px;
  max-width: 90vw;
  background: #1e293b;
  color: #f8fafc;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: inherit;
  user-select: none;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }
`

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.7);
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;

  .status-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid #ffffff;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
    transition: background-color 0.2s ease;
  }

  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .status-title {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
  }
`

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 14px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 4px;
  }
`

const StatusItem = styled.div<{ $active: boolean; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 10px;
  background: ${(props) => (props.$active ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)')};
  border: 1px solid ${(props) => (props.$active ? props.$color : 'rgba(255, 255, 255, 0.06)')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.$active ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.07)')};
    border-color: ${(props) => props.$color};
  }

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    overflow: hidden;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${(props) => props.$color};
    border: 1.5px solid #ffffff;
    flex-shrink: 0;
    box-shadow: 0 0 6px ${(props) => props.$color}88;
  }

  .name {
    font-size: 13.5px;
    font-weight: ${(props) => (props.$active ? 600 : 500)};
    color: ${(props) => (props.$active ? '#ffffff' : '#cbd5e1')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .active-icon {
    color: ${(props) => props.$color};
    font-size: 18px;
    margin-left: 6px;
    display: flex;
    align-items: center;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0.8;
  }
`

const FormCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .form-title {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
  }

  .color-label {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .color-swatch {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: transform 0.15s;

    &:hover {
      transform: scale(1.15);
    }

    &.selected {
      border-color: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
      transform: scale(1.15);
    }
  }

  .custom-color-input {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 0;
    background: transparent;
    overflow: hidden;
  }

  .preview-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px 10px;
    border-radius: 8px;
    margin-top: 4px;
  }
`

const PRESET_COLORS = [
  '#107c41', // Teams Available Green
  '#c4314b', // Teams Busy Red
  '#a4262c', // Teams DND Dark Red
  '#d83b01', // Teams BRB Orange
  '#ffaa44', // Teams Away Amber
  '#8a8886', // Teams Offline Gray
  '#2563eb', // Blue
  '#9333ea', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
]

interface StatusDialogProps {
  onClose: () => void
}

export default function StatusDialog({ onClose }: StatusDialogProps) {
  const dispatch = useAppDispatch()
  const playerName = useAppSelector((state) => state.user.playerName)
  const statuses = useAppSelector((state) => state.user.statuses)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)

  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState('#107c41')

  const handleStartAdd = () => {
    setFormName('')
    setFormColor('#107c41')
    setMode('add')
  }

  const handleStartEdit = (status: UserStatus, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(status.id)
    setFormName(status.name)
    setFormColor(status.color)
    setMode('edit')
  }

  const handleDelete = (statusId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (statuses.length <= 1) return
    dispatch(deleteStatus(statusId))
  }

  const handleSave = () => {
    const trimmed = formName.trim()
    if (!trimmed) return

    if (mode === 'add') {
      dispatch(addStatus({ name: trimmed, color: formColor }))
      setMode('list')
    } else if (mode === 'edit' && editingId) {
      dispatch(updateStatus({ id: editingId, name: trimmed, color: formColor }))
      setMode('list')
      setEditingId(null)
    }
  }

  const handleCancelForm = () => {
    setMode('list')
    setEditingId(null)
  }

  return (
    <Container>
      <Header>
        <h3>Trạng Thái Hoạt Động (Teams)</h3>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Header>

      {/* Hiển thị vòng tròn màu sắc tương ứng trước tên người dùng */}
      <UserBadge>
        <div className="status-circle" style={{ backgroundColor: currentStatus.color }} />
        <div className="user-name">{playerName || 'Guest'}</div>
        <div className="status-title" style={{ color: currentStatus.color }}>
          {currentStatus.name}
        </div>
      </UserBadge>

      {/* Form thêm hoặc sửa trạng thái */}
      {mode !== 'list' && (
        <FormCard>
          <div className="form-title">
            {mode === 'add' ? '➕ Thêm Trạng Thái Mới' : '✏️ Chỉnh Sửa Trạng Thái'}
          </div>

          <TextField
            size="small"
            placeholder="Tên trạng thái (VD: Đang họp, Ăn trưa...)"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoFocus
            fullWidth
            sx={{
              input: { color: '#ffffff', fontSize: '13.5px' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: '#38bdf8' },
                '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
              },
            }}
          />

          <div>
            <div className="color-label">Chọn màu sắc:</div>
            <div className="color-palette">
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${formColor.toLowerCase() === c.toLowerCase() ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormColor(c)}
                />
              ))}
              <Tooltip title="Màu tùy chọn">
                <input
                  type="color"
                  className="custom-color-input"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                />
              </Tooltip>
            </div>
          </div>

          {/* Xem trước trạng thái trước tên */}
          <div className="preview-row">
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Xem trước:</span>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: formColor,
                display: 'inline-block',
                border: '1.5px solid #fff',
              }}
            />
            <span style={{ fontWeight: 600, color: '#fff' }}>{playerName || 'Guest'}</span>
            <span style={{ color: formColor, fontSize: '12px' }}>({formName || 'Tên trạng thái'})</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button size="small" variant="text" onClick={handleCancelForm} sx={{ color: '#94a3b8' }}>
              Hủy
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={!formName.trim()}
              sx={{
                background: '#0284c7',
                '&:hover': { background: '#0369a1' },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Lưu
            </Button>
          </div>
        </FormCard>
      )}

      {/* Danh sách các trạng thái */}
      {mode === 'list' && (
        <>
          <StatusList>
            {statuses.map((s) => {
              const isActive = s.id === currentStatus.id
              return (
                <StatusItem
                  key={s.id}
                  $active={isActive}
                  $color={s.color}
                  onClick={() => dispatch(setCurrentStatus(s.id))}
                >
                  <div className="left">
                    <div className="dot" />
                    <span className="name">{s.name}</span>
                    {isActive && (
                      <span className="active-icon">
                        <CheckIcon fontSize="inherit" />
                      </span>
                    )}
                  </div>
                  <div className="actions">
                    <Tooltip title="Sửa trạng thái">
                      <IconButton
                        size="small"
                        onClick={(e) => handleStartEdit(s, e)}
                        sx={{ color: '#94a3b8', padding: '4px', '&:hover': { color: '#38bdf8' } }}
                      >
                        <EditIcon sx={{ fontSize: '15px' }} />
                      </IconButton>
                    </Tooltip>
                    {statuses.length > 1 && (
                      <Tooltip title="Xóa trạng thái">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(s.id, e)}
                          sx={{ color: '#94a3b8', padding: '4px', '&:hover': { color: '#f43f5e' } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: '15px' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </StatusItem>
              )
            })}
          </StatusList>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleStartAdd}
              sx={{
                color: '#38bdf8',
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 600,
                '&:hover': { background: 'rgba(56, 189, 248, 0.1)' },
              }}
            >
              Thêm Trạng Thái
            </Button>

            <Tooltip title="Khôi phục trạng thái mặc định của Microsoft Teams">
              <IconButton
                size="small"
                onClick={() => dispatch(resetToDefaultStatuses())}
                sx={{ color: '#64748b', '&:hover': { color: '#94a3b8' } }}
              >
                <RestartAltIcon sx={{ fontSize: '17px' }} />
              </IconButton>
            </Tooltip>
          </div>
        </>
      )}
    </Container>
  )
}
