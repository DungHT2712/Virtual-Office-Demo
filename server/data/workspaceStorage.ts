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

export interface MeetingRoomConfig {
  roomId: string
  roomName: string
  maxUsers: number
}

export interface MeetingBooking {
  id: string
  roomId: string
  roomName: string
  createdAt: string
  createdAtTimestamp: number
  host: string
  hostId?: string
  reason: string
  date: string
  startTime: string
  endTime: string
  startTimestamp: number
  endTimestamp: number
  participants: string[]
}

export interface StoredRoomLayout {
  id: string
  roomType: string
  name: string
  gridX: number
  gridY: number
  width: number
  height: number
  doorX?: number
  doorY?: number
  floor?: number
}

export interface StoredFurnitureItem {
  id: string
  itemType: string
  gridX: number
  gridY: number
  orientation?: number
  itemDirection?: string
  tint?: number
  floor?: number
}

export interface StoredChatMessage {
  author: string
  content: string
  createdAt: number
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
  companyId?: string
  companyName?: string
  departmentId?: string
  departmentName?: string
  requireLogin?: boolean
  isParent?: boolean
  parentWorkspaceId?: string | null
  company?: WorkspaceCompany
  users?: WorkspaceUser[]
  projects?: WorkspaceProject[]
  tasks?: WorkspaceTask[]
  documentTypes?: DocumentType[]
  documents?: WorkspaceDocument[]
  rooms?: StoredRoomLayout[]
  furnitures?: StoredFurnitureItem[]
  floorsConfig?: string
  meetingRooms?: MeetingRoomConfig[]
  meetingBookings?: MeetingBooking[]
  chatHistory?: StoredChatMessage[]
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
  return list.find((w) => w.id === id || (!w.id && w.name === id))
}

export function saveWorkspace(workspace: StoredWorkspace) {
  try {
    const list = getAllWorkspaces()
    const index = list.findIndex(
      (w) => (workspace.id ? w.id === workspace.id : w.name === workspace.name)
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
    const index = list.findIndex((w) => w.id === id || (!w.id && w.name === id))
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

export function appendChatMessage(workspaceId: string, message: StoredChatMessage) {
  try {
    const list = getAllWorkspaces()
    const index = list.findIndex((w) => w.id === workspaceId || w.name === workspaceId)
    if (index >= 0) {
      if (!Array.isArray(list[index].chatHistory)) {
        list[index].chatHistory = []
      }
      list[index].chatHistory!.push(message)
      if (list[index].chatHistory!.length > 100) {
        list[index].chatHistory!.shift()
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
    }
  } catch (err) {
    console.error('Error appending chat message:', err)
  }
}
