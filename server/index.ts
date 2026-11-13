import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server, LobbyRoom, matchMaker } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'
import {
  getAllWorkspaces,
  getWorkspaceById,
  saveWorkspace,
  updateWorkspace,
  removeWorkspace,
} from './data/workspaceStorage'
import {
  getNotificationsForUser,
  addNotification,
  updateNotification,
  removeNotification,
  markAllNotificationsAsReadForUser,
  clearNotificationsForUser,
  removeNotificationsForWorkspace,
} from './data/notificationStorage'

import { SkyOffice } from './rooms/SkyOffice'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())

// Helper to sanitize workspace data for API responses (hide password hash)
function sanitizeWorkspace(ws: any) {
  const { password, ...safe } = ws
  return {
    ...safe,
    hasPassword: !!password || !!ws.hasPassword,
  }
}

// Helper to find active Colyseus room
function findActiveRoom(id: string) {
  let room = matchMaker.getRoomById(id) as any
  if (!room) {
    const allRooms = (matchMaker as any).rooms || {}
    for (const rId in allRooms) {
      const r = allRooms[rId]
      if (r && (r.roomId === id || r.name === id || (r.metadata && r.metadata.name === id))) {
        room = r
        break
      }
    }
  }
  return room
}

// 1. GET /api/workspaces: Lấy danh sách workspace đã lưu
app.get('/api/workspaces', (req, res) => {
  const list = getAllWorkspaces().map(sanitizeWorkspace)
  res.json({ success: true, workspaces: list })
})

// 2. GET /api/workspaces/:id: Tìm workspace theo ID
app.get('/api/workspaces/:id', (req, res) => {
  const { id } = req.params
  let ws = getWorkspaceById(id)
  if (!ws) {
    const active = findActiveRoom(id)
    if (active && active.metadata) {
      ws = {
        id: active.roomId,
        name: active.metadata.name,
        description: active.metadata.description,
        hasPassword: active.metadata.hasPassword,
        sizeType: active.metadata.sizeType,
        width: active.metadata.width,
        height: active.metadata.height,
        ownerId: active.metadata.ownerId,
        ownerName: active.metadata.ownerName,
        shareMode: active.metadata.shareMode || 'free',
        sharedUsers: active.metadata.sharedUsers || [],
        createdAt: Date.now(),
      }
    }
  }

  if (!ws) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }
  res.json({ success: true, workspace: sanitizeWorkspace(ws) })
})

// 3. POST /api/workspaces/:id/share-mode: Cập nhật chế độ chia sẻ (Free / Ask To Join)
app.post('/api/workspaces/:id/share-mode', (req, res) => {
  const { id } = req.params
  const { shareMode, ownerId, ownerName } = req.body
  if (!shareMode || (shareMode !== 'free' && shareMode !== 'ask')) {
    return res.status(400).json({ success: false, message: 'Chế độ shareMode không hợp lệ (free hoặc ask)' })
  }

  const ws = getWorkspaceById(id)
  const updates: any = { shareMode }
  if (ownerId && (!ws?.ownerId || ws.ownerId === ownerId)) {
    updates.ownerId = ownerId
    if (ownerName) updates.ownerName = ownerName
  }

  const updated = updateWorkspace(id, updates)
  const active = findActiveRoom(id)
  if (active && typeof active.setMetadata === 'function') {
    active.setMetadata({ ...active.metadata, ...updates })
  }

  res.json({ success: true, shareMode, workspace: updated ? sanitizeWorkspace(updated) : null })
})

