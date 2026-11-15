import fs from 'fs'
import path from 'path'

export interface PendingRequest {
  userId: string
  userName: string
  requestedAt: number
}

export interface CompanyDepartment {
  id: string
  name: string
  parentId?: string
  head?: string
}

export interface WorkspaceCompany {
  name: string
  abbr?: string
  domain?: string
  currency?: string
  country?: string
  departments: CompanyDepartment[]
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

export interface StoredWorkspace {
  id?: string
  name: string
  description: string
  password?: string | null
  hasPassword?: boolean
  sizeType?: string
  width?: number
  height?: number
  createdAt: number
  ownerId?: string
  ownerName?: string
  shareMode?: 'free' | 'ask'
  sharedUsers?: string[]
  pendingRequests?: PendingRequest[]
  company?: WorkspaceCompany
  users?: WorkspaceUser[]
  projects?: WorkspaceProject[]
  tasks?: WorkspaceTask[]
  documentTypes?: DocumentType[]
  documents?: WorkspaceDocument[]
}

const STORAGE_FILE = path.join(__dirname, 'workspaces.json')

export function getAllWorkspaces(): StoredWorkspace[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return []
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    return JSON.parse(data) || []
  } catch (err) {
    console.error('Error reading workspaces.json:', err)
    return []
  }
}

export function getWorkspaceById(id: string): StoredWorkspace | undefined {
  const list = getAllWorkspaces()
  return list.find((w) => w.id === id || w.name === id)
}

export function saveWorkspace(workspace: StoredWorkspace) {
  try {
    const list = getAllWorkspaces()
    const index = list.findIndex(
      (w) => (workspace.id && w.id === workspace.id) || w.name === workspace.name
    )
    if (index >= 0) {
      list[index] = { ...list[index], ...workspace }
    } else {
      list.push(workspace)
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving workspace to storage:', err)
  }
}

export function updateWorkspace(id: string, updates: Partial<StoredWorkspace>): StoredWorkspace | null {
  try {
    const list = getAllWorkspaces()
    const index = list.findIndex((w) => w.id === id || w.name === id)
    if (index >= 0) {
      list[index] = { ...list[index], ...updates }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
      return list[index]
    }
    return null
  } catch (err) {
    console.error('Error updating workspace:', err)
    return null
  }
}

export function removeWorkspace(id: string) {
  try {
    const list = getAllWorkspaces().filter((w) => w.id !== id && w.name !== id)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error removing workspace from storage:', err)
  }
}
