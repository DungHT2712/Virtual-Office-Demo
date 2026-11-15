export interface CompanyDepartment {
  id: string
  name: string
  parentId?: string
  head?: string
}

export interface WorkspaceCompany {
  id?: string
  name: string
  abbr?: string
  domain?: string
  currency?: string
  country?: string
  departments: CompanyDepartment[]
  createdAt?: number
}

export interface WorkspaceUser {
  id: string
  name: string
  username: string
  password?: string
  email?: string
  departmentId?: string
  role?: string
  status?: 'active' | 'disabled'
}

export interface CompanyWorkspaceConfig {
  companyId?: string
  companyName: string
  departmentId?: string
  departmentName?: string
  requireLogin: boolean
}

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

export const DEFAULT_WORKSPACE_CONFIG: CompanyWorkspaceConfig = {
  companyId: 'comp_voc',
  companyName: 'Virtual Office Co.',
  departmentId: 'dept_tech',
  departmentName: 'Kỹ Thuật & Công Nghệ',
  requireLogin: false,
}

export const DEFAULT_COMPANY: WorkspaceCompany = DEFAULT_COMPANIES[0]

export interface WorkspaceProject {
  id: string
  name: string
  code?: string
  status: 'Open' | 'Completed' | 'Cancelled' | 'On Hold'
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  departmentId?: string
  managerId?: string
  managerName?: string
  startDate?: string
  endDate?: string
  progress?: number
  description?: string
}

export interface WorkspaceTask {
  id: string
  title: string
  projectId?: string
  projectName?: string
  assigneeId?: string
  assigneeName?: string
  status: 'Open' | 'Working' | 'Pending Review' | 'Completed' | 'Cancelled'
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent'
  dueDate?: string
  progress?: number
  description?: string
}

export const DEFAULT_PROJECTS: WorkspaceProject[] = [
  {
    id: 'proj_default_1',
    name: 'Triển khai Văn phòng ảo SkyOffice',
    code: 'PROJ-001',
    status: 'Open',
    priority: 'High',
    departmentId: 'dept_tech',
    managerName: 'Admin',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    progress: 65,
    description: 'Dự án xây dựng và phát triển hệ sinh thái văn phòng tương tác',
  },
  {
    id: 'proj_default_2',
    name: 'Chiến dịch Ra mắt Sản phẩm Q4',
    code: 'PROJ-002',
    status: 'Open',
    priority: 'Medium',
    departmentId: 'dept_sales',
    managerName: 'Admin',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    progress: 25,
    description: 'Chiến dịch marketing và tiếp cận đối tác chiến lược',
  },
]

export const DEFAULT_TASKS: WorkspaceTask[] = [
  {
    id: 'task_default_1',
    title: 'Tối ưu hóa bản đồ và thiết kế không gian làm việc',
    projectId: 'proj_default_1',
    projectName: 'Triển khai Văn phòng ảo SkyOffice',
    assigneeName: 'Admin',
    status: 'Working',
    priority: 'High',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    progress: 70,
    description: 'Thiết kế các khu vực phòng họp, bàn làm việc và tiện ích',
  },
  {
    id: 'task_default_2',
    title: 'Tích hợp hệ thống quản trị Core & Projects Frappe',
    projectId: 'proj_default_1',
    projectName: 'Triển khai Văn phòng ảo SkyOffice',
    assigneeName: 'Admin',
    status: 'Completed',
    priority: 'Urgent',
    dueDate: new Date().toISOString().split('T')[0],
    progress: 100,
    description: 'Hoàn thiện giao diện và API đồng bộ dữ liệu dự án',
  },
  {
    id: 'task_default_3',
    title: 'Soạn thảo tài liệu hướng dẫn và onboarding nhân sự mới',
    projectId: 'proj_default_2',
    projectName: 'Chiến dịch Ra mắt Sản phẩm Q4',
    assigneeName: 'Admin',
    status: 'Open',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    progress: 0,
    description: 'Chuẩn bị tài liệu hướng dẫn tham gia văn phòng ảo',
  },
]

export interface DocumentType {
  id: string
  name: string
  code?: string
  description?: string
  color?: string
}

export interface WorkspaceDocument {
  id: string
  title: string
  typeId: string
  typeName?: string
  projectId?: string
  projectName?: string
  uploadedBy: string
  uploadedAt: number
  fileName: string
  fileSize?: number
  fileType?: string
  fileData?: string
  description?: string
}

export const DEFAULT_DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'doctype_spec',
    name: 'Tài liệu Kỹ thuật & Thiết kế',
    code: 'SPEC',
    description: 'Bản vẽ kỹ thuật, kiến trúc hệ thống và đặc tả thiết kế',
    color: '#38bdf8',
  },
  {
    id: 'doctype_contract',
    name: 'Hợp đồng & Pháp lý',
    code: 'CONTRACT',
    description: 'Hợp đồng dự án, thỏa thuận hợp tác và cam kết bảo mật',
    color: '#f59e0b',
  },
  {
    id: 'doctype_report',
    name: 'Báo cáo & Biên bản cuộc họp',
    code: 'REPORT',
    description: 'Báo cáo tiến độ tuần, biên bản họp giao ban',
    color: '#10b981',
  },
  {
    id: 'doctype_manual',
    name: 'Hướng dẫn sử dụng & Quy trình',
    code: 'MANUAL',
    description: 'Quy trình nội bộ, tài liệu onboarding thành viên',
    color: '#a855f7',
  },
]

export const DEFAULT_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: 'doc_default_1',
    title: 'Kiến trúc Hạ tầng Không gian Ảo 2.0',
    typeId: 'doctype_spec',
    typeName: 'Tài liệu Kỹ thuật & Thiết kế',
    projectId: 'proj_default_1',
    projectName: 'Triển khai Văn phòng ảo SkyOffice',
    uploadedBy: 'Admin',
    uploadedAt: Date.now() - 3600000 * 24,
    fileName: 'Architecture_SkyOffice_v2.pdf',
    fileSize: 2450000,
    fileType: 'application/pdf',
    description: 'Sơ đồ luồng dữ liệu Phaser 3 và Colyseus WebSocket Server',
  },
  {
    id: 'doc_default_2',
    title: 'Kế hoạch Phân bổ Ngân sách Marketing Q4',
    typeId: 'doctype_report',
    typeName: 'Báo cáo & Biên bản cuộc họp',
    projectId: 'proj_default_2',
    projectName: 'Chiến dịch Ra mắt Sản phẩm Q4',
    uploadedBy: 'Admin',
    uploadedAt: Date.now() - 3600000 * 8,
    fileName: 'Marketing_Budget_Q4.xlsx',
    fileSize: 840000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Bảng tính chi tiết dự toán chi phí quảng bá đa kênh',
  },
]
