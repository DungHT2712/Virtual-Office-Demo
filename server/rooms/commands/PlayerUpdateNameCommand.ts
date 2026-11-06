import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'

type Payload = {
  client: Client
  name: string
  skinColor?: string
  hairColor?: string
  outfitType?: string
  outfitColor?: string
}

export default class PlayerUpdateNameCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, name, skinColor, hairColor, outfitType, outfitColor } = data

    const player = this.room.state.players.get(client.sessionId)

    if (!player) return
    player.name = name
    if (skinColor) player.skinColor = skinColor
    if (hairColor) player.hairColor = hairColor
    if (outfitType) player.outfitType = outfitType
    if (outfitColor) player.outfitColor = outfitColor
  }
}
