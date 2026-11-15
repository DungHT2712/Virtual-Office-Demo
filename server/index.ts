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
  StoredWorkspace,
} from './data/workspaceStorage'
import {
  getAllCompanies,
  getCompanyById,
  saveCompany,
  removeCompany,
} from './data/companyStorage'
import {
  getNotificationsForUser,
  addNotification,
  updateNotification,
  removeNotification,
  markAllNotificationsAsReadForUser,
  clearNotificationsForUser,
  removeNotificationsForWorkspace,
  removeNotificationsForWorkspaceAndUser,
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

// Tự động phục hồi phòng Colyseus khi client gọi joinById nếu phòng đã lưu nhưng chưa chạy
app.post('/matchmake/joinById/:roomId', async (req, res, next) => {
  const { roomId } = req.params
  const active = findActiveRoom(roomId)
  if (!active) {
    const ws = getWorkspaceById(roomId)
    if (ws) {
      console.log(`On-demand restoring workspace room for roomId=${roomId} (${ws.name})`)
      try {
        await matchMaker.createRoom(RoomType.CUSTOM, {
          id: ws.id,
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
          companyId: ws.companyId,
          companyName: ws.companyName,
          departmentId: ws.departmentId,
          departmentName: ws.departmentName,
          requireLogin: ws.requireLogin,
          company: ws.company,
          users: ws.users,
          autoDispose: false,
        })
      } catch (err) {
        console.error('Failed to restore room on-demand:', err)
      }
    }
  }
  next()
})

// 0. API QUẢN LÝ NHIỀU CÔNG TY (COMPANIES)
app.get('/api/companies', (req, res) => {
  const companies = getAllCompanies()
  res.json({ success: true, companies })
})

app.post('/api/companies', (req, res) => {
  try {
    const { id, name, abbr, domain, currency, country, departments } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên công ty là bắt buộc' })
    }
    const saved = saveCompany({
      id: id || 'comp_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      abbr: abbr?.trim() || '',
      domain: domain?.trim() || '',
      currency: currency?.trim() || 'VND',
      country: country?.trim() || 'Việt Nam',
      departments: Array.isArray(departments) ? departments : [],
      createdAt: Date.now(),
    })
    res.json({ success: true, company: saved })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Lỗi lưu công ty' })
  }
})

app.delete('/api/companies/:id', (req, res) => {
  const { id } = req.params
  const ok = removeCompany(id)
  res.json({ success: ok })
})

// 1. GET /api/workspaces: Lấy danh sách workspace đã lưu
app.get('/api/workspaces', (req, res) => {
  const list = getAllWorkspaces().map(sanitizeWorkspace)
  res.json({ success: true, workspaces: list })
})

