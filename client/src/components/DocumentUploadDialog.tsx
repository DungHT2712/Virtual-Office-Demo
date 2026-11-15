import React, { useState, useEffect, useRef } from 'react'
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

import DescriptionIcon from '@mui/icons-material/Description'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SearchIcon from '@mui/icons-material/Search'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import PersonIcon from '@mui/icons-material/Person'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import AttachFileIcon from '@mui/icons-material/AttachFile'

import { WorkspaceDocument, DocumentType, WorkspaceProject, WorkspaceUser } from '../types/core'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 820px;
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

const UploadDropArea = styled.div<{ $isDragging: boolean }>`
  grid-column: span 2;
  border: 2px dashed ${(props) => (props.$isDragging ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)')};
  background: ${(props) => (props.$isDragging ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.5)')};
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
  }

  .upload-text {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .upload-sub {
    font-size: 11px;
    color: #94a3b8;
  }
`

const FilePreviewBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;

  .file-left {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }

  .file-name {
    font-size: 13px;
    font-weight: 600;
    color: #38bdf8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 11px;
    color: #94a3b8;
  }
`

const DocListContainer = styled.div`
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

const DocItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(56, 189, 248, 0.35);
    background: rgba(30, 41, 59, 0.85);
  }
`

const DocLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
`

const DocFileIconBox = styled.div<{ $color?: string }>`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: ${(props) => (props.$color ? `${props.$color}20` : 'rgba(56, 189, 248, 0.15)')};
  border: 1px solid ${(props) => (props.$color ? `${props.$color}40` : 'rgba(56, 189, 248, 0.3)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || '#38bdf8'};
  flex-shrink: 0;
`

