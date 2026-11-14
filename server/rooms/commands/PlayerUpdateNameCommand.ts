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
  statusColor?: string
  statusName?: string
}

export default class PlayerUpdateNameCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, name, skinColor, hairColor, outfitType, outfitColor, statusColor, statusName } = data

    const player = this.room.state.players.get(client.sessionId)

    if (!player) return
    if (name && player.name !== name) player.name = name
    if (skinColor && player.skinColor !== skinColor) player.skinColor = skinColor
    if (hairColor && player.hairColor !== hairColor) player.hairColor = hairColor
    if (outfitType && player.outfitType !== outfitType) player.outfitType = outfitType
    if (outfitColor && player.outfitColor !== outfitColor) player.outfitColor = outfitColor
    if (statusColor && player.statusColor !== statusColor) player.statusColor = statusColor
    if (statusName && player.statusName !== statusName) player.statusName = statusName
  }
}