// POST /api/workspaces: Tạo workspace mới trực tiếp từ Core hoặc API
app.post('/api/workspaces', async (req, res) => {
  try {
    const {
      name,
      description,
      password,
      sizeType,
      width,
      height,
      ownerId,
      ownerName,
      shareMode,
      companyId,
      companyName,
      departmentId,
      departmentName,
      requireLogin,
      company,
      users,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên Workspace là bắt buộc' })
    }

    const cleanPassword = password && String(password).trim() ? String(password).trim() : null
    const hasPassword = !!cleanPassword

    const defaultCompany = company || {
      id: companyId || 'comp_voc',
      name: companyName || 'Virtual Office Co.',
      abbr: (companyName || 'VOC').substring(0, 4).toUpperCase(),
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
    }

    const defaultUsers =
      Array.isArray(users) && users.length > 0
        ? users
        : ownerName
        ? [
            {
              id: ownerId || 'usr_owner',
              name: ownerName,
              username: ownerName.toLowerCase().replace(/\s+/g, ''),
              password: '',
              email: `${ownerName.toLowerCase().replace(/\s+/g, '')}@office.local`,
              role: 'Workspace Owner',
              departmentId: departmentId || 'dept_bod',
              status: 'active' as const,
            },
          ]
        : []

    // Tạo phòng Colyseus thực tế trên Game Server
    const roomListing = await matchMaker.createRoom(RoomType.CUSTOM, {
      name: name.trim(),
      description: description || '',
      password: cleanPassword,
      sizeType: sizeType || 'MEDIUM',
      width: width || 50,
      height: height || 50,
      ownerId: ownerId || '',
      ownerName: ownerName || '',
      shareMode: shareMode || 'free',
      sharedUsers: ownerId ? [ownerId] : [],
      companyId: companyId || defaultCompany.id || 'comp_voc',
      companyName: companyName || defaultCompany.name,
      departmentId: departmentId || '',
      departmentName: departmentName || '',
      requireLogin: !!requireLogin,
      company: defaultCompany,
      users: defaultUsers,
      autoDispose: false,
    })

    const id = roomListing.roomId

    const newWs: StoredWorkspace = {
      id,
      name: name.trim(),
      description: description || '',
      password: cleanPassword,
      hasPassword,
      sizeType: sizeType || 'MEDIUM',
      width: width || 50,
      height: height || 50,
      ownerId: ownerId || '',
      ownerName: ownerName || '',
      shareMode: shareMode || 'free',
      sharedUsers: ownerId ? [ownerId] : [],
      companyId: companyId || defaultCompany.id || 'comp_voc',
      companyName: companyName || defaultCompany.name,
      departmentId: departmentId || '',
      departmentName: departmentName || '',
      requireLogin: !!requireLogin,
      company: defaultCompany,
      users: defaultUsers,
      createdAt: Date.now(),
      pendingRequests: [],
    }

    saveWorkspace(newWs)
    res.json({ success: true, workspace: sanitizeWorkspace(newWs) })
  } catch (err: any) {
    console.error('Error creating workspace:', err)
    res.status(500).json({ success: false, message: err.message || 'Lỗi tạo workspace' })
  }
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
        companyId: active.metadata.companyId || '',
        companyName: active.metadata.companyName || '',
        departmentId: active.metadata.departmentId || '',
        departmentName: active.metadata.departmentName || '',
        requireLogin: !!active.metadata.requireLogin,
        createdAt: Date.now(),
      }
    }
  }

  if (!ws) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }
  res.json({ success: true, workspace: sanitizeWorkspace(ws) })
})

// POST /api/workspaces/:id/workspace-config: Cập nhật công ty, phòng ban, yêu cầu đăng nhập
app.post('/api/workspaces/:id/workspace-config', (req, res) => {
  const { id } = req.params
  const { companyId, companyName, departmentId, departmentName, requireLogin } = req.body

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updates: any = {}
  if (companyId !== undefined) updates.companyId = companyId
  if (companyName !== undefined) updates.companyName = companyName
  if (departmentId !== undefined) updates.departmentId = departmentId
  if (departmentName !== undefined) updates.departmentName = departmentName
  if (requireLogin !== undefined) updates.requireLogin = !!requireLogin

  const updated = updateWorkspace(targetId, updates)
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, updates)
  }

  if (active && typeof active.setMetadata === 'function') {
    active.setMetadata({ ...active.metadata, ...updates })
  }

  res.json({ success: true, workspace: updated ? sanitizeWorkspace(updated) : null })
})

