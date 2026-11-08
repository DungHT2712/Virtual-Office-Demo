import { Command } from '@colyseus/command'
import { Client } from 'colyseus'
import { IOfficeState } from '../../../types/IOfficeState'
import { Computer } from '../schema/OfficeState'

type Payload = {
  client: Client
  computerId: string
}

export class ComputerAddUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, computerId } = data
    let computer = this.room.state.computers.get(computerId)
    if (!computer) {
      computer = new Computer()
      this.room.state.computers.set(computerId, computer)
    }
    const clientId = client.sessionId

    if (computer.connectedUser.has(clientId)) return
    computer.connectedUser.add(clientId)
  }
}

export class ComputerRemoveUserCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, computerId } = data
    const computer = this.state.computers.get(computerId)

    if (computer && computer.connectedUser.has(client.sessionId)) {
      computer.connectedUser.delete(client.sessionId)
    }
  }
}
