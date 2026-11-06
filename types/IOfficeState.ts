import { Schema, ArraySchema, SetSchema, MapSchema } from '@colyseus/schema'

export type OutfitType = 'casual' | 'suit' | 'dress'

export interface IAvatarCustomization {
  skinColor: string
  hairColor: string
  outfitType: OutfitType
  outfitColor: string
}

export interface IPlayer extends Schema {
  name: string
  x: number
  y: number
  anim: string
  readyToConnect: boolean
  videoConnected: boolean
  skinColor: string
  hairColor: string
  outfitType: string
  outfitColor: string
}

export interface IComputer extends Schema {
  connectedUser: SetSchema<string>
}

export interface IWhiteboard extends Schema {
  roomId: string
  connectedUser: SetSchema<string>
}

export interface IChatMessage extends Schema {
  author: string
  createdAt: number
  content: string
}

export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>
  computers: MapSchema<IComputer>
  whiteboards: MapSchema<IWhiteboard>
  chatMessages: ArraySchema<IChatMessage>
}
