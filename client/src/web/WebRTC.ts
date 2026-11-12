import Peer from 'peerjs'
import Network from '../services/Network'
import store from '../stores'
import { setVideoConnected } from '../stores/UserStore'

export default class WebRTC {
  private myPeer: Peer
  private peers = new Map<
    string,
    { call: Peer.MediaConnection; video: HTMLVideoElement; userId?: string }
  >()
  private onCalledPeers = new Map<string, { call: Peer.MediaConnection; video: HTMLVideoElement }>()
  private videoGrid: HTMLElement | null = null
  private buttonGrid: HTMLElement | null = null
  private myVideo = document.createElement('video')
  private myStream?: MediaStream
  private network: Network

  constructor(userId: string, network: Network) {
    const sanitizedId = this.replaceInvalidId(userId)
    this.myPeer = new Peer(sanitizedId)
    this.network = network
    console.log('userId:', userId)
    console.log('sanitizedId:', sanitizedId)
    this.myPeer.on('error', (err) => {
      console.log(err.type)
      console.error(err)
    })

    // mute your own video stream (you don't want to hear yourself)
    this.myVideo.muted = true

    // config peerJS
    this.initialize()
  }

  private getVideoGrid() {
    if (!this.videoGrid || !document.body.contains(this.videoGrid)) {
      this.videoGrid = document.querySelector('.video-grid')
    }
    return this.videoGrid
  }

  private getButtonGrid() {
    if (!this.buttonGrid || !document.body.contains(this.buttonGrid)) {
      this.buttonGrid = document.querySelector('.button-grid')
    }
    return this.buttonGrid
  }

  // PeerJS throws invalid_id error if it contains some characters such as that colyseus generates.
  // https://peerjs.com/docs.html#peer-id
  private replaceInvalidId(userId: string) {
    return userId.replace(/[^0-9a-z]/gi, 'G')
  }

  initialize() {
    this.myPeer.on('call', (call) => {
      if (!this.onCalledPeers.has(call.peer)) {
        call.answer(this.myStream)
        const video = document.createElement('video')
        this.onCalledPeers.set(call.peer, { call, video })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })

        call.on('close', () => {
          video.remove()
          this.onCalledPeers.delete(call.peer)
        })
      }
    })
  }

  // check if permission has been granted before
  checkPreviousPermission() {
    const permissionName = 'microphone' as PermissionName
    navigator.permissions?.query({ name: permissionName }).then((result) => {
      if (result.state === 'granted') this.getUserMedia(false)
    })
  }

  getUserMedia(alertOnError = true) {
    if (this.myStream) {
      return
    }

    // ask the browser to get user media
    navigator.mediaDevices
      ?.getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        this.myStream = stream

        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            this.stopUserMedia()
          }
        })

        this.myVideo.muted = true
        this.addVideoStream(this.myVideo, this.myStream)
        this.setUpButtons()
        store.dispatch(setVideoConnected(true))
        this.network.videoConnected(true)
      })
      .catch((error) => {
        console.warn('getUserMedia error:', error)
        if (alertOnError) window.alert('No webcam or microphone found, or permission is blocked')
      })
  }

  stopUserMedia() {
    // 1. Dừng toàn bộ tracks của stream cục bộ
    if (this.myStream) {
      this.myStream.getTracks().forEach((track) => track.stop())
      this.myStream = undefined
    }

    // 2. Gỡ bỏ video element cá nhân khỏi DOM
    this.myVideo.srcObject = null
    this.myVideo.remove()

    // 3. Đóng và gỡ bỏ cuộc gọi/stream tới các peer khác
    this.peers.forEach((peer) => {
      try {
        peer.call.close()
      } catch (e) {
        console.warn(e)
      }
      peer.video.remove()
      if (peer.userId) {
        this.network.playerStreamDisconnect(peer.userId)
      }
    })
    this.peers.clear()

    this.onCalledPeers.forEach((onCalledPeer) => {
      try {
        onCalledPeer.call.close()
      } catch (e) {
        console.warn(e)
      }
      onCalledPeer.video.remove()
    })
    this.onCalledPeers.clear()

    // 4. Xóa các nút Mute / Video off khỏi button-grid
    const buttonGrid = this.getButtonGrid()
    if (buttonGrid) {
      buttonGrid.innerHTML = ''
    }

    // 5. Cập nhật Redux store và Network
    store.dispatch(setVideoConnected(false))
    this.network.videoConnected(false)
  }

  // method to call a peer
  connectToNewUser(userId: string) {
    if (this.myStream) {
      const sanitizedId = this.replaceInvalidId(userId)
      if (!this.peers.has(sanitizedId)) {
        console.log('calling', sanitizedId)
        const call = this.myPeer.call(sanitizedId, this.myStream)
        const video = document.createElement('video')
        this.peers.set(sanitizedId, { call, video, userId })

        call.on('stream', (userVideoStream) => {
          this.addVideoStream(video, userVideoStream)
        })

        call.on('close', () => {
          video.remove()
          this.peers.delete(sanitizedId)
        })
      }
    }
  }

  // method to add new video stream to videoGrid div
  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream
    video.playsInline = true
    video.onloadedmetadata = () => {
      video.play().catch((err) => console.warn('Video play error:', err))
    }
    const videoGrid = this.getVideoGrid()
    if (videoGrid && !videoGrid.contains(video)) {
      videoGrid.append(video)
    }
  }

  // method to remove video stream (when we are the host of the call)
  deleteVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.peers.has(sanitizedId)) {
      const peer = this.peers.get(sanitizedId)
      peer?.call.close()
      peer?.video.remove()
      this.peers.delete(sanitizedId)
    }
  }

  // method to remove video stream (when we are the guest of the call)
  deleteOnCalledVideoStream(userId: string) {
    const sanitizedId = this.replaceInvalidId(userId)
    if (this.onCalledPeers.has(sanitizedId)) {
      const onCalledPeer = this.onCalledPeers.get(sanitizedId)
      onCalledPeer?.call.close()
      onCalledPeer?.video.remove()
      this.onCalledPeers.delete(sanitizedId)
    }
  }

  // method to set up mute/unmute and video on/off buttons
  setUpButtons() {
    const buttonGrid = this.getButtonGrid()
    if (buttonGrid) {
      buttonGrid.innerHTML = ''
    }

    const audioButton = document.createElement('button')
    audioButton.innerText = 'Mute'
    audioButton.addEventListener('click', () => {
      if (this.myStream) {
        const audioTrack = this.myStream.getAudioTracks()[0]
        if (audioTrack) {
          if (audioTrack.enabled) {
            audioTrack.enabled = false
            audioButton.innerText = 'Unmute'
          } else {
            audioTrack.enabled = true
            audioButton.innerText = 'Mute'
          }
        }
      }
    })

    const videoButton = document.createElement('button')
    videoButton.innerText = 'Video off'
    videoButton.addEventListener('click', () => {
      if (this.myStream) {
        const videoTrack = this.myStream.getVideoTracks()[0]
        if (videoTrack) {
          if (videoTrack.enabled) {
            videoTrack.enabled = false
            videoButton.innerText = 'Video on'
          } else {
            videoTrack.enabled = true
            videoButton.innerText = 'Video off'
          }
        }
      }
    })

    buttonGrid?.append(audioButton)
    buttonGrid?.append(videoButton)
  }

  // Dọn dẹp toàn bộ streams, connections và peer khi rời phòng
  destroy() {
    this.stopUserMedia()
    this.myPeer.destroy()
  }
}
