import fs from 'fs'
import path from 'path'

export interface PendingRequest {
  userId: string
  userName: string
  requestedAt: number
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