const DocDetails = styled.div`
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
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
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

  .file-tag {
    font-size: 11px;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  documents: WorkspaceDocument[]
  documentTypes: DocumentType[]
  projects: WorkspaceProject[]
  users: WorkspaceUser[]
  currentUserName: string
  onSave: (updatedDocs: WorkspaceDocument[]) => void
}

export default function DocumentUploadDialog({
  open,
  onClose,
  roomId,
  documents,
  documentTypes,
  projects,
  users,
  currentUserName,
  onSave,
}: Props) {
  const [docList, setDocList] = useState<WorkspaceDocument[]>(documents)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')

  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formTypeId, setFormTypeId] = useState('')
  const [formProjectId, setFormProjectId] = useState('')
  const [formUploadedBy, setFormUploadedBy] = useState(currentUserName)
  const [formDescription, setFormDescription] = useState('')

  // Uploaded File Info
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    size: number
    type: string
    data?: string
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setDocList(documents)
  }, [documents])

  useEffect(() => {
    setFormUploadedBy(currentUserName)
  }, [currentUserName])

  const handleStartAdd = () => {
    setIsEditing(true)
    setEditId(null)
    setFormTitle('')
    setFormTypeId(documentTypes[0]?.id || '')
    setFormProjectId(projects[0]?.id || '')
    setFormUploadedBy(currentUserName || 'Admin')
    setFormDescription('')
    setUploadedFile(null)
  }

  const handleStartEdit = (doc: WorkspaceDocument) => {
    setIsEditing(true)
    setEditId(doc.id)
    setFormTitle(doc.title)
    setFormTypeId(doc.typeId)
    setFormProjectId(doc.projectId || '')
    setFormUploadedBy(doc.uploadedBy)
    setFormDescription(doc.description || '')
    setUploadedFile({
      name: doc.fileName,
      size: doc.fileSize || 0,
      type: doc.fileType || '',
      data: doc.fileData,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      processSelectedFile(file)
    }
  }

  const processSelectedFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        data: typeof reader.result === 'string' ? reader.result : undefined,
      })
      // If title is empty, prefill with file base name
      if (!formTitle.trim()) {
        const base = file.name.replace(/\.[^/.]+$/, '')
        setFormTitle(base)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleSaveForm = () => {
    if (!formTitle.trim()) return

    const selectedType = documentTypes.find((t) => t.id === formTypeId)
    const selectedProj = projects.find((p) => p.id === formProjectId)

    if (editId) {
      setDocList(
        docList.map((d) =>
          d.id === editId
            ? {
                ...d,
                title: formTitle.trim(),
                typeId: formTypeId,
                typeName: selectedType ? selectedType.name : d.typeName,
                projectId: formProjectId,
                projectName: selectedProj ? selectedProj.name : d.projectName,
                uploadedBy: formUploadedBy.trim(),
                description: formDescription.trim(),
                fileName: uploadedFile ? uploadedFile.name : d.fileName,
                fileSize: uploadedFile ? uploadedFile.size : d.fileSize,
                fileType: uploadedFile ? uploadedFile.type : d.fileType,
                fileData: uploadedFile?.data || d.fileData,
              }
            : d
        )
      )
    } else {
      const newDoc: WorkspaceDocument = {
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        title: formTitle.trim(),
        typeId: formTypeId || documentTypes[0]?.id || 'doctype_default',
        typeName: selectedType ? selectedType.name : 'Chung',
        projectId: formProjectId,
        projectName: selectedProj ? selectedProj.name : undefined,
        uploadedBy: formUploadedBy.trim() || 'Admin',
        uploadedAt: Date.now(),
        fileName: uploadedFile ? uploadedFile.name : `${formTitle.trim()}.pdf`,
        fileSize: uploadedFile ? uploadedFile.size : 102400,
        fileType: uploadedFile ? uploadedFile.type : 'application/pdf',
        fileData: uploadedFile?.data,
        description: formDescription.trim(),
      }
      setDocList([...docList, newDoc])
    }

    setIsEditing(false)
    setEditId(null)
    setUploadedFile(null)
  }

  const handleDelete = (id: string) => {
    setDocList(docList.filter((d) => d.id !== id))
  }

  const handleDownload = (doc: WorkspaceDocument) => {
    if (doc.fileData) {
      const link = document.createElement('a')
      link.href = doc.fileData
      link.download = doc.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Fallback generate simulated file text download
      const blob = new Blob(
        [
          `--- TÀI LIỆU DỰ ÁN ---\nTên tài liệu: ${doc.title}\nLoại: ${doc.typeName}\nDự án: ${
            doc.projectName || 'Không'
          }\nNgười upload: ${doc.uploadedBy}\nThời gian: ${new Date(doc.uploadedAt).toLocaleString()}`,
        ],
        { type: 'text/plain;charset=utf-8' }
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.fileName || `${doc.title}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_docs_${roomId}`, JSON.stringify(docList))
      await fetch(`/api/workspaces/${roomId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: docList }),
      })
      onSave(docList)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save documents', err)
      onSave(docList)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '100 KB'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType?: string, fileName?: string) => {
    const name = (fileName || '').toLowerCase()
    const type = (fileType || '').toLowerCase()

    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <PictureAsPdfIcon sx={{ fontSize: 20, color: '#f43f5e' }} />
    }
    if (type.includes('sheet') || type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) {
      return <TableChartIcon sx={{ fontSize: 20, color: '#10b981' }} />
    }
    if (type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return <ImageIcon sx={{ fontSize: 20, color: '#a855f7' }} />
    }
    return <InsertDriveFileIcon sx={{ fontSize: 20, color: '#38bdf8' }} />
  }

  const filteredDocs = docList.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === 'All' || d.typeId === typeFilter
    const matchProject = projectFilter === 'All' || d.projectId === projectFilter
    return matchSearch && matchType && matchProject
  })

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
            <DescriptionIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Quản lý & Upload Document (Tài liệu)</span>
            <span className="subtitle">Hệ thống lưu trữ và định danh tài liệu dự án Frappe</span>
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
            Đã lưu dữ liệu Document thành công!
          </Alert>
        )}

        {isEditing ? (
          <SectionCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <CardTitle style={{ marginBottom: 0 }}>
                <CloudUploadIcon fontSize="small" />
                {editId ? 'Chỉnh sửa thông tin Document' : 'Upload Tài liệu Mới (Frappe Document)'}
              </CardTitle>
              <IconButton size="small" onClick={() => setIsEditing(false)} sx={{ color: '#94a3b8' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <FormGrid>
              {/* 1. Tên tài liệu */}
              <TextField
                label="Tên tài liệu (Document Title)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                size="small"
                fullWidth
                placeholder="VD: Hợp đồng triển khai giai đoạn 1"
                sx={textFieldStyles}
              />

              {/* 2. Loại tài liệu (Dropdown từ DocumentType) */}
              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Loại tài liệu (Document Type)</InputLabel>
                <Select
                  value={formTypeId}
                  label="Loại tài liệu (Document Type)"
                  onChange={(e) => setFormTypeId(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  {documentTypes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: t.color || '#38bdf8', marginRight: 8 }} />
                      {t.name} ({t.code || 'DOC'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 3. Dự án (Dropdown từ Projects) */}
              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Dự án liên kết (Project)</InputLabel>
                <Select
                  value={formProjectId}
                  label="Dự án liên kết (Project)"
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

              {/* 4. Người upload */}
              <FormControl fullWidth size="small" sx={textFieldStyles}>
                <InputLabel>Người upload (Uploaded By)</InputLabel>
                <Select
                  value={formUploadedBy}
                  label="Người upload (Uploaded By)"
                  onChange={(e) => setFormUploadedBy(e.target.value)}
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
                  {formUploadedBy && !users.some((u) => u.name === formUploadedBy) && (
                    <MenuItem value={formUploadedBy}>{formUploadedBy}</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* 5. Tài liệu đính kèm (File input / Drag & drop) */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <UploadDropArea
                $isDragging={isDragging}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedFile ? (
                  <FilePreviewBox onClick={(e) => e.stopPropagation()}>
                    <div className="file-left">
                      {getFileIcon(uploadedFile.type, uploadedFile.name)}
                      <div>
                        <div className="file-name">{uploadedFile.name}</div>
                        <div className="file-size">{formatFileSize(uploadedFile.size)}</div>
                      </div>
                    </div>
                    <Button
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ color: '#38bdf8', textTransform: 'none', fontSize: '11px' }}
                    >
                      Đổi File
                    </Button>
                  </FilePreviewBox>
                ) : (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 32, color: '#38bdf8' }} />
                    <span className="upload-text">Nhấn để chọn File hoặc Kéo & Thả file vào đây</span>
                    <span className="upload-sub">Hỗ trợ PDF, Word, Excel, Hình ảnh, Text và mọi định dạng</span>
                  </>
                )}
              </UploadDropArea>

              <TextField
                label="Ghi chú / Mô tả tài liệu"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                size="small"
                fullWidth
                placeholder="Ghi chú tóm tắt nội dung tài liệu"
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
                disabled={!formTitle.trim()}
                sx={{
                  background: '#0284c7',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { background: '#0369a1' },
                }}
              >
                {editId ? 'Cập Nhật Tài Liệu' : 'Lưu & Upload'}
              </Button>
            </div>
          </SectionCard>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Tìm kiếm tài liệu hoặc tên file..."
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="All">Tất cả loại tài liệu</MenuItem>
                  {documentTypes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ ...textFieldStyles, width: '150px' }}>
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
            </div>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleStartAdd}
              sx={{
                background: '#0284c7',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                '&:hover': { background: '#0369a1' },
              }}
            >
              Upload Document Mới
            </Button>
          </div>
        )}

        {/* Danh sách Document */}
        <SectionCard>
          <CardTitle>
            <DescriptionIcon fontSize="small" /> Danh sách Tài liệu ({filteredDocs.length})
          </CardTitle>

          {filteredDocs.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
              Chưa có tài liệu nào phù hợp. Nhấn "Upload Document Mới" để thêm tài liệu đầu tiên!
            </div>
          ) : (
            <DocListContainer>
              {filteredDocs.map((doc) => {
                const docType = documentTypes.find((t) => t.id === doc.typeId)
                const projName = doc.projectName || projects.find((p) => p.id === doc.projectId)?.name

                return (
                  <DocItem key={doc.id}>
                    <DocLeft>
                      <DocFileIconBox $color={docType?.color}>
                        {getFileIcon(doc.fileType, doc.fileName)}
                      </DocFileIconBox>

                      <DocDetails>
                        <div className="title-row">
                          <span className="title">{doc.title}</span>
                          {docType && (
                            <Chip
                              label={docType.name}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                height: '20px',
                                backgroundColor: `${docType.color || '#38bdf8'}20`,
                                color: docType.color || '#38bdf8',
                                border: `1px solid ${docType.color || '#38bdf8'}40`,
                                fontWeight: 600,
                              }}
                            />
                          )}
                          {projName && (
                            <Chip
                              icon={<RocketLaunchIcon sx={{ fontSize: '12px !important', color: '#f59e0b' }} />}
                              label={projName}
                              size="small"
                              sx={{
                                fontSize: '10px',
                                height: '20px',
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                              }}
                            />
                          )}
                        </div>

                        <div className="meta">
                          <span className="file-tag">
                            <AttachFileIcon sx={{ fontSize: 13 }} />
                            {doc.fileName} ({formatFileSize(doc.fileSize)})
                          </span>
                          <div className="meta-item">
                            <PersonIcon sx={{ fontSize: 13, color: '#38bdf8' }} />
                            <span>{doc.uploadedBy}</span>
                          </div>
                          <span>• {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </DocDetails>
                    </DocLeft>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <Tooltip title="Tải xuống tài liệu">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc)}
                          sx={{ color: '#38bdf8', '&:hover': { background: 'rgba(56, 189, 248, 0.15)' } }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa thông tin">
                        <IconButton
                          size="small"
                          onClick={() => handleStartEdit(doc)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#38bdf8' } }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa tài liệu">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(doc.id)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </DocItem>
                )
              })}
            </DocListContainer>
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
