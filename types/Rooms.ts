export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'skyoffice',
  CUSTOM = 'custom',
}

export interface IRoomData {
  name: string
  description: string
  password: string | null
  autoDispose: boolean
  sizeType?: string
  width?: number
  height?: number
  ownerId?: string
  ownerName?: string
  shareMode?: 'free' | 'ask'
  sharedUsers?: string[]
}
