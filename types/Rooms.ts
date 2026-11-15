export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'skyoffice',
  CUSTOM = 'custom',
}

export interface IRoomData {
  id?: string
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
  companyId?: string
  companyName?: string
  departmentId?: string
  departmentName?: string
  requireLogin?: boolean
  company?: any
  users?: any
  isParent?: boolean
  parentWorkspaceId?: string | null
  projects?: any
  tasks?: any
  documentTypes?: any
  documents?: any
}
