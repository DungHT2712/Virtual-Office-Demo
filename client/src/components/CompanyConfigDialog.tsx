import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
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

import ApartmentIcon from '@mui/icons-material/Apartment'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import { WorkspaceCompany, CompanyDepartment } from '../types/core'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 680px;
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
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
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

const DeptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
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

const DeptItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(30, 41, 59, 0.8);
  }
`

const DeptInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .meta {
    font-size: 11px;
    color: #94a3b8;
    display: flex;
    gap: 8px;
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  company: WorkspaceCompany
  onSave: (updated: WorkspaceCompany) => void
}

export default function CompanyConfigDialog({ open, onClose, roomId, company, onSave }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [name, setName] = useState(company.name || '')
  const [abbr, setAbbr] = useState(company.abbr || '')
  const [domain, setDomain] = useState(company.domain || '')
  const [currency, setCurrency] = useState(company.currency || 'VND')
  const [country, setCountry] = useState(company.country || 'Việt Nam')
  const [departments, setDepartments] = useState<CompanyDepartment[]>(company.departments || [])

  // New department inputs
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptHead, setNewDeptHead] = useState('')

  // Edit department state
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [editDeptName, setEditDeptName] = useState('')
  const [editDeptHead, setEditDeptHead] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    setName(company.name || '')
    setAbbr(company.abbr || '')
    setDomain(company.domain || '')
    setCurrency(company.currency || 'VND')
    setCountry(company.country || 'Việt Nam')
    setDepartments(company.departments || [])
  }, [company])

  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return
    const newDept: CompanyDepartment = {
      id: 'dept_' + Math.random().toString(36).substring(2, 9),
      name: newDeptName.trim(),
      head: newDeptHead.trim() || undefined,
    }
    setDepartments([...departments, newDept])
    setNewDeptName('')
    setNewDeptHead('')
  }

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter((d) => d.id !== id))
  }

  const handleStartEdit = (dept: CompanyDepartment) => {
    setEditingDeptId(dept.id)
    setEditDeptName(dept.name)
    setEditDeptHead(dept.head || '')
  }

  const handleSaveEdit = () => {
    if (!editingDeptId || !editDeptName.trim()) return
    setDepartments(
      departments.map((d) =>
        d.id === editingDeptId ? { ...d, name: editDeptName.trim(), head: editDeptHead.trim() } : d
      )
    )
    setEditingDeptId(null)
  }

  const handleSave = async () => {
    setSaving(true)
    const updatedCompany: WorkspaceCompany = {
      name: name.trim() || 'My Company',
      abbr: abbr.trim() || 'MC',
      domain: domain.trim(),
      currency: currency.trim() || 'VND',
      country: country.trim() || 'Việt Nam',
      departments,
    }

    try {
      localStorage.setItem(`skyoffice_core_company_${roomId}`, JSON.stringify(updatedCompany))
      await fetch(`/api/workspaces/${roomId}/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: updatedCompany }),
      })
      onSave(updatedCompany)
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Failed to save company settings', err)
      onSave(updatedCompany)
      onClose()
    } finally {
      setSaving(false)
    }
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
            <ApartmentIcon sx={{ fontSize: 24 }} />
          </HeaderIconBox>
          <TitleGroup>
            <span className="title">Thiết lập Company (Công ty & Phòng ban)</span>
            <span className="subtitle">Mô hình tổ chức doanh nghiệp Frappe ERP</span>
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
            '&.Mui-selected': { color: '#38bdf8' },
          },
          '& .MuiTabs-indicator': { backgroundColor: '#38bdf8' },
        }}
      >
        <Tab icon={<ApartmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Thông tin Công ty" />
        <Tab
          icon={<AccountTreeIcon sx={{ fontSize: 18 }} />}
          iconPosition="start"
          label={`Phòng ban (${departments.length})`}
        />
      </Tabs>

      <DialogContent sx={{ p: 3 }}>
        {saveSuccess && (
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            sx={{ mb: 2, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
          >
            Đã lưu thiết lập Company thành công!
          </Alert>
        )}

        {activeTab === 0 && (
          <div>
            <SectionCard>
              <CardTitle>
                <ApartmentIcon fontSize="small" /> Thông tin cơ bản
              </CardTitle>
              <FormGrid>
                <TextField
                  label="Tên Công ty"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: SkyOffice Corp"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Tên viết tắt (Abbreviation)"
                  value={abbr}
                  onChange={(e) => setAbbr(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: SOC"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Tên miền / Website (Domain)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: skyoffice.local"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Quốc gia"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: Việt Nam"
                  sx={textFieldStyles}
                />
                <TextField
                  label="Đơn vị tiền tệ (Currency)"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="VD: VND"
                  sx={textFieldStyles}
                />
              </FormGrid>
            </SectionCard>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            {/* Form thêm phòng ban mới */}
            <SectionCard>
              <CardTitle>
                <AddCircleOutlineIcon fontSize="small" /> Thêm phòng ban mới
              </CardTitle>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <TextField
                  label="Tên phòng ban"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  size="small"
                  sx={{ ...textFieldStyles, flex: 2, minWidth: '180px' }}
                  placeholder="VD: Nghiên cứu & Phát triển (R&D)"
                />
                <TextField
                  label="Trưởng phòng (Head)"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  size="small"
                  sx={{ ...textFieldStyles, flex: 1.5, minWidth: '150px' }}
                  placeholder="VD: Trưởng phòng R&D"
                />
                <Button
                  variant="contained"
                  onClick={handleAddDepartment}
                  disabled={!newDeptName.trim()}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{
                    background: '#0284c7',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    '&:hover': { background: '#0369a1' },
                  }}
                >
                  Thêm
                </Button>
              </div>
            </SectionCard>

            {/* Danh sách phòng ban hiện tại */}
            <SectionCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <CardTitle style={{ marginBottom: 0 }}>
                  <AccountTreeIcon fontSize="small" /> Danh sách phòng ban ({departments.length})
                </CardTitle>
                <Chip
                  label="Cấu trúc Frappe Tree"
                  size="small"
                  sx={{
                    fontSize: '11px',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                />
              </div>

              {departments.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                  Chưa có phòng ban nào. Vui lòng thêm phòng ban ở trên.
                </div>
              ) : (
                <DeptList>
                  {departments.map((dept) => (
                    <DeptItem key={dept.id}>
                      {editingDeptId === dept.id ? (
                        <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'center' }}>
                          <TextField
                            size="small"
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            sx={{ ...textFieldStyles, flex: 2 }}
                          />
                          <TextField
                            size="small"
                            placeholder="Trưởng phòng"
                            value={editDeptHead}
                            onChange={(e) => setEditDeptHead(e.target.value)}
                            sx={{ ...textFieldStyles, flex: 1 }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveEdit}
                            sx={{ background: '#10b981', textTransform: 'none' }}
                          >
                            Lưu
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setEditingDeptId(null)}
                            sx={{ color: '#94a3b8', textTransform: 'none' }}
                          >
                            Hủy
                          </Button>
                        </div>
                      ) : (
                        <>
                          <DeptInfo>
                            <span className="name">{dept.name}</span>
                            <div className="meta">
                              <span>Mã: {dept.id}</span>
                              {dept.head && <span>• Trưởng phòng: {dept.head}</span>}
                            </div>
                          </DeptInfo>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleStartEdit(dept)}
                                sx={{ color: '#94a3b8', '&:hover': { color: '#38bdf8' } }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa phòng ban">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDepartment(dept.id)}
                                sx={{ color: '#94a3b8', '&:hover': { color: '#f43f5e' } }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </>
                      )}
                    </DeptItem>
                  ))}
                </DeptList>
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
          onClick={handleSave}
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