// POST /api/workspaces/:id/auth-user: Xác thực tài khoản & mật khẩu thành viên khi vào workspace
app.post('/api/workspaces/:id/auth-user', (req, res) => {
  const { id } = req.params
  const { username, password, userId } = req.body

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const currentOwner = ws?.ownerId || active?.metadata?.ownerId

  // Nếu là chủ workspace: Không cần đăng nhập, ra vào tự do
  if (userId && currentOwner && currentOwner === userId) {
    return res.json({ success: true, verified: true, isOwner: true, message: 'Chủ sở hữu được phép ra vào tự do' })
  }

  const isRequireLogin = ws?.requireLogin ?? active?.metadata?.requireLogin ?? false
  // Nếu workspace không yêu cầu đăng nhập: Ra vào tự do
  if (!isRequireLogin) {
    return res.json({ success: true, verified: true, isOwner: false, message: 'Workspace không yêu cầu đăng nhập' })
  }

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên tài khoản (Username)!' })
  }

  const targetUsers = ws?.users || []
  const cleanUsername = username.trim().toLowerCase()
  const cleanPassword = String(password || '').trim()

  const foundUser = targetUsers.find(
    (u) => u.username && u.username.trim().toLowerCase() === cleanUsername
  )

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      message: 'Tài khoản không tồn tại trong danh sách User của Workspace này!',
    })
  }

  if (foundUser.status === 'disabled') {
    return res.status(403).json({
      success: false,
      message: 'Tài khoản này đã bị khóa (disabled). Vui lòng liên hệ quản trị viên!',
    })
  }

  if (foundUser.password && foundUser.password.trim() !== cleanPassword) {
    return res.status(401).json({
      success: false,
      message: 'Mật khẩu tài khoản không chính xác!',
    })
  }

  return res.json({
    success: true,
    verified: true,
    user: {
      id: foundUser.id,
      name: foundUser.name,
      username: foundUser.username,
      role: foundUser.role,
      departmentId: foundUser.departmentId,
    },
  })
})