// POST /api/workspaces/:id/claim: Đồng bộ quyền chủ sở hữu từ client
app.post('/api/workspaces/:id/claim', (req, res) => {
  const { id } = req.params
  const { ownerId, ownerName } = req.body
  if (!ownerId) {
    return res.status(400).json({ success: false, message: 'Thiếu ownerId' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  if (!ws && !active) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }

  const targetId = ws?.id || active?.roomId || id
  const currentOwner = ws?.ownerId || active?.metadata?.ownerId

  if (!currentOwner || currentOwner === ownerId) {
    const updates: any = { ownerId }
    if (ownerName) updates.ownerName = ownerName
    const updated = updateWorkspace(targetId, updates)
    if (active && typeof active.setMetadata === 'function') {
      active.setMetadata({ ...active.metadata, ...updates })
    }

    return res.json({ success: true, workspace: updated ? sanitizeWorkspace(updated) : null })
  }

  res.json({ success: false, message: 'Workspace đã có chủ sở hữu khác' })
})

// 4. POST /api/workspaces/:id/request-join: Yêu cầu gia nhập workspace
app.post('/api/workspaces/:id/request-join', (req, res) => {
  const { id } = req.params
  const { userId, userName } = req.body
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId là bắt buộc' })
  }

  let ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  if (!ws && active && active.metadata) {
    ws = {
      id: active.roomId,
      name: active.metadata.name,
      description: active.metadata.description,
      hasPassword: active.metadata.hasPassword,
      ownerId: active.metadata.ownerId,
      ownerName: active.metadata.ownerName,
      shareMode: active.metadata.shareMode || 'free',
      sharedUsers: active.metadata.sharedUsers || [],
      createdAt: Date.now(),
    }
  }

  if (!ws) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy workspace' })
  }

  const shareMode = ws.shareMode || 'free'
  const sharedUsers = Array.isArray(ws.sharedUsers) ? [...ws.sharedUsers] : []

  // Nếu là Free: tự do gia nhập, thêm ngay vào sharedUsers
  if (shareMode === 'free') {
    if (!sharedUsers.includes(userId)) {
      sharedUsers.push(userId)
      updateWorkspace(id, { sharedUsers })
      if (active && typeof active.setMetadata === 'function') {
        active.setMetadata({ ...active.metadata, sharedUsers })
      }
    }
    return res.json({
      success: true,
      status: 'joined',
      shareMode: 'free',
      message: 'Đã thêm workspace vào danh sách!',
    })
  }

  // Nếu là Ask To Join:
  // Nếu đã được duyệt trước đó
  if (sharedUsers.includes(userId)) {
    return res.json({
      success: true,
      status: 'joined',
      shareMode: 'ask',
      message: 'Bạn đã được duyệt tham gia workspace này!',
    })
  }

  // Thêm vào pendingRequests
  const pendingRequests = Array.isArray(ws.pendingRequests) ? [...ws.pendingRequests] : []
  const existingReqIdx = pendingRequests.findIndex((r) => r.userId === userId)
  if (existingReqIdx >= 0) {
    pendingRequests[existingReqIdx].requestedAt = Date.now()
    pendingRequests[existingReqIdx].userName = userName || userId
  } else {
    pendingRequests.push({
      userId,
      userName: userName || userId,
      requestedAt: Date.now(),
    })
  }
  updateWorkspace(id, { pendingRequests })

  // Tạo thông báo cho chủ sở hữu workspace
  const targetOwnerId = ws.ownerId || active?.metadata?.ownerId
  if (targetOwnerId) {
    addNotification({
      id: `req_${ws.id || id}_${userId}`,
      targetUserId: targetOwnerId,
      type: 'join_request',
      workspaceId: ws.id || id,
      workspaceName: ws.name,
      requesterId: userId,
      requesterName: userName || userId,
      status: 'pending',
      createdAt: Date.now(),
    })
  } else {
    console.warn(`[request-join] Workspace "${ws.name}" (${id}) has no ownerId yet. Request saved to pendingRequests.`)
  }

  return res.json({
    success: true,
    status: 'pending',
    shareMode: 'ask',
    message: 'Yêu cầu gia nhập đã được gửi tới chủ workspace!',
  })
})

// 5. POST /api/workspaces/:id/respond-request: Chủ workspace Accept hoặc Deny
app.post('/api/workspaces/:id/respond-request', (req, res) => {
  const { id } = req.params
  const { ownerId, requesterId, action, notificationId } = req.body

  if (!requesterId || !action || (action !== 'accept' && action !== 'deny')) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)

  if (!ws && !active) {
    if (notificationId) {
      updateNotification(notificationId, { status: action === 'accept' ? 'accepted' : 'denied' })
    }
    return res.json({ success: true, message: 'Workspace đã đóng hoặc không tồn tại' })
  }

  const targetWsId = (ws && ws.id) || (active && active.roomId) || id
  const targetWsName = (ws && ws.name) || (active && active.metadata && active.metadata.name) || targetWsId

  let sharedUsers = ws?.sharedUsers ? [...ws.sharedUsers] : (active?.metadata?.sharedUsers ? [...active.metadata.sharedUsers] : [])
  let pendingRequests = ws?.pendingRequests ? [...ws.pendingRequests] : []
  pendingRequests = pendingRequests.filter((r) => r.userId !== requesterId)

  if (action === 'accept') {
    if (!sharedUsers.includes(requesterId)) {
      sharedUsers.push(requesterId)
    }
    updateWorkspace(targetWsId, { sharedUsers, pendingRequests })
    if (active && typeof active.setMetadata === 'function') {
      active.setMetadata({ ...active.metadata, sharedUsers, pendingRequests })
    }

    // Gửi thông báo chấp nhận cho requester
    addNotification({
      id: `acc_${targetWsId}_${requesterId}`,
      targetUserId: requesterId,
      type: 'join_accepted',
      workspaceId: targetWsId,
      workspaceName: targetWsName,
      message: `Yêu cầu gia nhập của bạn vào workspace [${targetWsName}] đã được chấp nhận!`,
      status: 'unread',
      createdAt: Date.now(),
    })

    if (notificationId) {
      updateNotification(notificationId, { status: 'accepted' })
    }

    return res.json({ success: true, action: 'accept', message: 'Đã chấp nhận yêu cầu gia nhập' })
  } else {
    // action === 'deny'
    sharedUsers = sharedUsers.filter((u) => u !== requesterId)
    updateWorkspace(targetWsId, { sharedUsers, pendingRequests })
    if (active && typeof active.setMetadata === 'function') {
      active.setMetadata({ ...active.metadata, sharedUsers, pendingRequests })
    }

    // Gửi thông báo từ chối cho requester đúng theo yêu cầu prompt:
    addNotification({
      id: `den_${targetWsId}_${requesterId}`,
      targetUserId: requesterId,
      type: 'join_denied',
      workspaceId: targetWsId,
      workspaceName: targetWsName,
      message: `Yêu cầu gia nhập của bạn vào workspace [${targetWsId}] bị từ chối`,
      status: 'unread',
      createdAt: Date.now(),
    })

    if (notificationId) {
      updateNotification(notificationId, { status: 'denied' })
    }

    return res.json({ success: true, action: 'deny', message: 'Đã từ chối yêu cầu gia nhập' })
  }
})

