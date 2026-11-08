import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setLoggedIn, setAvatarCustomization } from '../stores/UserStore'
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
  const game = phaserGame.scene.keys.game as Game

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
    if (name === '') {
      setNameFieldEmpty(true)
    } else if (roomJoined) {
      console.log('Join! Name:', name, 'Avatar:', avatars[avatarIndex].name)
      game.registerKeys()
      game.myPlayer.setPlayerName(name)

      const customization = { skinColor, hairColor, outfitType, outfitColor }
      dispatch(setAvatarCustomization(customization))
      game.myPlayer.setCharacterCustomization(avatars[avatarIndex].name, customization)
      game.network.updatePlayerName(name, customization)

      game.network.readyToConnect()
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
            <TextField
              autoFocus
              fullWidth
              label="Name"
              variant="outlined"
              color="secondary"
              error={nameFieldEmpty}
              helperText={nameFieldEmpty && 'Name is required'}
              onInput={(e) => {
                setName((e.target as HTMLInputElement).value)
              }}
            />
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
                    game.network.webRTC?.getUserMedia()
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
