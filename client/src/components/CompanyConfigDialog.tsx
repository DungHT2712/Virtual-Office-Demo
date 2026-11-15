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

import ApartmentIcon from '@mui/icons-material/Apartment'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckIcon from '@mui/icons-material/Check'
import ListAltIcon from '@mui/icons-material/ListAlt'
import BusinessIcon from '@mui/icons-material/Business'

import { WorkspaceCompany, CompanyDepartment, DEFAULT_COMPANIES } from '../types/core'

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    max-width: 740px;
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

const CompanyCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${(props) => (props.$selected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.7)')};
  border: 1px solid ${(props) => (props.$selected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 10px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #38bdf8;
    background: rgba(30, 41, 59, 0.8);
  }
`

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
  company: WorkspaceCompany
  isParent?: boolean
  onSave: (updated: WorkspaceCompany) => void
}

export default function CompanyConfigDialog({
  open,
  onClose,
  roomId,
  company,
  isParent = true,
  onSave,
}: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const [companies, setCompanies] = useState<WorkspaceCompany[]>(DEFAULT_COMPANIES)
  const [selectedCompId, setSelectedCompId] = useState<string>(company.id || 'comp_voc')

  // Edit company fields
  const [name, setName] = useState(company.name || '')
  const [abbr, setAbbr] = useState(company.abbr || '')
  const [domain, setDomain] = useState(company.domain || '')
  const [currency, setCurrency] = useState(company.currency || 'VND')
  const [country, setCountry] = useState(company.country || 'Việt Nam')
  const [departments, setDepartments] = useState<CompanyDepartment[]>(company.departments || [])

  // Create new company fields
  const [newCompName, setNewCompName] = useState('')
  const [newCompAbbr, setNewCompAbbr] = useState('')
  const [newCompDomain, setNewCompDomain] = useState('')
  const [newCompCurrency, setNewCompCurrency] = useState('VND')
  const [newCompCountry, setNewCompCountry] = useState('Việt Nam')

  // Department inputs
  const [newDeptName, setNewDeptName] = useState('')
  const [newDeptHead, setNewDeptHead] = useState('')
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [editDeptName, setEditDeptName] = useState('')
  const [editDeptHead, setEditDeptHead] = useState('')

  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load danh sách công ty từ server
  const loadCompanies = async () => {
    try {
      const res = await fetch('/api/companies')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.companies) && data.companies.length > 0) {
          setCompanies(data.companies)
          localStorage.setItem('skyoffice_companies', JSON.stringify(data.companies))
        }
      }
    } catch (e) {
      const stored = localStorage.getItem('skyoffice_companies')
      if (stored) {
        try {
          setCompanies(JSON.parse(stored))
        } catch (err) {}
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadCompanies()
    }
  }, [open])

  // Khi chọn một công ty khác để chỉnh sửa
  const handleSelectCompanyToEdit = (comp: WorkspaceCompany) => {
    setSelectedCompId(comp.id || '')
    setName(comp.name)
    setAbbr(comp.abbr || '')
    setDomain(comp.domain || '')
    setCurrency(comp.currency || 'VND')
    setCountry(comp.country || 'Việt Nam')
    setDepartments(comp.departments || [])
  }

  useEffect(() => {
    const cur = companies.find((c) => c.id === selectedCompId) || company
    setName(cur.name || '')
    setAbbr(cur.abbr || '')
    setDomain(cur.domain || '')
    setCurrency(cur.currency || 'VND')
    setCountry(cur.country || 'Việt Nam')
    setDepartments(cur.departments || [])
  }, [selectedCompId, companies])

  // 1. Thêm phòng ban
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

  // 2. Tạo công ty mới
  const handleCreateCompany = async () => {
    if (!newCompName.trim()) {
      setErrorMsg('Vui lòng nhập tên công ty mới!')
      return
    }

    setSaving(true)
    setErrorMsg('')

    const generatedId = 'comp_' + Math.random().toString(36).substring(2, 9)
    const newComp: WorkspaceCompany = {
      id: generatedId,
      name: newCompName.trim(),
      abbr: newCompAbbr.trim() || newCompName.substring(0, 4).toUpperCase(),
      domain: newCompDomain.trim() || 'office.local',
      currency: newCompCurrency.trim() || 'VND',
      country: newCompCountry.trim() || 'Việt Nam',
      departments: [
        { id: 'dept_bod', name: 'Ban Giám Đốc', head: 'CEO' },
        { id: 'dept_tech', name: 'Kỹ Thuật & Công Nghệ', head: 'CTO' },
        { id: 'dept_sales', name: 'Kinh Doanh & Tiếp Thị', head: 'Head of Sales' },
      ],
      createdAt: Date.now(),
    }

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComp),
      })
      if (res.ok) {
        const data = await res.json()
        const saved = data.company || newComp
        const updatedList = [...companies, saved]
        setCompanies(updatedList)
        localStorage.setItem('skyoffice_companies', JSON.stringify(updatedList))
        setSelectedCompId(saved.id)
        handleSelectCompanyToEdit(saved)
        setSuccessMsg(`Đã tạo công ty "${saved.name}" (ID: ${saved.id}) thành công!`)
        setNewCompName('')
        setNewCompAbbr('')
        setNewCompDomain('')
        setActiveTab(0)
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Lỗi tạo công ty')
    } finally {
      setSaving(false)
    }
  }

  // 3. Đặt làm công ty của Workspace hiện tại & Lưu
  const handleSetCurrentCompany = async (comp: WorkspaceCompany) => {
    setSaving(true)
    try {
      localStorage.setItem(`skyoffice_core_company_${roomId}`, JSON.stringify(comp))
      await fetch(`/api/workspaces/${roomId}/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: comp }),
      })
      // Đồng thời cập nhật companyId và companyName vào workspace config
      await fetch(`/api/workspaces/${roomId}/workspace-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: comp.id, companyName: comp.name }),
      })

      onSave(comp)
      setSuccessMsg(`Đã đặt "${comp.name}" làm công ty cho Workspace này!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // 4. Lưu thay đổi thông tin công ty đang chọn
  const handleSaveCurrentCompanyDetails = async () => {
    setSaving(true)
    setErrorMsg('')

    const updated: WorkspaceCompany = {
      id: selectedCompId,
      name: name.trim() || 'My Company',
      abbr: abbr.trim() || 'MC',
      domain: domain.trim(),
      currency: currency.trim() || 'VND',
      country: country.trim() || 'Việt Nam',
      departments,
    }

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        const nextList = companies.map((c) => (c.id === selectedCompId ? updated : c))
        setCompanies(nextList)
        localStorage.setItem('skyoffice_companies', JSON.stringify(nextList))

        // Nếu công ty này đang gán cho workspace hiện tại thì cập nhật luôn
        if (company.id === selectedCompId || company.name === updated.name) {
          localStorage.setItem(`skyoffice_core_company_${roomId}`, JSON.stringify(updated))
          await fetch(`/api/workspaces/${roomId}/company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company: updated }),
          })
          onSave(updated)
        }

        setSuccessMsg(`Cập nhật thông tin công ty "${updated.name}" thành công!`)
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi lưu thông tin công ty')
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
            <span className="title">Quản Lý Công Ty & Phòng Ban</span>
            <span className="subtitle">Mô hình đa doanh nghiệp - Mỗi công ty có Company ID riêng</span>
          </TitleGroup>
        </HeaderLeft>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </HeaderRow>

      <Tabs
        value={activeTab}
        onChange={(_, val) => {
          setActiveTab(val)
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
            '&.Mui-selected': { color: '#38bdf8' },
          },
          '& .MuiTabs-indicator': { backgroundColor: '#38bdf8', height: '3px' },
        }}
      >
        <Tab icon={<ListAltIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={`Danh Sách Công Ty (${companies.length})`} />
        <Tab icon={<BusinessIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Thông Tin Công Ty" />
        <Tab icon={<AccountTreeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Cơ Cấu Phòng Ban" />
        {isParent !== false && (
          <Tab icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="+ Thêm Công Ty Mới" />
        )}
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

        {/* TAB 0: DANH SÁCH CÔNG TY */}
        {activeTab === 0 && (
          <div>
            {isParent === false && (
              <Alert severity="info" sx={{ mb: 2, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                Đây là <strong>Workspace Con</strong>. Workspace này chỉ thuộc về 1 công ty duy nhất được thiết lập từ ban đầu và không thể tạo thêm công ty mới hoặc chuyển đổi công ty khác.
              </Alert>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                {isParent !== false
                  ? 'Hệ thống hỗ trợ tạo nhiều công ty. Mỗi công ty sở hữu một Company ID riêng biệt.'
                  : 'Workspace con hiển thị danh sách công ty để tham khảo, công ty hiện tại được cố định.'}
              </span>
              {isParent !== false && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setActiveTab(3)}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ bgcolor: '#0284c7', color: '#fff', textTransform: 'none', fontSize: 12, fontWeight: 700 }}
                >
                  Tạo Công Ty Mới
                </Button>
              )}
            </div>

            {companies.map((c) => {
              const isCurrentForWorkspace = company.id === c.id || company.name === c.name
              const isSelectedToEdit = selectedCompId === c.id

              return (
                <CompanyCard key={c.id || c.name} $selected={isSelectedToEdit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#f8fafc' }}>{c.name}</span>
                      {c.abbr && (
                        <Chip
                          label={c.abbr}
                          size="small"
                          sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}
                        />
                      )}
                      {isCurrentForWorkspace && (
                        <Chip
                          icon={<CheckIcon sx={{ fontSize: 12 }} />}
                          label="Đang gán cho Workspace"
                          size="small"
                          sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                      <code style={{ background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4, color: '#38bdf8', fontSize: 11 }}>
                        CompanyID: {c.id}
                      </code>
                      <Chip
                        label={`${c.departments?.length || 0} phòng ban`}
                        size="small"
                        sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}
                      />
                      {c.domain && (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>• {c.domain}</span>
                      )}
                      {c.country && (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>• {c.country}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isParent !== false && !isCurrentForWorkspace && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSetCurrentCompany(c)}
                        sx={{
                          color: '#34d399',
                          borderColor: 'rgba(52, 211, 153, 0.3)',
                          textTransform: 'none',
                          fontSize: 11,
                          fontWeight: 600,
                          '&:hover': { bgcolor: 'rgba(52, 211, 153, 0.1)', borderColor: '#34d399' },
                        }}
                      >
                        Gán Cho Workspace
                      </Button>
                    )}

                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        handleSelectCompanyToEdit(c)
                        setActiveTab(1)
                      }}
                      sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 700, textTransform: 'none', fontSize: 11 }}
                    >
                      Chi Tiết & Sửa
                    </Button>
                  </div>
                </CompanyCard>
              )
            })}
          </div>
        )}

        {/* TAB 1: THÔNG TIN CÔNG TY ĐANG CHỌN */}
        {activeTab === 1 && (
          <div>
            <SectionCard>
              <CardTitle>
                <ApartmentIcon sx={{ fontSize: 16 }} />
                Thông tin chung công ty
              </CardTitle>

              <div style={{ marginBottom: 14, fontSize: 12, color: '#94a3b8' }}>
                Đang cấu hình: <strong style={{ color: '#38bdf8' }}>{name}</strong> • Mã CompanyID: <code style={{ color: '#fbbf24' }}>{selectedCompId}</code>
              </div>

              <FormGrid>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên Công Ty (Company Name)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Tên Viết Tắt (Abbreviation)"
                  value={abbr}
                  onChange={(e) => setAbbr(e.target.value)}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Tên Miền (Domain)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Đồng Tiền Mặc Định (Currency)"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  sx={textFieldStyles}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Quốc Gia (Country)"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  sx={textFieldStyles}
                />
              </FormGrid>
            </SectionCard>
          </div>
        )}

        {/* TAB 2: CƠ CẤU PHÒNG BAN */}
        {activeTab === 2 && (
          <div>
            <SectionCard>
              <CardTitle>
                <AccountTreeIcon sx={{ fontSize: 16 }} />
                Phòng ban của công ty: {name}
              </CardTitle>

              {/* Form thêm phòng ban */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Tên phòng ban mới"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  sx={textFieldStyles}
                />
                <TextField
                  size="small"
                  label="Trưởng bộ phận (Tùy chọn)"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  sx={textFieldStyles}
                />
                <Button
                  variant="contained"
                  onClick={handleAddDepartment}
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 700, textTransform: 'none', px: 2, whiteSpace: 'nowrap' }}
                >
                  Thêm
                </Button>
              </div>

              {/* Danh sách phòng ban */}
              <DeptList>
                {departments.map((dept) => (
                  <DeptItem key={dept.id}>
                    {editingDeptId === dept.id ? (
                      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                        <TextField
                          size="small"
                          value={editDeptName}
                          onChange={(e) => setEditDeptName(e.target.value)}
                          sx={{ ...textFieldStyles, flex: 2 }}
                        />
                        <TextField
                          size="small"
                          value={editDeptHead}
                          onChange={(e) => setEditDeptHead(e.target.value)}
                          sx={{ ...textFieldStyles, flex: 1 }}
                        />
                        <IconButton size="small" onClick={handleSaveEdit} sx={{ color: '#34d399' }}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>{dept.name}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            Mã: {dept.id} {dept.head ? `• Trưởng bộ phận: ${dept.head}` : ''}
                          </span>
                        </div>
                        <div>
                          <IconButton size="small" onClick={() => handleStartEdit(dept)} sx={{ color: '#94a3b8' }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteDepartment(dept.id)} sx={{ color: '#ef4444' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </>
                    )}
                  </DeptItem>
                ))}
              </DeptList>
            </SectionCard>
          </div>
        )}

        {/* TAB 3: THÊM CÔNG TY MỚI */}
        {activeTab === 3 && (
          <div>
            {isParent === false ? (
              <Alert severity="warning" sx={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                Workspace con không được tạo thêm công ty mới. Workspace con chỉ có 1 công ty cố định đã thiết lập từ ban đầu.
              </Alert>
            ) : (
              <SectionCard>
                <CardTitle>
                  <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                  Khởi tạo công ty mới
                </CardTitle>
                <p style={{ margin: '0 0 14px 0', fontSize: 12, color: '#94a3b8' }}>
                  Hệ thống sẽ tự động gán một <strong>Company ID</strong> ngẫu nhiên độc nhất cho công ty này.
                </p>

                <FormGrid>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên Công Ty Mới *"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    placeholder="VD: Tech Corp, VinTech, Global Soft..."
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên Viết Tắt (Abbr)"
                    value={newCompAbbr}
                    onChange={(e) => setNewCompAbbr(e.target.value)}
                    placeholder="VD: TC, VT, GS..."
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Tên Miền Doanh Nghiệp"
                    value={newCompDomain}
                    onChange={(e) => setNewCompDomain(e.target.value)}
                    placeholder="VD: company.com"
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Đồng Tiền Mặc Định"
                    value={newCompCurrency}
                    onChange={(e) => setNewCompCurrency(e.target.value)}
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Quốc Gia"
                    value={newCompCountry}
                    onChange={(e) => setNewCompCountry(e.target.value)}
                    sx={textFieldStyles}
                  />
                </FormGrid>
              </SectionCard>
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8', textTransform: 'none' }}>
          Đóng
        </Button>

        {(activeTab === 1 || activeTab === 2) && (
          <Button
            variant="contained"
            onClick={handleSaveCurrentCompanyDetails}
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#0284c7', color: '#fff' },
            }}
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Công Ty'}
          </Button>
        )}

        {activeTab === 3 && (
          <Button
            variant="contained"
            onClick={handleCreateCompany}
            disabled={saving}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#0284c7', color: '#fff' },
            }}
          >
            {saving ? 'Đang tạo...' : 'Tạo Công Ty'}
          </Button>
        )}
      </DialogActions>
    </StyledDialog>
  )
}
