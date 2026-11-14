import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'

type Payload = {
  client: Client
  x: number
  y: number
  anim: string
  floor?: number
}

export default class PlayerUpdateCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, x, y, anim, floor } = data

    const player = this.room.state.players.get(client.sessionId)

    if (!player) return
    if (player.x !== x) player.x = x
    if (player.y !== y) player.y = y
    if (player.anim !== anim) player.anim = anim
    if (floor !== undefined && player.floor !== floor) {
      player.floor = floor
    }
  }
}
