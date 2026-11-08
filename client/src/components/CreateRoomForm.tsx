import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SquareFootIcon from '@mui/icons-material/SquareFoot'

import { IRoomData } from '../../../types/Rooms'
import { useAppSelector } from '../hooks'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const CreateRoomFormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  width: 360px;
  gap: 18px;
`

const SizeSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
  }
`

const SizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const SizeCard = styled.div<{ $selected: boolean }>`
  border: 2px solid ${(props) => (props.$selected ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)')};
  background: ${(props) => (props.$selected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)')};
  border-radius: 8px;
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  .name {
    font-size: 12px;
    font-weight: 700;
    color: ${(props) => (props.$selected ? '#38bdf8' : '#f1f5f9')};
  }

  .tiles {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }
`

export const CreateRoomForm = () => {
  const [values, setValues] = useState<IRoomData>({
    name: '',
    description: '',
    password: null,
    autoDispose: false, // Luôn giữ Workspace được lưu trong Manage Workspace
  })
  const [selectedSize, setSelectedSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM')
  const [showPassword, setShowPassword] = useState(false)
  const [nameFieldEmpty, setNameFieldEmpty] = useState(false)
  const [descriptionFieldEmpty, setDescriptionFieldEmpty] = useState(false)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)

  const handleChange = (prop: keyof IRoomData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValidName = values.name !== ''
    const isValidDescription = values.description !== ''

    if (isValidName === nameFieldEmpty) setNameFieldEmpty(!nameFieldEmpty)
    if (isValidDescription === descriptionFieldEmpty)
      setDescriptionFieldEmpty(!descriptionFieldEmpty)

    // create custom room if name and description are not empty
    if (isValidName && isValidDescription && lobbyJoined) {
      let width = 30
      let height = 30
      if (selectedSize === 'SMALL') {
        width = 20
        height = 20
      } else if (selectedSize === 'LARGE') {
        width = 40
        height = 40
      }

      const roomPayload = {
        ...values,
        autoDispose: false,
        sizeType: selectedSize,
        width,
        height,
      }
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.network
        .createCustom(roomPayload)
        .then(() => {
          // Lưu lịch sử Workspace vừa tạo vào localStorage
          try {
            const stored = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
            stored.push({
              name: values.name,
              description: values.description,
              hasPassword: !!values.password,
              createdAt: Date.now(),
              sizeType: selectedSize,
              width,
              height,
            })
            localStorage.setItem('saved_workspaces', JSON.stringify(stored))
          } catch (e) {
            console.error('Failed to cache workspace:', e)
          }

          bootstrap.network.resizeWorkspace(selectedSize, width, height)
          bootstrap.launchGame()
        })
        .catch((error) => console.error(error))
    }
  }

  return (
    <CreateRoomFormWrapper onSubmit={handleSubmit}>
      <TextField
        label="Tên Workspace"
        variant="outlined"
        color="secondary"
        autoFocus
        error={nameFieldEmpty}
        helperText={nameFieldEmpty && 'Vui lòng nhập tên Workspace'}
        onChange={handleChange('name')}
      />

      <SizeSelectorContainer>
        <label>Diện tích Workspace (Grid Area)</label>
        <SizeGrid>
          <SizeCard
            $selected={selectedSize === 'SMALL'}
            onClick={() => setSelectedSize('SMALL')}
          >
            <div className="name">Nhỏ (Small)</div>
            <div className="tiles">400 ô (20x20)</div>
          </SizeCard>
          <SizeCard
            $selected={selectedSize === 'MEDIUM'}
            onClick={() => setSelectedSize('MEDIUM')}
          >
            <div className="name">Vừa (Medium)</div>
            <div className="tiles">900 ô (30x30)</div>
          </SizeCard>
          <SizeCard
            $selected={selectedSize === 'LARGE'}
            onClick={() => setSelectedSize('LARGE')}
          >
            <div className="name">Lớn (Large)</div>
            <div className="tiles">1600 ô (40x40)</div>
          </SizeCard>
        </SizeGrid>
      </SizeSelectorContainer>

      <TextField
        label="Mô tả Workspace"
        variant="outlined"
        color="secondary"
        error={descriptionFieldEmpty}
        helperText={descriptionFieldEmpty && 'Vui lòng nhập mô tả'}
        multiline
        rows={3}
        onChange={handleChange('description')}
      />

      <TextField
        type={showPassword ? 'text' : 'password'}
        label="Mật khẩu bảo vệ (Tùy chọn)"
        onChange={handleChange('password')}
        color="secondary"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        style={{ background: '#0284c7', color: '#ffffff', padding: '10px 0', fontWeight: 700 }}
        type="submit"
      >
        Tạo Workspace & Bắt Đầu
      </Button>
    </CreateRoomFormWrapper>
  )
}
