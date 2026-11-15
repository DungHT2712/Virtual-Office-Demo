import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'
import { ChatMessage } from '../schema/OfficeState'
import { appendChatMessage } from '../../data/workspaceStorage'

type Payload = {
  client: Client
  content: string
}

export default class ChatMessageUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, content } = data
    const player = this.room.state.players.get(client.sessionId)
    const chatMessages = this.room.state.chatMessages

    if (!chatMessages) return

    /**
     * Only allow server to store a maximum of 100 chat messages:
     * remove the first element before pushing a new one when array length is >= 100
     */
    if (chatMessages.length >= 100) chatMessages.shift()

    const newMessage = new ChatMessage()
    newMessage.author = player ? player.name : 'Guest'
    newMessage.content = content
    newMessage.createdAt = Date.now()
    chatMessages.push(newMessage)

    const roomId = (this.room as any).roomId
    if (roomId) {
      appendChatMessage(roomId, {
        author: newMessage.author,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
      })
    }
  }
}
