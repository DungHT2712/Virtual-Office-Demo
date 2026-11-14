import fs from 'fs'
import path from 'path'

export interface NotificationItem {
  id: string
  targetUserId: string
  type: 'join_request' | 'join_accepted' | 'join_denied' | 'system'
  workspaceId: string
  workspaceName: string
  requesterId?: string
  requesterName?: string
  message?: string
  status?: 'pending' | 'accepted' | 'denied' | 'read'
  createdAt: number
}

const STORAGE_FILE = path.join(__dirname, 'notifications.json')

export function getAllNotifications(): NotificationItem[] {
  try {
    if (!fs.existsSync(STORAGE_FILE)) {
      return []
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
    return JSON.parse(data) || []
  } catch (err) {
    console.error('Error reading notifications.json:', err)
    return []
  }
}

function saveAllNotifications(list: NotificationItem[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing notifications.json:', err)
  }
}

export function getNotificationsForUser(userId: string): NotificationItem[] {
  const all = getAllNotifications()
  return all
    .filter((n) => n.targetUserId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function addNotification(notification: NotificationItem) {
  const all = getAllNotifications()

  // 1. Tránh trùng lặp theo ID chính xác
  const idxById = all.findIndex((n) => n.id === notification.id)
  if (idxById >= 0) {
    all[idxById] = { ...all[idxById], ...notification }
    saveAllNotifications(all)
    return
  }

  // 2. Tránh trùng lặp yêu cầu gia nhập (join_request) cho cùng 1 requester và workspace
  if (notification.type === 'join_request') {
    const existingIndex = all.findIndex(
      (n) =>
        n.type === 'join_request' &&
        n.workspaceId === notification.workspaceId &&
        n.requesterId === notification.requesterId
    )
    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...notification,
        status: notification.status || all[existingIndex].status,
      }
      saveAllNotifications(all)
      return
    }
  }

  // 3. Tránh trùng lặp thông báo kết quả duyệt (join_accepted / join_denied) cho cùng người nhận và workspace
  if (notification.type === 'join_accepted' || notification.type === 'join_denied') {
    const existingIndex = all.findIndex(
      (n) =>
        n.type === notification.type &&
        n.workspaceId === notification.workspaceId &&
        n.targetUserId === notification.targetUserId
    )
    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...all[existingIndex],
        ...notification,
      }
      saveAllNotifications(all)
      return
    }
  }

  all.push(notification)
  saveAllNotifications(all)
}

export function removeNotificationsForWorkspace(workspaceId: string) {
  const all = getAllNotifications().filter((n) => n.workspaceId !== workspaceId)
  saveAllNotifications(all)
}

export function removeNotificationsForWorkspaceAndUser(
  workspaceId: string,
  workspaceName: string,
  userId: string
) {
  const all = getAllNotifications().filter((n) => {
    const isTargetWs =
      n.workspaceId === workspaceId ||
      n.workspaceName === workspaceName ||
      (workspaceName && n.workspaceId === workspaceName) ||
      (workspaceId && n.workspaceName === workspaceId)
    const isTargetUser = n.targetUserId === userId || n.requesterId === userId
    return !(isTargetWs && isTargetUser)
  })
  saveAllNotifications(all)
}

export function updateNotification(id: string, updates: Partial<NotificationItem>) {
  const all = getAllNotifications()
  const idx = all.findIndex((n) => n.id === id)
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates }
    saveAllNotifications(all)
  }
}

export function removeNotification(id: string) {
  const all = getAllNotifications().filter((n) => n.id !== id)
  saveAllNotifications(all)
}

export function markAllNotificationsAsReadForUser(userId: string) {
  const all = getAllNotifications()
  all.forEach((n) => {
    if (n.targetUserId === userId && n.status === 'unread') {
      n.status = 'read'
    }
  })
  saveAllNotifications(all)
}

export function clearNotificationsForUser(userId: string) {
  const all = getAllNotifications().filter((n) => n.targetUserId !== userId)
  saveAllNotifications(all)
}
