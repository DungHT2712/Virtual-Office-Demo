import { Schema, type } from '@colyseus/schema'
import { IWorkspaceState } from '../../../types/IOfficeState'

export class WorkspaceState extends Schema implements IWorkspaceState {
  @type('string') sizeType = 'MEDIUM'
  @type('number') width = 30
  @type('number') height = 30
}
