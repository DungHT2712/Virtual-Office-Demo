import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'
import { Whiteboard } from '../schema/OfficeState'

type Payload = {
  client: Client
  whiteboardId: string
}

export class WhiteboardAddUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, whiteboardId } = data
    let whiteboard = this.room.state.whiteboards.get(whiteboardId)
    if (!whiteboard) {
      whiteboard = new Whiteboard()
      this.room.state.whiteboards.set(whiteboardId, whiteboard)
    }
    const clientId = client.sessionId

    if (whiteboard.connectedUser.has(clientId)) return
    whiteboard.connectedUser.add(clientId)
  }
}

export class WhiteboardRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, whiteboardId } = data
    const whiteboard = this.state.whiteboards.get(whiteboardId)

    if (whiteboard && whiteboard.connectedUser.has(client.sessionId)) {
      whiteboard.connectedUser.delete(client.sessionId)
    }
  }
}