// 3. POST /api/workspaces/:id/share-mode: Cập nhật chế độ chia sẻ (Free / Ask To Join)
app.post('/api/workspaces/:id/share-mode', (req, res) => {
  const { id } = req.params
  const { shareMode, ownerId, ownerName } = req.body
  if (!shareMode || (shareMode !== 'free' && shareMode !== 'ask')) {
    return res.status(400).json({ success: false, message: 'Chế độ shareMode không hợp lệ (free hoặc ask)' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const currentOwner = ws?.ownerId || active?.metadata?.ownerId

  // Chỉ có chủ workspace mới được cập nhật share mode
  if (currentOwner && ownerId && currentOwner !== ownerId) {
    return res.status(403).json({
      success: false,
      message: 'Chỉ có chủ workspace mới có quyền cập nhật chế độ chia sẻ (share mode)!',
    })
  }

  const updates: any = { shareMode }
  if (ownerId && (!currentOwner || currentOwner === ownerId)) {
    updates.ownerId = ownerId
    if (ownerName) updates.ownerName = ownerName
  }

  const targetId = ws?.id || active?.roomId || id
  const updated = updateWorkspace(targetId, updates)
  if (active && typeof active.setMetadata === 'function') {
    active.setMetadata({ ...active.metadata, ...updates })
  }

  res.json({ success: true, shareMode, workspace: updated ? sanitizeWorkspace(updated) : null })
})

// POST /api/workspaces/:id/leave: Người được share xóa workspace khỏi danh sách của mình (không xóa workspace gốc)
app.post('/api/workspaces/:id/leave', (req, res) => {
  const { id } = req.params
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Thiếu userId' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id
  const targetName = ws?.name || active?.metadata?.name || id

  let sharedUsers = ws?.sharedUsers
    ? [...ws.sharedUsers]
    : active?.metadata?.sharedUsers
    ? [...active.metadata.sharedUsers]
    : []
  let pendingRequests = ws?.pendingRequests
    ? [...ws.pendingRequests]
    : active?.metadata?.pendingRequests
    ? [...active.metadata.pendingRequests]
    : []

  sharedUsers = sharedUsers.filter((u) => u !== userId)
  pendingRequests = pendingRequests.filter((r) => r.userId !== userId)

  const updates = { sharedUsers, pendingRequests }
  updateWorkspace(targetId, updates)
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, updates)
  }
  if (active && typeof active.setMetadata === 'function') {
    active.setMetadata({ ...active.metadata, ...updates })
  }

  // Dọn dẹp mọi thông báo gia nhập liên quan giữa user này và workspace này
  removeNotificationsForWorkspaceAndUser(targetId, targetName, userId)

  res.json({ success: true, message: 'Đã xóa workspace khỏi danh sách của bạn' })
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

// API Quản lý Core Module: Company & Users (Theo chuẩn Frappe)
// GET /api/workspaces/:id/core
app.get('/api/workspaces/:id/core', (req, res) => {
  const { id } = req.params
  const ws = getWorkspaceById(id)
  if (!ws) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }

  const defaultCompany = {
    name: ws.name || 'My Company',
    abbr: (ws.name || 'MC').substring(0, 4).toUpperCase(),
    domain: '',
    currency: 'VND',
    country: 'Việt Nam',
    departments: [
      { id: 'dept_bod', name: 'Ban Giám Đốc', head: 'CEO' },
      { id: 'dept_tech', name: 'Kỹ Thuật & Công Nghệ', head: '' },
      { id: 'dept_sales', name: 'Kinh Doanh & Marketing', head: '' },
      { id: 'dept_hr', name: 'Nhân Sự & Hành Chính', head: '' },
      { id: 'dept_fin', name: 'Tài Chính & Kế Toán', head: '' },
    ],
  }

  const defaultUsers = ws.ownerName ? [
    {
      id: ws.ownerId || 'usr_owner',
      name: ws.ownerName,
      username: ws.ownerName.toLowerCase().replace(/\s+/g, ''),
      password: '',
      email: `${ws.ownerName.toLowerCase().replace(/\s+/g, '')}@office.local`,
      role: 'Workspace Owner',
      departmentId: 'dept_bod',
      status: 'active',
    }
  ] : []

  res.json({
    success: true,
    company: ws.company || defaultCompany,
    users: ws.users || defaultUsers,
  })
})

// POST /api/workspaces/:id/company
app.post('/api/workspaces/:id/company', (req, res) => {
  const { id } = req.params
  const { company } = req.body
  if (!company) {
    return res.status(400).json({ success: false, message: 'Thiếu dữ liệu company' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { company })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { company })
  }

  res.json({ success: true, company: updated?.company || company })
})

// POST /api/workspaces/:id/users
app.post('/api/workspaces/:id/users', (req, res) => {
  const { id } = req.params
  const { users } = req.body
  if (!Array.isArray(users)) {
    return res.status(400).json({ success: false, message: 'Danh sách users phải là một mảng' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { users })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { users })
  }

  res.json({ success: true, users: updated?.users || users })
})

// DELETE /api/workspaces/:id/users/:userId
app.delete('/api/workspaces/:id/users/:userId', (req, res) => {
  const { id, userId } = req.params
  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  if (ws && ws.users) {
    const newUsers = ws.users.filter((u) => u.id !== userId)
    updateWorkspace(targetId, { users: newUsers })
    if (ws.name && ws.name !== targetId) {
      updateWorkspace(ws.name, { users: newUsers })
    }
  }

  res.json({ success: true, message: 'Đã xóa người dùng' })
})

// API Quản lý Module Projects & Tasks (Chuẩn Frappe ERP)
// GET /api/workspaces/:id/projects-data
app.get('/api/workspaces/:id/projects-data', (req, res) => {
  const { id } = req.params
  const ws = getWorkspaceById(id)
  if (!ws) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }

  const defaultProjects = [
    {
      id: 'proj_default_1',
      name: 'Triển khai Văn phòng ảo SkyOffice',
      code: 'PROJ-001',
      status: 'Open' as const,
      priority: 'High' as const,
      departmentId: 'dept_tech',
      managerName: ws.ownerName || 'Admin',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      progress: 65,
      description: 'Dự án xây dựng và phát triển hệ sinh thái văn phòng tương tác',
    },
    {
      id: 'proj_default_2',
      name: 'Chiến dịch Ra mắt Sản phẩm Q4',
      code: 'PROJ-002',
      status: 'Open' as const,
      priority: 'Medium' as const,
      departmentId: 'dept_sales',
      managerName: ws.ownerName || 'Admin',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      progress: 25,
      description: 'Chiến dịch marketing và tiếp cận đối tác chiến lược',
    },
  ]

  const defaultTasks = [
    {
      id: 'task_default_1',
      title: 'Tối ưu hóa bản đồ và thiết kế không gian làm việc',
      projectId: 'proj_default_1',
      projectName: 'Triển khai Văn phòng ảo SkyOffice',
      assigneeName: ws.ownerName || 'Admin',
      status: 'Working' as const,
      priority: 'High' as const,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      progress: 70,
      description: 'Thiết kế các khu vực phòng họp, bàn làm việc và tiện ích',
    },
    {
      id: 'task_default_2',
      title: 'Tích hợp hệ thống quản trị Core & Projects Frappe',
      projectId: 'proj_default_1',
      projectName: 'Triển khai Văn phòng ảo SkyOffice',
      assigneeName: ws.ownerName || 'Admin',
      status: 'Completed' as const,
      priority: 'Urgent' as const,
      dueDate: new Date().toISOString().split('T')[0],
      progress: 100,
      description: 'Hoàn thiện giao diện và API đồng bộ dữ liệu dự án',
    },
    {
      id: 'task_default_3',
      title: 'Soạn thảo tài liệu hướng dẫn và onboarding nhân sự mới',
      projectId: 'proj_default_2',
      projectName: 'Chiến dịch Ra mắt Sản phẩm Q4',
      assigneeName: ws.ownerName || 'Admin',
      status: 'Open' as const,
      priority: 'Medium' as const,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      progress: 0,
      description: 'Chuẩn bị tài liệu hướng dẫn tham gia văn phòng ảo',
    },
  ]

  res.json({
    success: true,
    projects: ws.projects && ws.projects.length > 0 ? ws.projects : defaultProjects,
    tasks: ws.tasks && ws.tasks.length > 0 ? ws.tasks : defaultTasks,
  })
})

// POST /api/workspaces/:id/projects
app.post('/api/workspaces/:id/projects', (req, res) => {
  const { id } = req.params
  const { projects } = req.body
  if (!Array.isArray(projects)) {
    return res.status(400).json({ success: false, message: 'Danh sách projects phải là mảng' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { projects })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { projects })
  }

  res.json({ success: true, projects: updated?.projects || projects })
})

// POST /api/workspaces/:id/tasks
app.post('/api/workspaces/:id/tasks', (req, res) => {
  const { id } = req.params
  const { tasks } = req.body
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ success: false, message: 'Danh sách tasks phải là mảng' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { tasks })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { tasks })
  }

  res.json({ success: true, tasks: updated?.tasks || tasks })
})

