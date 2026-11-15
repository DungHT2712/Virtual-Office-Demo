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

import CategoryIcon from '@mui/icons-material/Category'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import { DocumentType, WorkspaceDocument } from '../types/core'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 650px;
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
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
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
  color: #38bdf8;
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

const TypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
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

const TypeItem = styled.div<{ $borderColor?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid ${(props) => props.$borderColor || 'rgba(255, 255, 255, 0.08)'};
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.85);
    transform: translateX(2px);
  }
`

const TypeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  .name-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .desc {
    font-size: 11px;
    color: #94a3b8;
  }
`

const COLOR_PRESETS = [
  '#38bdf8', // Sky Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
]

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  documentTypes: DocumentType[]
  documents: WorkspaceDocument[]
  onSave: (updatedTypes: DocumentType[]) => void
}

export default function DocumentTypeConfigDialog({
  open,
  onClose,
  roomId,
  documentTypes,
  documents,
  onSave,
}: Props) {
  const [typeList, setTypeList] = useState<DocumentType[]>(documentTypes)

  // Form thêm / sửa
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0])
  const [formDesc, setFormDesc] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setTypeList(documentTypes)
  }, [documentTypes])

  const handleStartAdd = () => {
    setIsEditing(true)
    setEditId(null)
    setFormName('')
    setFormCode('')
    setFormColor(COLOR_PRESETS[typeList.length % COLOR_PRESETS.length])
    setFormDesc('')
  }

  const handleStartEdit = (t: DocumentType) => {
    setIsEditing(true)
    setEditId(t.id)
    setFormName(t.name)
    setFormCode(t.code || '')
    setFormColor(t.color || COLOR_PRESETS[0])
    setFormDesc(t.description || '')
  }

  const handleSaveForm = () => {
    if (!formName.trim()) return

    if (editId) {
      setTypeList(
        typeList.map((t) =>
          t.id === editId
            ? {
                ...t,
                name: formName.trim(),
                code: formCode.trim().toUpperCase() || t.code,
                color: formColor,
                description: formDesc.trim(),
              }
            : t
        )
      )
    } else {
      const newType: DocumentType = {
        id: 'doctype_' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        code: formCode.trim().toUpperCase() || formName.trim().substring(0, 4).toUpperCase(),
        color: formColor,
        description: formDesc.trim(),
      }
      setTypeList([...typeList, newType])
    }

    setIsEditing(false)
    setEditId(null)
  }

  const handleDelete = (id: string) => {
    setTypeList(typeList.filter((t) => t.id !== id))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_doc_types_${roomId}`, JSON.stringify(typeList))
      await fetch(`/api/workspaces/${roomId}/document-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentTypes: typeList }),
      })
      onSave(typeList)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save document types', err)
      onSave(typeList)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const getDocCountForType = (typeId: string) => {
    return documents.filter((d) => d.typeId === typeId).length
  }

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '8px',
      fontSize: '13px',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
      '&:hover fieldset': { borderColor: '#38bdf8' },
      '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
    },
    '& .MuiInputLabel-root': { color: '#94a3b8', fontSize: '13px' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
  }

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <HeaderRow>
        <HeaderLeft>
          <HeaderIconBox>
            <CategoryIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập Loại Document (Document Types)</span>
            <span className="subtitle">Phân loại tài liệu chuẩn Frappe DMS</span>
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
            Đã lưu thiết lập Loại Document thành công!
          </Alert>
        )}

        {isEditing ? (
          <SectionCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <CardTitle style={{ marginBottom: 0 }}>
                <CategoryIcon fontSize="small" />
                {editId ? 'Chỉnh sửa Loại Document' : 'Thêm Loại Document mới'}
              </CardTitle>
              <IconButton size="small" onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <FormGrid>
              <TextField
                label="Tên loại tài liệu (Type Name)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: Hợp đồng & Pháp lý"
                sx={textFieldStyles}
              />

              <TextField
                label="Mã viết tắt (Code)"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: CONTRACT"
                sx={textFieldStyles}
              />

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                  Màu sắc nhận diện (Color Badge):
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLOR_PRESETS.map((color) => (
                    <div
                      key={color}
                      onClick={() => setFormColor(color)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: formColor === color ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: formColor === color ? `0 0 10px ${color}` : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <TextField
                label="Mô tả loại tài liệu"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                size="small"
                fullWidth
                placeholder="Mô tả phạm vi áp dụng cho loại tài liệu này"
                sx={{ ...textFieldStyles, gridColumn: 'span 2' }}
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
                  background: '#0284c7',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { background: '#0369a1' },
                }}
              >
                {editId ? 'Cập Nhật Loại' : 'Thêm Loại'}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleStartAdd}
              sx={{
                background: '#0284c7',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                '&:hover': { background: '#0369a1' },
              }}
            >
              Thêm Loại Document Mới
            </Button>
          </div>
        )}

        {/* Danh sách Loại Document */}
        <SectionCard>
          <CardTitle>
            <CategoryIcon fontSize="small" /> Danh sách Loại Document ({typeList.length})
          </CardTitle>

          {typeList.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
              Chưa có loại document nào. Nhấn nút "Thêm Loại Document Mới" ở trên để khởi tạo!
            </div>
          ) : (
            <TypeList>
              {typeList.map((type) => {
                const count = getDocCountForType(type.id)
                return (
                  <TypeItem key={type.id} $borderColor={type.color ? `${type.color}35` : undefined}>
                    <TypeInfo>
                      <div className="name-row">
                        <span className="name">{type.name}</span>
                        {type.code && (
                          <Chip
                            label={type.code}
                            size="small"
                            sx={{
                              fontSize: '10px',
                              height: '18px',
                              backgroundColor: `${type.color || '#38bdf8'}25`,
                              color: type.color || '#38bdf8',
                              fontWeight: 700,
                            }}
                          />
                        )}
                        <Chip
                          label={`${count} tài liệu`}
                          size="small"
                          sx={{
                            fontSize: '10px',
                            height: '18px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#cbd5e1',
                          }}
                        />
                      </div>
                      {type.description && <span className="desc">{type.description}</span>}
                    </TypeInfo>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(type)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#38bdf8' } }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa loại tài liệu">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(type.id)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TypeItem>
                )
              })}
            </TypeList>
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
            background: '#0284c7',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
            '&:hover': { background: '#0369a1' },
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </DialogActions>
    </StyledDialog>
  )
}
