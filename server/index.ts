import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server, LobbyRoom, matchMaker } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'
import { getAllWorkspaces, removeWorkspace } from './data/workspaceStorage'

// import socialRoutes from "@colyseus/social/express"

import { SkyOffice } from './rooms/SkyOffice'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())
// app.use(express.static('dist'))

// API xóa Workspace lưu trữ
const deleteWorkspaceHandler = async (req: express.Request, res: express.Response) => {
  const { id } = req.params
  const name = (req.query.name as string) || (req.body && req.body.name)
  removeWorkspace(id)
  if (name) removeWorkspace(name)

  try {
    let room = matchMaker.getRoomById(id) as any
    if (!room && name) {
      const allRooms = (matchMaker as any).rooms || {}
      for (const rId in allRooms) {
        const r = allRooms[rId]
        if (r && (r.name === name || (r.metadata && r.metadata.name === name))) {
          room = r
          break
        }
      }
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

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/server/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);

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
        autoDispose: false,
      })
      console.log(`Restored persistent workspace: ${ws.name}`)
    } catch (e) {
      console.error(`Failed to restore workspace ${ws.name}:`, e)
    }
  })
}
