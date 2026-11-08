import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FaceIcon from '@mui/icons-material/Face'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

import Adam from '../images/login/Adam_login.png'
import Ash from '../images/login/Ash_login.png'
import Lucy from '../images/login/Lucy_login.png'
import Nancy from '../images/login/Nancy_login.png'

import { useAppSelector, useAppDispatch } from '../hooks'
import { setPlayerName, setAvatar, setAvatarCustomization } from '../stores/UserStore'
import { OutfitType } from '../../../types/IOfficeState'
import { renderAvatarPreviewCanvas } from '../utils/AvatarCustomizer'

const SKIN_PRESETS = ['#fde2c8', '#f5cfa0', '#e0ac69', '#c68642', '#8d5524']
const HAIR_PRESETS = ['#1c1c1c', '#4a3728', '#8b4513', '#d4af37', '#b91c1c', '#3b82f6']
const OUTFIT_PRESETS = ['#3b82f6', '#1e293b', '#dc2626', '#16a34a', '#9333ea', '#f59e0b']

const OUTFIT_TYPES: { label: string; value: OutfitType }[] = [
  { label: 'Bình thường', value: 'casual' },
  { label: 'Worker (đồ vest)', value: 'worker' },
]

const avatars = [
  { name: 'adam', label: 'Adam', img: Adam },
  { name: 'ash', label: 'Ash', img: Ash },
  { name: 'lucy', label: 'Lucy', img: Lucy },
  { name: 'nancy', label: 'Nancy', img: Nancy },
]

const DialogWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 780px;
  color: #f1f5f9;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .back-btn {
    color: #94a3b8;
    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  align-items: start;
`

const AvatarColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  --swiper-navigation-size: 20px;

  .swiper {
    width: 180px;
    height: 220px;
    border-radius: 12px;
    background: #111422;
    border: 2px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #2a2e45;
  }

  canvas {
    width: 120px;
    height: 170px;
    image-rendering: pixelated;
    object-fit: contain;
  }

  .avatar-label {
    font-size: 14px;
    font-weight: 700;
    color: #38bdf8;
  }
`

const ControlsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const ColorGrid = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const ColorCircle = styled.button<{ $color: string; $active: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  border: ${(props) => (props.$active ? '3px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.2)')};
  box-shadow: ${(props) => (props.$active ? '0 0 8px rgba(255, 255, 255, 0.6)' : 'none')};
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.15);
  }
`

const ColorPickerInput = styled.input`
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
`

const OutfitTypeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const OutfitTypeButton = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)')};
  border: 2px solid ${(props) => (props.$active ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 8px;
  padding: 8px 4px;
  color: ${(props) => (props.$active ? '#38bdf8' : '#e2e8f0')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #38bdf8;
  }
`

const Bottom = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

interface ManageCharacterDialogProps {
  onBack: () => void
}

