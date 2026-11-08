import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import {
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Box,
  Typography,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import WeekendIcon from '@mui/icons-material/Weekend'
import CoffeeIcon from '@mui/icons-material/Coffee'
import BusinessIcon from '@mui/icons-material/Business'
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows'
import ChairIcon from '@mui/icons-material/Chair'
import LocalFloristIcon from '@mui/icons-material/LocalFlorist'
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import SettingsIcon from '@mui/icons-material/Settings'
import LayersIcon from '@mui/icons-material/Layers'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { useAppSelector, useAppDispatch } from '../hooks'
import {
  closeDesignMode,
  setSelectedTool,
  setErrorNotice,
  setSuccessNotice,
  clearNotices,
} from '../stores/WorkspaceStore'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import Game from '../scenes/Game'

const DockWrapper = styled.div<{ $collapsed: boolean }>`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(27, 30, 46, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  color: #f1f5f9;
  width: ${(props) => (props.$collapsed ? '320px' : '420px')};
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  transition: width 0.25s ease;
  user-select: none;
`

const DockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #38bdf8;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

const DockContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

const ToolCard = styled.div<{ $active: boolean; $isEraser?: boolean }>`
  background: ${(props) =>
    props.$active
      ? props.$isEraser
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(56, 189, 248, 0.2)'
      : 'rgba(255, 255, 255, 0.04)'};
  border: 2px solid
    ${(props) =>
      props.$active
        ? props.$isEraser
          ? '#ef4444'
          : '#38bdf8'
        : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 12px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$isEraser ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)'};
    border-color: ${(props) => (props.$isEraser ? '#f87171' : '#7dd3fc')};
    transform: translateY(-2px);
  }

  .icon {
    font-size: 26px;
    color: ${(props) =>
      props.$active
        ? props.$isEraser
          ? '#ef4444'
          : '#38bdf8'
        : '#cbd5e1'};
  }

  .label {
    font-size: 12px;
    font-weight: 600;
    color: #f1f5f9;
  }
`

const HintBox = styled.div`
  background: rgba(56, 189, 248, 0.08);
  border: 1px dashed rgba(56, 189, 248, 0.3);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: #93c5fd;
  line-height: 1.5;

  strong {
    color: #38bdf8;
  }
`

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const PresetCard = styled.div<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${(props) => (props.$active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 8px;
  padding: 8px 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  .name {
    font-weight: 700;
    font-size: 12px;
    color: ${(props) => (props.$active ? '#38bdf8' : '#e2e8f0')};
  }
  .info {
    font-size: 11px;
    color: #94a3b8;
  }
`

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const BottomActions = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

export default function DesignWorkspaceDialog() {
  const dispatch = useAppDispatch()
  const { workspace, rooms, furnitures, designMode, selectedTool, errorNotice, successNotice } =
    useAppSelector((state) => state.workspace)

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedSizeType, setSelectedSizeType] = useState(workspace.sizeType || 'MEDIUM')
  const [newWidth, setNewWidth] = useState(workspace.width || 30)
  const [newHeight, setNewHeight] = useState(workspace.height || 30)

  // Phòng phân vùng
  const [roomType, setRoomType] = useState('meeting')
  const [roomName, setRoomName] = useState('')
  const [roomX, setRoomX] = useState(2)
  const [roomY, setRoomY] = useState(2)
  const [roomW, setRoomW] = useState(6)
  const [roomH, setRoomH] = useState(6)

  const tools = [
    { type: 'table', label: 'Bàn Làm Việc', icon: <TableRestaurantIcon className="icon" /> },
    { type: 'chair', label: 'Ghế Ngồi', icon: <ChairIcon className="icon" /> },
    { type: 'computer', label: 'Máy Tính', icon: <DesktopWindowsIcon className="icon" /> },
    { type: 'vase', label: 'Cây / Bình Hoa', icon: <LocalFloristIcon className="icon" /> },
    { type: 'whiteboard', label: 'Bảng Trắng', icon: <AutoFixHighIcon className="icon" /> },
    { type: 'eraser', label: 'Tẩy Xóa', icon: <DeleteOutlineIcon className="icon" />, isEraser: true },
  ]

  const handleToolSelect = (toolType: string) => {
    if (selectedTool === toolType) {
      dispatch(setSelectedTool(null))
    } else {
      dispatch(setSelectedTool(toolType))
      dispatch(clearNotices())
    }
  }

  const handleApplySize = () => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.resizeWorkspace(selectedSizeType, newWidth, newHeight)
    dispatch(setSuccessNotice(`Đã đổi diện tích sang ${newWidth}x${newHeight} ô!`))
  }

  const handleAddRoom = () => {
    const id = `room_${Date.now()}`
    const finalName = roomName.trim() || `Phòng ${roomType}`
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.updateRoom(id, roomType, finalName, roomX, roomY, roomW, roomH)
    setRoomName('')
    dispatch(setSuccessNotice(`Đã tạo phân vùng "${finalName}" thành công!`))
  }

  const handleClose = () => {
    dispatch(setSelectedTool(null))
    dispatch(closeDesignMode())
  }

  if (!designMode) return null

  return (
    <DockWrapper $collapsed={!showAdvanced}>
      <DockHeader>
        <div className="title">
          <SquareFootIcon /> Gather Town Mapmaker
        </div>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DockHeader>

      <DockContent>
        {/* Thông báo Real-time */}
        {errorNotice && (
          <Alert severity="error" onClose={() => dispatch(clearNotices())} sx={{ py: 0.5, fontSize: '12px' }}>
            {errorNotice}
          </Alert>
        )}
        {successNotice && (
          <Alert severity="success" onClose={() => dispatch(clearNotices())} sx={{ py: 0.5, fontSize: '12px' }}>
            {successNotice}
          </Alert>
        )}

        <HintBox>
          👉 <strong>Kéo thả hoặc click chọn</strong> đồ vật bên dưới, sau đó di chuột vào bản đồ (Ghost Preview snap to 32x32) và click để đặt!
          <br />
          ⚠️ <strong>Quy tắc Gather:</strong> Máy tính bắt buộc phải đặt trên Bàn!
        </HintBox>

        {/* Thanh Palette đồ vật kiểu Gather Town */}
        <div>
          <SectionTitle>
            <LayersIcon fontSize="small" /> Chọn Vật Thể (Click hoặc Kéo Thả)
          </SectionTitle>
          <PaletteGrid>
            {tools.map((t) => (
              <ToolCard
                key={t.type}
                $active={selectedTool === t.type}
                $isEraser={t.isEraser}
                onClick={() => handleToolSelect(t.type)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', t.type)
                  dispatch(setSelectedTool(t.type))
                }}
              >
                {t.icon}
                <div className="label">{t.label}</div>
              </ToolCard>
            ))}
          </PaletteGrid>
        </div>

        {/* Nút bật/tắt Cài đặt nâng cao (Phòng & Kích thước) */}
        <div>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            startIcon={<SettingsIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.4)',
              textTransform: 'none',
              fontSize: '12px',
            }}
          >
            {showAdvanced ? 'Thu gọn cài đặt nâng cao' : 'Mở rộng: Kích thước & Phân vùng phòng'}
          </Button>
        </div>

        {showAdvanced && (
          <>
            {/* Cấu hình kích thước Workspace */}
            <div>
              <SectionTitle>
                <SquareFootIcon fontSize="small" /> Diện tích Workspace (Grid)
              </SectionTitle>
              <PresetGrid>
                <PresetCard
                  $active={selectedSizeType === 'SMALL'}
                  onClick={() => {
                    setSelectedSizeType('SMALL')
                    setNewWidth(20)
                    setNewHeight(20)
                  }}
                >
                  <div className="name">Nhỏ (400 ô)</div>
                  <div className="info">20x20</div>
                </PresetCard>
                <PresetCard
                  $active={selectedSizeType === 'MEDIUM'}
                  onClick={() => {
                    setSelectedSizeType('MEDIUM')
                    setNewWidth(30)
                    setNewHeight(30)
                  }}
                >
                  <div className="name">Vừa (900 ô)</div>
                  <div className="info">30x30</div>
                </PresetCard>
                <PresetCard
                  $active={selectedSizeType === 'LARGE'}
                  onClick={() => {
                    setSelectedSizeType('LARGE')
                    setNewWidth(40)
                    setNewHeight(40)
                  }}
                >
                  <div className="name">Lớn (1600 ô)</div>
                  <div className="info">40x40</div>
                </PresetCard>
              </PresetGrid>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={handleApplySize}
                sx={{
                  mt: 1,
                  background: '#0284c7',
                  color: '#fff',
                  textTransform: 'none',
                  fontSize: '12px',
                }}
              >
                Cập Nhật Kích Thước Bản Đồ
              </Button>
            </div>

            {/* Phân vùng phòng chức năng */}
            <div>
              <SectionTitle>
                <MeetingRoomIcon fontSize="small" /> Phân Vùng Phòng (Private Zone)
              </SectionTitle>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ color: '#94a3b8' }}>Loại Phòng</InputLabel>
                  <Select
                    value={roomType}
                    label="Loại Phòng"
                    onChange={(e) => setRoomType(e.target.value)}
                    sx={{ color: '#fff', background: 'rgba(0,0,0,0.2)' }}
                  >
                    <MenuItem value="meeting">Phòng Họp (Meeting)</MenuItem>
                    <MenuItem value="office">Phòng Làm Việc (Office)</MenuItem>
                    <MenuItem value="lounge">Phòng Nghỉ (Lounge)</MenuItem>
                    <MenuItem value="pantry">Khu Pantry (Ăn Uống)</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Tên phòng (Ví dụ: Phòng Họp VIP)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  sx={{ '& .MuiInputBase-root': { color: '#fff', background: 'rgba(0,0,0,0.2)' }, '& .MuiInputLabel-root': { color: '#94a3b8' } }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1 }}>
                  <TextField
                    size="small"
                    label="X"
                    type="number"
                    value={roomX}
                    onChange={(e) => setRoomX(parseInt(e.target.value) || 0)}
                    sx={{ '& .MuiInputBase-root': { color: '#fff', background: 'rgba(0,0,0,0.2)' } }}
                  />
                  <TextField
                    size="small"
                    label="Y"
                    type="number"
                    value={roomY}
                    onChange={(e) => setRoomY(parseInt(e.target.value) || 0)}
                    sx={{ '& .MuiInputBase-root': { color: '#fff', background: 'rgba(0,0,0,0.2)' } }}
                  />
                  <TextField
                    size="small"
                    label="Rộng"
                    type="number"
                    value={roomW}
                    onChange={(e) => setRoomW(parseInt(e.target.value) || 1)}
                    sx={{ '& .MuiInputBase-root': { color: '#fff', background: 'rgba(0,0,0,0.2)' } }}
                  />
                  <TextField
                    size="small"
                    label="Dài"
                    type="number"
                    value={roomH}
                    onChange={(e) => setRoomH(parseInt(e.target.value) || 1)}
                    sx={{ '& .MuiInputBase-root': { color: '#fff', background: 'rgba(0,0,0,0.2)' } }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddRoom}
                  sx={{ color: '#38bdf8', borderColor: '#38bdf8', textTransform: 'none' }}
                >
                  Tạo Phân Vùng Phòng
                </Button>
              </Box>
            </div>
          </>
        )}

        <BottomActions>
          <Button
            variant="contained"
            fullWidth
            startIcon={<CheckCircleIcon />}
            onClick={handleClose}
            sx={{
              background: '#22c55e',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { background: '#16a34a' },
            }}
          >
            Hoàn Tất & Điều Khiển Nhân Vật
          </Button>
        </BottomActions>
      </DockContent>
    </DockWrapper>
  )
}
