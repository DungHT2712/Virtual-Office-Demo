import fs from 'fs'
import path from 'path'

export interface CompanyDepartment {
  id: string
  name: string
  parentId?: string
  head?: string
}

export interface WorkspaceCompany {
  id: string
  name: string
  abbr?: string
  domain?: string
  currency?: string
  country?: string
  departments: CompanyDepartment[]
  createdAt?: number
}

const STORAGE_FILE = path.join(__dirname, 'companies.json')

export const DEFAULT_COMPANIES: WorkspaceCompany[] = [
  {
    id: 'comp_voc',
    name: 'Virtual Office Co.',
    abbr: 'VOC',
    domain: 'office.local',
    currency: 'VND',
    country: 'Việt Nam',
    departments: [
      { id: 'dept_bod', name: 'Ban Giám Đốc', head: 'CEO' },
      { id: 'dept_tech', name: 'Kỹ Thuật & Công Nghệ', head: 'CTO' },
      { id: 'dept_sales', name: 'Kinh Doanh & Tiếp Thị', head: 'Head of Sales' },
      { id: 'dept_hr', name: 'Nhân Sự & Hành Chính', head: 'HR Lead' },
      { id: 'dept_fin', name: 'Tài Chính & Kế Toán', head: 'Chief Accountant' },
    ],
    createdAt: 1700000000000,
  },
  {
    id: 'comp_frappe',
    name: 'Frappe Enterprise',
    abbr: 'FRAPPE',
    domain: 'frappe.io',
    currency: 'USD',
    country: 'Global',
    departments: [
      { id: 'dept_fr_core', name: 'Core Engineering', head: 'Lead Architect' },
      { id: 'dept_fr_support', name: 'Customer Success', head: 'Support Lead' },
      { id: 'dept_fr_ops', name: 'Operations & HR', head: 'COO' },
    ],
    createdAt: 1700000000000,
  },
]

export function getAllCompanies(): WorkspaceCompany[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(DEFAULT_COMPANIES, null, 2), 'utf-8')
      return DEFAULT_COMPANIES
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    const list = JSON.parse(data)
    if (!Array.isArray(list) || list.length === 0) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(DEFAULT_COMPANIES, null, 2), 'utf-8')
      return DEFAULT_COMPANIES
    }
    return list
  } catch (err) {
    console.error('Error reading companies.json:', err)
    return DEFAULT_COMPANIES
  }
}

export function getCompanyById(id: string): WorkspaceCompany | undefined {
  const list = getAllCompanies()
  return list.find((c) => c.id === id || c.name === id)
}

export function saveCompany(company: WorkspaceCompany): WorkspaceCompany {
  try {
    const list = getAllCompanies()
    if (!company.id) {
      company.id = 'comp_' + Math.random().toString(36).substring(2, 9)
    }
    if (!company.createdAt) {
      company.createdAt = Date.now()
    }
    const index = list.findIndex((c) => c.id === company.id)
    if (index >= 0) {
      list[index] = { ...list[index], ...company }
    } else {
      list.push(company)
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
    return index >= 0 ? list[index] : company
  } catch (err) {
    console.error('Error saving company:', err)
    return company
  }
}

export function removeCompany(id: string): boolean {
  try {
    const list = getAllCompanies().filter((c) => c.id !== id)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error removing company:', err)
    return false
  }
}
