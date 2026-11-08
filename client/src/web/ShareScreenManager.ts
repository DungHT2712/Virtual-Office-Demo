import Peer from 'peerjs'
import store from '../stores'
import { setMyStream, addVideoStream, removeVideoStream } from '../stores/ComputerStore'
import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

export default class ShareScreenManager {
  private myPeer: Peer
  myStream?: MediaStream
  private activeCalls = new Map<string, Peer.MediaConnection>()
  private retryTimeouts = new Map<string, NodeJS.Timeout>()

  constructor(private userId: string) {
    const sanatizedId = this.makeId(userId)
    this.myPeer = new Peer(sanatizedId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
    })

    this.myPeer.on('open', (id) => {
      console.log(`[ShareScreen] My PeerJS ID ready: ${id}`)
      // If we are already sharing screen, call any other users currently at this computer
      if (this.myStream) {
        this.callAllCurrentUsers()
      }
    })

    this.myPeer.on('error', (err) => {
      console.warn('[ShareScreen] WebRTC Peer error:', err.type, err.message)
    })

    this.myPeer.on('call', (call) => {
      console.log(`[ShareScreen] Incoming call from: ${call.peer}`)
      // Answer incoming call to receive screen stream
      call.answer()

      call.on('stream', (userVideoStream) => {
        console.log(`[ShareScreen] Received stream from: ${call.peer}`)
        store.dispatch(addVideoStream({ id: call.peer, call, stream: userVideoStream }))
      })

      call.on('close', () => {
        console.log(`[ShareScreen] Call closed with: ${call.peer}`)
        store.dispatch(removeVideoStream(call.peer))
      })

      call.on('error', (err) => {
        console.warn(`[ShareScreen] Call error with ${call.peer}:`, err)
        store.dispatch(removeVideoStream(call.peer))
      })
    })
  }

  onOpen() {
    // If peer is disconnected from signaling server, reconnect
    if (this.myPeer.disconnected && !this.myPeer.destroyed) {
      this.myPeer.reconnect()
    }
    // If sharing screen, ensure all other users receive the stream
    if (this.myStream) {
      this.callAllCurrentUsers()
    }
  }

  onClose() {
    // Stop sharing our own screen
    this.stopScreenShare(false)
    // Clear any pending call retries
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.retryTimeouts.clear()
    // Close outgoing calls
    this.activeCalls.forEach((call) => call.close())
    this.activeCalls.clear()
    // NOTE: Keep myPeer connected to signaling server so incoming calls can always be answered immediately
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  // Also for screen sharing ID add a `-ss` at the end.
  private makeId(id: string) {
    return `${id.replace(/[^0-9a-z]/gi, 'G')}-ss`
  }

  startScreenShare() {
    navigator.mediaDevices
      ?.getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        // Detect when user clicks "Stop sharing" in browser native bar
        const track = stream.getVideoTracks()[0]
        if (track) {
          track.onended = () => {
            this.stopScreenShare()
          }
        }

        this.myStream = stream
        store.dispatch(setMyStream(stream))

        // Call all existing users on this computer
        this.callAllCurrentUsers()
      })
      .catch((err) => {
        console.warn('[ShareScreen] getDisplayMedia error:', err)
      })
  }

  private callAllCurrentUsers() {
    const game = phaserGame.scene.keys.game as Game
    const computerId = store.getState().computer.computerId
    if (!computerId) return
    const computerItem = game.computerMap.get(computerId)
    if (computerItem) {
      for (const userId of computerItem.currentUsers) {
        this.onUserJoined(userId)
      }
    }
  }

  stopScreenShare(shouldDispatch = true) {
    this.myStream?.getTracks().forEach((track) => track.stop())
    this.myStream = undefined
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout))
    this.retryTimeouts.clear()
    this.activeCalls.forEach((call) => call.close())
    this.activeCalls.clear()

    if (shouldDispatch) {
      store.dispatch(setMyStream(null))
      const game = phaserGame.scene.keys.game as Game
      const computerId = store.getState().computer.computerId
      if (computerId) {
        game.network.onStopScreenShare(computerId)
      }
    }
  }

  onUserJoined(userId: string, retries = 5) {
    if (!this.myStream || userId === this.userId) return

    const sanitizedId = this.makeId(userId)

    // Clear any previous retry timeout for this user
    if (this.retryTimeouts.has(sanitizedId)) {
      clearTimeout(this.retryTimeouts.get(sanitizedId)!)
      this.retryTimeouts.delete(sanitizedId)
    }

    // Close any previous call to this user before initiating a new one
    if (this.activeCalls.has(sanitizedId)) {
      this.activeCalls.get(sanitizedId)?.close()
      this.activeCalls.delete(sanitizedId)
    }

    console.log(`[ShareScreen] Calling peer ${sanitizedId}, retries remaining: ${retries}`)

    try {
      const call = this.myPeer.call(sanitizedId, this.myStream)
      if (!call) {
        if (retries > 0 && this.myStream) {
          const timeout = setTimeout(() => this.onUserJoined(userId, retries - 1), 1200)
          this.retryTimeouts.set(sanitizedId, timeout)
        }
        return
      }

      this.activeCalls.set(sanitizedId, call)

      call.on('error', (err) => {
        console.warn(`[ShareScreen] Call error with ${sanitizedId}:`, err)
        this.activeCalls.delete(sanitizedId)
        if (retries > 0 && this.myStream) {
          const timeout = setTimeout(() => this.onUserJoined(userId, retries - 1), 1200)
          this.retryTimeouts.set(sanitizedId, timeout)
        }
      })

      call.on('close', () => {
        this.activeCalls.delete(sanitizedId)
      })
    } catch (err) {
      console.warn(`[ShareScreen] Call exception for ${sanitizedId}:`, err)
      if (retries > 0 && this.myStream) {
        const timeout = setTimeout(() => this.onUserJoined(userId, retries - 1), 1200)
        this.retryTimeouts.set(sanitizedId, timeout)
      }
    }
  }

  onUserLeft(userId: string) {
    if (userId === this.userId) return

    const sanitizedId = this.makeId(userId)
    if (this.retryTimeouts.has(sanitizedId)) {
      clearTimeout(this.retryTimeouts.get(sanitizedId)!)
      this.retryTimeouts.delete(sanitizedId)
    }
    if (this.activeCalls.has(sanitizedId)) {
      this.activeCalls.get(sanitizedId)?.close()
      this.activeCalls.delete(sanitizedId)
    }

    store.dispatch(removeVideoStream(sanitizedId))
  }
}