// 6. GET /api/notifications: Lấy danh sách thông báo theo userId (chỉ đọc, không ghi side-effects)
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId as string
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId' })
  }
  const notifs = getNotificationsForUser(userId)
  res.json({ success: true, notifications: notifs })
})

// 7. POST /api/notifications/:id/mark-read
app.post('/api/notifications/:id/mark-read', (req, res) => {
  const { id } = req.params
  updateNotification(id, { status: 'read' })
  res.json({ success: true })
})

// POST /api/notifications/mark-all-read
app.post('/api/notifications/mark-all-read', (req, res) => {
  const { userId } = req.body
  if (userId) {
    markAllNotificationsAsReadForUser(userId)
  }
  res.json({ success: true })
})

// 8. DELETE /api/notifications/:id
app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params
  removeNotification(id)
  res.json({ success: true })
})

// 9. POST /api/notifications/clear
app.post('/api/notifications/clear', (req, res) => {
  const { userId } = req.body
  if (userId) {
    clearNotificationsForUser(userId)
  }
  res.json({ success: true })
})

// API xóa Workspace lưu trữ
const deleteWorkspaceHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params
  const name = (req.query.name as string) || (req.body && req.body.name)
  removeWorkspace(id)
  if (name) removeWorkspace(name)
  removeNotificationsForWorkspace(id)
  if (name) removeNotificationsForWorkspace(name)

  try {
    let room = findActiveRoom(id)
    if (!room && name) {
      room = findActiveRoom(name)
    }
    if (room) {
      if (typeof room.deleteRoom === 'function') {
        await room.deleteRoom()
      } else {
        room.autoDispose = true
        await room.disconnect()
      }
    } else {
      await matchMaker.remoteRoomCall(id, 'deleteRoom').catch(async () => {
        await matchMaker.remoteRoomCall(id, 'disconnect')
      })
    }
  } catch (err) {
    console.error('Error deleting workspace room:', err)
  }
  res.json({ success: true, message: 'Workspace deleted' })
}

app.delete('/api/workspaces/:id', deleteWorkspaceHandler)
app.post('/api/workspaces/:id/delete', deleteWorkspaceHandler)

const server = http.createServer(app)
const gameServer = new Server({
  server,
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, SkyOffice, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, SkyOffice).enableRealtimeListing()

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)

// Tái tạo các Workspace đã lưu trữ trong Manage Workspace
const savedWorkspaces = getAllWorkspaces()
if (savedWorkspaces.length > 0) {
  console.log(`Found ${savedWorkspaces.length} saved workspaces. Restoring...`)
  savedWorkspaces.forEach(async (ws) => {
    try {
      await matchMaker.createRoom(RoomType.CUSTOM, {
        name: ws.name,
        description: ws.description,
        password: ws.password,
        sizeType: ws.sizeType,
        width: ws.width,
        height: ws.height,
        ownerId: ws.ownerId,
        ownerName: ws.ownerName,
        shareMode: ws.shareMode || 'free',
        sharedUsers: ws.sharedUsers || [],
        autoDispose: false,
      })
      console.log(`Restored persistent workspace: ${ws.name}`)
    } catch (e) {
      console.error(`Failed to restore workspace ${ws.name}:`, e)
    }
  })
}