// DELETE /api/workspaces/:id/projects/:projectId
app.delete('/api/workspaces/:id/projects/:projectId', (req, res) => {
  const { id, projectId } = req.params
  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  if (ws && ws.projects) {
    const newProjects = ws.projects.filter((p) => p.id !== projectId)
    const newTasks = ws.tasks ? ws.tasks.filter((t) => t.projectId !== projectId) : []
    updateWorkspace(targetId, { projects: newProjects, tasks: newTasks })
    if (ws.name && ws.name !== targetId) {
      updateWorkspace(ws.name, { projects: newProjects, tasks: newTasks })
    }
  }

  res.json({ success: true, message: 'Đã xóa dự án' })
})

// DELETE /api/workspaces/:id/tasks/:taskId
app.delete('/api/workspaces/:id/tasks/:taskId', (req, res) => {
  const { id, taskId } = req.params
  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  if (ws && ws.tasks) {
    const newTasks = ws.tasks.filter((t) => t.id !== taskId)
    updateWorkspace(targetId, { tasks: newTasks })
    if (ws.name && ws.name !== targetId) {
      updateWorkspace(ws.name, { tasks: newTasks })
    }
  }

  res.json({ success: true, message: 'Đã xóa công việc' })
})

// API Quản lý Module Documents (Chuẩn Frappe Document Management)
// GET /api/workspaces/:id/documents-data
app.get('/api/workspaces/:id/documents-data', (req, res) => {
  const { id } = req.params
  const ws = getWorkspaceById(id)
  if (!ws) {
    return res.status(404).json({ success: false, message: 'Workspace không tồn tại' })
  }

  const defaultTypes = [
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

  const defaultDocuments = [
    {
      id: 'doc_default_1',
      title: 'Kiến trúc Hạ tầng Không gian Ảo 2.0',
      typeId: 'doctype_spec',
      typeName: 'Tài liệu Kỹ thuật & Thiết kế',
      projectId: 'proj_default_1',
      projectName: 'Triển khai Văn phòng ảo SkyOffice',
      uploadedBy: ws.ownerName || 'Admin',
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
      uploadedBy: ws.ownerName || 'Admin',
      uploadedAt: Date.now() - 3600000 * 8,
      fileName: 'Marketing_Budget_Q4.xlsx',
      fileSize: 840000,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Bảng tính chi tiết dự toán chi phí quảng bá đa kênh',
    },
  ]

  res.json({
    success: true,
    documentTypes: ws.documentTypes && ws.documentTypes.length > 0 ? ws.documentTypes : defaultTypes,
    documents: ws.documents && ws.documents.length > 0 ? ws.documents : defaultDocuments,
  })
})

// POST /api/workspaces/:id/document-types
app.post('/api/workspaces/:id/document-types', (req, res) => {
  const { id } = req.params
  const { documentTypes } = req.body
  if (!Array.isArray(documentTypes)) {
    return res.status(400).json({ success: false, message: 'documentTypes phải là mảng' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { documentTypes })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { documentTypes })
  }

  res.json({ success: true, documentTypes: updated?.documentTypes || documentTypes })
})

// POST /api/workspaces/:id/documents
app.post('/api/workspaces/:id/documents', (req, res) => {
  const { id } = req.params
  const { documents } = req.body
  if (!Array.isArray(documents)) {
    return res.status(400).json({ success: false, message: 'documents phải là mảng' })
  }

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  const updated = updateWorkspace(targetId, { documents })
  if (ws?.name && ws.name !== targetId) {
    updateWorkspace(ws.name, { documents })
  }

  res.json({ success: true, documents: updated?.documents || documents })
})

// DELETE /api/workspaces/:id/document-types/:typeId
app.delete('/api/workspaces/:id/document-types/:typeId', (req, res) => {
  const { id, typeId } = req.params
  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  if (ws && ws.documentTypes) {
    const newTypes = ws.documentTypes.filter((t) => t.id !== typeId)
    updateWorkspace(targetId, { documentTypes: newTypes })
    if (ws.name && ws.name !== targetId) {
      updateWorkspace(ws.name, { documentTypes: newTypes })
    }
  }

  res.json({ success: true, message: 'Đã xóa loại tài liệu' })
})

// DELETE /api/workspaces/:id/documents/:docId
app.delete('/api/workspaces/:id/documents/:docId', (req, res) => {
  const { id, docId } = req.params
  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const targetId = ws?.id || active?.roomId || id

  if (ws && ws.documents) {
    const newDocs = ws.documents.filter((d) => d.id !== docId)
    updateWorkspace(targetId, { documents: newDocs })
    if (ws.name && ws.name !== targetId) {
      updateWorkspace(ws.name, { documents: newDocs })
    }
  }

  res.json({ success: true, message: 'Đã xóa tài liệu' })
})

// API xóa Workspace lưu trữ
const deleteWorkspaceHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params
  const name = (req.query.name as string) || (req.body && req.body.name)
  const requesterId =
    (req.query.requesterId as string) ||
    (req.body && req.body.requesterId) ||
    (req.body && req.body.ownerId)

  const ws = getWorkspaceById(id)
  const active = findActiveRoom(id)
  const currentOwner = ws?.ownerId || active?.metadata?.ownerId

  // Nếu workspace đã có chủ sở hữu và requesterId được cung cấp nhưng không khớp, từ chối xóa workspace gốc
  if (currentOwner && requesterId && currentOwner !== requesterId) {
    return res
      .status(403)
      .json({ success: false, message: 'Chỉ có chủ sở hữu mới có quyền xóa workspace này' })
  }

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
        id: ws.id,
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
        companyId: ws.companyId,
        companyName: ws.companyName,
        departmentId: ws.departmentId,
        departmentName: ws.departmentName,
        requireLogin: ws.requireLogin,
        company: ws.company,
        users: ws.users,
        autoDispose: false,
      })
      console.log(`Restored persistent workspace: ${ws.name} (id=${ws.id})`)
    } catch (e) {
      console.error(`Failed to restore workspace ${ws.name}:`, e)
    }
  })
}
