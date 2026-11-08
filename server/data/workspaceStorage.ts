import fs from 'fs'
import path from 'path'

export interface StoredWorkspace {
  id?: string
  name: string
  description: string
  password?: string | null
  hasPassword?: boolean
  createdAt: number
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

export function removeWorkspace(id: string) {
  try {
    const list = getAllWorkspaces().filter((w) => w.id !== id)
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error removing workspace from storage:', err)
  }
}
