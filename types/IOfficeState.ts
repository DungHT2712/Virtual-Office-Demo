import { Schema, ArraySchema, SetSchema, MapSchema } from '@colyseus/schema'

export type OutfitType = 'casual' | 'worker' | 'suit'
export type RoomCategory = 'lounge' | 'meeting' | 'office' | 'pantry'
export type FurnitureCategory = 'table' | 'chair' | 'computer' | 'vase' | 'whiteboard' | 'vendingmachine'

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
  onChange?: (changes: any[]) => void
}

export interface IComputer extends Schema {
  connectedUser: SetSchema<string>
  onChange?: (changes: any[]) => void
}

export interface IWhiteboard extends Schema {
  roomId: string
  connectedUser: SetSchema<string>
  onChange?: (changes: any[]) => void
}

export interface IChatMessage extends Schema {
  author: string
  createdAt: number
  content: string
  onChange?: (changes: any[]) => void
}

export interface IWorkspaceState extends Schema {
  sizeType: string
  width: number
  height: number
  onChange?: (changes: any[]) => void
}

export interface IRoomLayout extends Schema {
  id: string
  roomType: string
  name: string
  gridX: number
  gridY: number
  width: number
  height: number
  doorX?: number
  doorY?: number
  onChange?: (changes: any[]) => void
}

export interface IFurnitureItem extends Schema {
  id: string
  itemType: string
  gridX: number
  gridY: number
  orientation: number
  itemDirection?: string
  tint?: number
  onChange?: (changes: any[]) => void
}

export interface IOfficeState extends Schema {
  players: MapSchema<IPlayer>
  computers: MapSchema<IComputer>
  whiteboards: MapSchema<IWhiteboard>
  chatMessages: ArraySchema<IChatMessage>
  workspace: IWorkspaceState
  mapRooms: MapSchema<IRoomLayout>
  furniture: MapSchema<IFurnitureItem>
}
