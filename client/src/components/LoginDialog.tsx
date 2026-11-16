import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import VpnKeyIcon from '@mui/icons-material/VpnKey'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setLoggedIn, setAvatarCustomization, setPlayerName } from '../stores/UserStore'
import { setRoomJoined } from '../stores/RoomStore'
import { OutfitType } from '../../../types/IOfficeState'
import { renderAvatarPreviewCanvas } from '../utils/AvatarCustomizer'
import { getAvatarString, getColorByString } from '../util'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'
import Bootstrap from '../scenes/Bootstrap'

const SKIN_PRESETS = ['#fde2c8', '#f5cfa0', '#e0ac69', '#c68642', '#8d5524']
const HAIR_PRESETS = ['#1c1c1c', '#4a3728', '#8b4513', '#d4af37', '#b91c1c', '#3b82f6']
const OUTFIT_PRESETS = ['#3b82f6', '#1e293b', '#dc2626', '#16a34a', '#9333ea', '#f59e0b']

const OUTFIT_TYPES: { label: string; value: OutfitType }[] = [
  { label: 'Bình thường', value: 'casual' },
  { label: 'Worker (đồ vest)', value: 'worker' },
]

const Wrapper = styled.form`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #222639;
  border-radius: 16px;
  padding: 28px 44px;
  box-shadow: 0px 0px 10px #0000008f;
  max-width: 900px;
  width: 92vw;
  box-sizing: border-box;
  pointer-events: auto;
`

const Title = styled.p`
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #c2c2c2;
  text-align: center;
`

const RoomName = styled.div`
  max-width: 500px;
  max-height: 100px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  display: flex;
  gap: 10px;
  margin: 0 auto;
  justify-content: center;
  align-items: center;

  h3 {
    margin: 4px 0;
    font-size: 22px;
    color: #eee;
  }
`

const RoomDescription = styled.div`
  max-width: 500px;
  max-height: 80px;
  overflow-wrap: anywhere;
  overflow-y: auto;
  font-size: 14px;
  color: #c2c2c2;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SubTitle = styled.h3`
  font-size: 15px;
  color: #eee;
  text-align: center;
  margin: 0 0 10px 0;
`

const Content = styled.div`
  display: flex;
  gap: 28px;
  margin: 20px 0;
  align-items: flex-start;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`

const Left = styled.div`
  --swiper-navigation-size: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .swiper {
    width: 150px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
  }

  .swiper-slide {
    width: 150px;
    height: 200px;
    background: #dbdbe0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-slide canvas {
    display: block;
    width: 95px;
    height: 136px;
    image-rendering: pixelated;
  }
`

const Center = styled.div`
  width: 270px;
  background: #191c2b;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const CustomSectionTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const OutfitButtonsRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`

const OutfitButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid ${(props) => (props.active ? '#38bdf8' : '#334155')};
  background: ${(props) => (props.active ? '#0369a1' : '#1e293b')};
  color: ${(props) => (props.active ? '#ffffff' : '#cbd5e1')};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #38bdf8;
  }
`

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
`

const ColorCircle = styled.button<{ color: string; active: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
  border: ${(props) => (props.active ? '2px solid #ffffff' : '1px solid #475569')};
  box-shadow: ${(props) => (props.active ? '0 0 5px rgba(255,255,255,0.7)' : 'none')};
  cursor: pointer;
  padding: 0;
  outline: none;
  transition: transform 0.1s ease;

  &:hover {
    transform: scale(1.15);
  }
`

const ColorInputWrapper = styled.label`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px dashed #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  background: #334155;

  input[type='color'] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  span {
    font-size: 12px;
    color: #f1f5f9;
    user-select: none;
  }
`

const Right = styled.div`
  width: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
`

const Warning = styled.div`
  margin-top: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const avatars = [
  { name: 'adam', img: Adam },
  { name: 'ash', img: Ash },
  { name: 'lucy', img: Lucy },
  { name: 'nancy', img: Nancy },
]

// shuffle the avatars array
for (let i = avatars.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1))
  ;[avatars[i], avatars[j]] = [avatars[j], avatars[i]]
}