export default function ManageCharacterDialog({ onBack }: ManageCharacterDialogProps) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.user)

  const initialAvatarIndex = Math.max(
    0,
    avatars.findIndex((a) => a.name === currentUser.avatar)
  )

  let initialOutfit: OutfitType = currentUser.outfitType || 'casual'
  if ((initialOutfit as any) === 'suit') initialOutfit = 'worker'
  if ((initialOutfit as any) === 'dress') initialOutfit = 'casual'

  const [name, setName] = useState<string>(currentUser.playerName || 'Guest')
  const [avatarIndex, setAvatarIndex] = useState<number>(initialAvatarIndex)
  const [skinColor, setSkinColor] = useState<string>(currentUser.skinColor || '#f5cfa0')
  const [hairColor, setHairColor] = useState<string>(currentUser.hairColor || '#4a3728')
  const [outfitType, setOutfitType] = useState<OutfitType>(initialOutfit)
  const [outfitColor, setOutfitColor] = useState<string>(currentUser.outfitColor || '#3b82f6')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])

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
  }, [avatarIndex, skinColor, hairColor, outfitType, outfitColor])

  const handleSave = () => {
    const finalName = name.trim() || 'Guest'
    const finalAvatar = avatars[avatarIndex].name

    dispatch(setPlayerName(finalName))
    dispatch(setAvatar(finalAvatar))
    dispatch(
      setAvatarCustomization({
        skinColor,
        hairColor,
        outfitType,
        outfitColor,
      })
    )

    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onBack()
    }, 600)
  }

  return (
    <DialogWrapper>
      <Header>
        <IconButton className="back-btn" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <h2>
          <FaceIcon /> Quản Lý Nhân Vật (Manage Character)
        </h2>
        <div style={{ width: 40 }} />
      </Header>

      <ContentGrid>
        {/* Cột Trái: Avatar Swiper & Live Preview */}
        <AvatarColumn>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Xem trước nhân vật:</div>
          <Swiper
            modules={[Navigation]}
            navigation
            initialSlide={initialAvatarIndex}
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => {
              setAvatarIndex(swiper.activeIndex)
            }}
          >
            {avatars.map((av, idx) => (
              <SwiperSlide key={av.name}>
                <canvas
                  ref={(el) => {
                    canvasRefs.current[idx] = el
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="avatar-label">
            Model: {avatars[avatarIndex].label}
          </div>
        </AvatarColumn>

        {/* Cột Phải: Các tùy chọn màu sắc & trang phục */}
        <ControlsColumn>
          <Section>
            <label>Tên hiển thị trong Workspace</label>
            <TextField
              size="small"
              value={name}
              placeholder="Nhập tên nhân vật..."
              onChange={(e) => setName(e.target.value)}
              sx={{
                '& .MuiInputBase-root': { color: '#ffffff', background: 'rgba(0,0,0,0.2)' },
              }}
            />
          </Section>

          {/* Màu da */}
          <Section>
            <label>Màu Da (Skin Tone)</label>
            <ColorGrid>
              {SKIN_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  $color={color}
                  $active={skinColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setSkinColor(color)}
                />
              ))}
              <ColorPickerInput
                type="color"
                value={skinColor}
                onChange={(e) => setSkinColor(e.target.value)}
              />
            </ColorGrid>
          </Section>

          {/* Màu tóc */}
          <Section>
            <label>Màu Tóc (Hair Color - Đổi Cả Bộ Tóc)</label>
            <ColorGrid>
              {HAIR_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  $color={color}
                  $active={hairColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setHairColor(color)}
                />
              ))}
              <ColorPickerInput
                type="color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
              />
            </ColorGrid>
          </Section>

          {/* Kiểu trang phục */}
          <Section>
            <label>Kiểu Trang Phục</label>
            <OutfitTypeRow>
              {OUTFIT_TYPES.map((ot) => (
                <OutfitTypeButton
                  key={ot.value}
                  $active={outfitType === ot.value}
                  onClick={() => setOutfitType(ot.value)}
                >
                  {ot.label}
                </OutfitTypeButton>
              ))}
            </OutfitTypeRow>
          </Section>

          {/* Màu trang phục */}
          <Section>
            <label>Màu Trang Phục (Outfit Color)</label>
            <ColorGrid>
              {OUTFIT_PRESETS.map((color) => (
                <ColorCircle
                  key={color}
                  $color={color}
                  $active={outfitColor.toLowerCase() === color.toLowerCase()}
                  onClick={() => setOutfitColor(color)}
                />
              ))}
              <ColorPickerInput
                type="color"
                value={outfitColor}
                onChange={(e) => setOutfitColor(e.target.value)}
              />
            </ColorGrid>
          </Section>
        </ControlsColumn>
      </ContentGrid>

      <Bottom>
        <Button variant="outlined" onClick={onBack} sx={{ color: '#94a3b8', borderColor: '#475569', textTransform: 'none' }}>
          Hủy Bỏ
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={handleSave}
          sx={{
            background: savedSuccess ? '#16a34a' : '#0284c7',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { background: '#0369a1' },
          }}
        >
          {savedSuccess ? 'Đã Lưu Thiết Lập!' : 'Lưu Thiết Lập Nhân Vật'}
        </Button>
      </Bottom>
    </DialogWrapper>
  )
}