export default function LoginDialog() {
  const [name, setName] = useState<string>('')
  const [avatarIndex, setAvatarIndex] = useState<number>(0)
  const [nameFieldEmpty, setNameFieldEmpty] = useState<boolean>(false)

  // Customization state
  const [skinColor, setSkinColor] = useState<string>('#f5cfa0')
  const [hairColor, setHairColor] = useState<string>('#4a3728')
  const [outfitType, setOutfitType] = useState<OutfitType>('casual')
  const [outfitColor, setOutfitColor] = useState<string>('#3b82f6')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

  const dispatch = useAppDispatch()
  const videoConnected = useAppSelector((state) => state.user.videoConnected)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const roomName = useAppSelector((state) => state.room.roomName)
  const roomDescription = useAppSelector((state) => state.room.roomDescription)
  const roomId = useAppSelector((state) => state.room.roomId)
  const currentUserId = useAppSelector((state) => state.user.userId)
  const game = phaserGame.scene.keys.game as Game

  // State kiểm tra Cần đăng nhập (lấy từ User)
  const [requireLogin, setRequireLogin] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Kiểm tra cấu hình phòng và session đã xác thực
  useEffect(() => {
    if (!roomId) return
    const storedAuth = sessionStorage.getItem(`ws_auth_${roomId}`)
    if (storedAuth) {
      try {
        const u = JSON.parse(storedAuth)
        if (u.name) setName(u.name)
        setIsAuthenticated(true)
      } catch (e) {}
    }

    const checkRoomConfig = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.workspace) {
            const ws = data.workspace
            const owner = ws.ownerId === currentUserId
            setIsOwner(owner)
            setRequireLogin(!!ws.requireLogin)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    checkRoomConfig()
  }, [roomId, currentUserId])

  const handleVerifyUser = async () => {
    if (!authUsername.trim()) {
      setAuthError('Vui lòng nhập tài khoản (username)!')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await fetch(`/api/workspaces/${roomId}/auth-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername.trim(),
          password: authPassword.trim(),
          userId: currentUserId,
        }),
      })
      const data = await res.json()
      if (data.success && data.verified) {
        setIsAuthenticated(true)
        if (data.user) {
          setName(data.user.name)
          sessionStorage.setItem(`ws_auth_${roomId}`, JSON.stringify(data.user))
        }
      } else {
        setAuthError(data.message || 'Tài khoản hoặc mật khẩu không chính xác!')
      }
    } catch (e: any) {
      setAuthError(e.message || 'Lỗi xác thực')
    } finally {
      setAuthLoading(false)
    }
  }

  // Update preview canvas whenever avatar or custom appearance changes
  useEffect(() => {
    avatars.forEach((avatar, idx) => {
      const targetCanvas = canvasRefs.current[idx]
      if (!targetCanvas) return

      const img = new Image()
      const handleLoad = () => {
        renderAvatarPreviewCanvas(targetCanvas, img, {
          skinColor,
          hairColor,
          outfitType,
          outfitColor,
        })
      }
      img.onload = handleLoad
      img.src = avatar.img
      if (img.complete) {
        handleLoad()
      }
    })

    canvasRef.current = canvasRefs.current[avatarIndex]
  }, [avatarIndex, skinColor, hairColor, outfitType, outfitColor])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (requireLogin && !isOwner && !isAuthenticated) {
      setAuthError('Workspace này yêu cầu xác thực tài khoản & mật khẩu User trước khi vào!')
      return
    }

    const finalName = (name || authUsername || 'User').trim()
    if (!finalName) {
      setNameFieldEmpty(true)
      return
    }

    try {
      console.log('Join! Name:', finalName, 'Avatar:', avatars[avatarIndex].name)
      const customization = { skinColor, hairColor, outfitType, outfitColor }
      dispatch(setAvatarCustomization(customization))
      dispatch(setPlayerName(finalName))

      const gameScene = phaserGame?.scene?.keys?.game as Game
      if (gameScene) {
        try {
          gameScene.registerKeys?.()
        } catch (e) {}
        if (gameScene.myPlayer) {
          try {
            gameScene.myPlayer.setPlayerName(finalName)
          } catch (e) {}
          try {
            gameScene.myPlayer.setCharacterCustomization(avatars[avatarIndex].name, customization)
          } catch (e) {}
        }
        if (gameScene.network) {
          try {
            gameScene.network.updatePlayerName(finalName, customization)
          } catch (e) {}
          try {
            gameScene.network.readyToConnect()
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Error during game connect in LoginDialog:', err)
    } finally {
      dispatch(setLoggedIn(true))
    }
  }

  return (
    <Wrapper onSubmit={handleSubmit}>
      <Title>Joining</Title>
      <RoomName>
        <Avatar style={{ background: getColorByString(roomName) }}>
          {getAvatarString(roomName)}
        </Avatar>
        <h3>{roomName}</h3>
      </RoomName>
      <RoomDescription>
        <ArrowRightIcon /> {roomDescription}
      </RoomDescription>
      <Content>
        <Left>
          <SubTitle>Select an avatar</SubTitle>
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              setAvatarIndex(swiper.activeIndex)
            }}
          >
            {avatars.map((avatar, idx) => (
              <SwiperSlide key={avatar.name}>
                <canvas
                  ref={(el) => {
                    canvasRefs.current[idx] = el
                    if (idx === avatarIndex) {
                      canvasRef.current = el
                    }
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Left>

        <Center>
          <div>
            <CustomSectionTitle>Kiểu trang phục</CustomSectionTitle>
            <OutfitButtonsRow>
              {OUTFIT_TYPES.map((type) => (
                <OutfitButton
                  key={type.value}
                  type="button"
                  active={outfitType === type.value}
                  onClick={() => setOutfitType(type.value)}
                >
                  {type.label}
                </OutfitButton>
              ))}
            </OutfitButtonsRow>
          </div>

          <div>
            <CustomSectionTitle>Màu da</CustomSectionTitle>
            <ColorRow>
              {SKIN_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  type="button"
                  color={color}
                  active={skinColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setSkinColor(color)}
                />
              ))}
              <ColorInputWrapper title="Chọn màu tùy chỉnh">
                <span>+</span>
                <input
                  type="color"
                  value={skinColor}
                  onChange={(e) => setSkinColor(e.target.value)}
                />
              </ColorInputWrapper>
            </ColorRow>
          </div>

          <div>
            <CustomSectionTitle>Màu tóc</CustomSectionTitle>
            <ColorRow>
              {HAIR_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  type="button"
                  color={color}
                  active={hairColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setHairColor(color)}
                />
              ))}
              <ColorInputWrapper title="Chọn màu tùy chỉnh">
                <span>+</span>
                <input
                  type="color"
                  value={hairColor}
                  onChange={(e) => setHairColor(e.target.value)}
                />
              </ColorInputWrapper>
            </ColorRow>
          </div>

          <div>
            <CustomSectionTitle>Màu trang phục</CustomSectionTitle>
            <ColorRow>
              {OUTFIT_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  type="button"
                  color={color}
                  active={outfitColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setOutfitColor(color)}
                />
              ))}
              <ColorInputWrapper title="Chọn màu tùy chỉnh">
                <span>+</span>
                <input
                  type="color"
                  value={outfitColor}
                  onChange={(e) => setOutfitColor(e.target.value)}
                />
              </ColorInputWrapper>
            </ColorRow>
          </div>
        </Center>

        <Right>
          <div>
            {requireLogin && !isOwner && !isAuthenticated ? (
              <div style={{ background: '#191c2b', borderRadius: 10, padding: 12, border: '1px solid #f59e0b', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                  <VpnKeyIcon sx={{ fontSize: 16 }} />
                  Đăng Nhập Tài Khoản User
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: 11, color: '#94a3b8' }}>
                  Workspace yêu cầu xác thực tài khoản & mật khẩu thành viên để vào.
                </p>
                <TextField
                  fullWidth
                  size="small"
                  label="Tài khoản (Username)"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  label="Mật khẩu (Password)"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  sx={{ mb: 1.5 }}
                />
                {authError && (
                  <Alert severity="error" sx={{ mb: 1.5, py: 0.5, fontSize: 12 }}>
                    {authError}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  disabled={authLoading}
                  onClick={handleVerifyUser}
                  sx={{ background: '#d97706', color: '#fff', textTransform: 'none', fontWeight: 700, '&:hover': { background: '#b45309' } }}
                >
                  {authLoading ? 'Đang kiểm tra...' : 'Xác thực tài khoản'}
                </Button>
              </div>
            ) : (
              <>
                {requireLogin && !isOwner && isAuthenticated && (
                  <Alert severity="success" sx={{ mb: 1.5, py: 0.5, fontSize: 12 }}>
                    Đã đăng nhập: <strong>{name}</strong>
                  </Alert>
                )}
                <TextField
                  autoFocus
                  fullWidth
                  label="Name"
                  value={name}
                  variant="outlined"
                  color="secondary"
                  error={nameFieldEmpty}
                  helperText={nameFieldEmpty && 'Name is required'}
                  onInput={(e) => {
                    setName((e.target as HTMLInputElement).value)
                  }}
                />
              </>
            )}
            {!videoConnected && (
              <Warning>
                <Alert variant="outlined" severity="warning">
                  <AlertTitle>Warning</AlertTitle>
                  No webcam/mic connected - <strong>connect one for best experience!</strong>
                </Alert>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    const gameScene = phaserGame?.scene?.keys?.game as Game
                    gameScene?.network?.webRTC?.getUserMedia()
                  }}
                >
                  Connect Webcam
                </Button>
              </Warning>
            )}

            {videoConnected && (
              <Warning>
                <Alert variant="outlined">Webcam connected!</Alert>
              </Warning>
            )}
          </div>
        </Right>
      </Content>
      <Bottom>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => {
            const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
            if (bootstrap) bootstrap.leaveGame()
            dispatch(setRoomJoined(false))
          }}
          style={{ marginRight: 16, textTransform: 'none' }}
        >
          &larr; Đổi Workspace Khác
        </Button>
        <Button variant="contained" color="secondary" size="large" type="submit" style={{ textTransform: 'none', fontWeight: 700 }}>
          Vào Workspace
        </Button>
      </Bottom>
    </Wrapper>
  )
}
