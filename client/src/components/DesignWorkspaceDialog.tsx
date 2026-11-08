import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { useAppSelector, useAppDispatch } from '../hooks'
import {
  openDesignMode,
  closeDesignMode,
  setSelectedTool,
  setSuccessNotice,
  clearNotices,
  FurnitureLayoutItem,
  RoomLayoutItem,
} from '../stores/WorkspaceStore'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import { phaserEvents, Event } from '../events/EventCenter'
import { RUG_COLORS } from '../utils/FurnitureTextures'

// ===== STYLED COMPONENTS CHO GIAO DIỆN DESIGN MODE =====

/* Tab mở nhanh cố định ở mép phải khi chưa vào Design Mode */
const SideOpenButton = styled.div`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 99999999 !important;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  padding: 14px 10px;
  border-radius: 12px 0 0 12px;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 12px;
  transition: all 0.2s ease;
  user-select: none;
  pointer-events: auto !important;

  &:hover {
    background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    box-shadow: -6px 0 20px rgba(56, 189, 248, 0.6);
  }

  .text {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 1px;
  }
`

/* BẢNG ĐIỀU KHIỂN CỐ ĐỊNH Ở MÉP PHẢI (Dedicated Right Sidebar) */
const RightSidebar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  z-index: 99999999 !important;
  display: flex;
  flex-direction: column;
  background: #111827;
  border-left: 2px solid #38bdf8;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.85);
  color: #f1f5f9;
  user-select: none;
  pointer-events: auto !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #0f172a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon {
      font-size: 20px;
    }

    .title {
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.5px;
    }
  }

  .close-btn {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #f87171;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #ef4444;
      color: #ffffff;
    }
  }
`

const SidebarBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TabNav = styled.div`
  display: flex;
  gap: 8px;
  background: #1e293b;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  background: ${(props) => (props.$active ? '#0284c7' : 'transparent')};
  color: ${(props) => (props.$active ? '#ffffff' : '#94a3b8')};
  border: none;
  border-radius: 8px;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    color: #ffffff;
    background: ${(props) => (props.$active ? '#0284c7' : 'rgba(255, 255, 255, 0.06)')};
  }
`

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const ToolItem = styled.div<{ $active: boolean; $isEraser?: boolean }>`
  background: ${(props) =>
    props.$active
      ? props.$isEraser
        ? 'rgba(239, 68, 68, 0.25)'
        : 'rgba(56, 189, 248, 0.25)'
      : '#1e293b'};
  border: 2px solid
    ${(props) =>
      props.$active
        ? props.$isEraser
          ? '#ef4444'
          : '#38bdf8'
        : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 10px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${(props) =>
      props.$isEraser ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)'};
    border-color: ${(props) => (props.$isEraser ? '#f87171' : '#7dd3fc')};
    transform: translateY(-2px);
  }

  .emoji {
    font-size: 24px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: #f1f5f9;
  }
`

const StatusBox = styled.div<{ $hasTool: boolean }>`
  background: ${(props) =>
    props.$hasTool ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid
    ${(props) => (props.$hasTool ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;

  .text-highlight {
    color: #38bdf8;
    font-weight: 700;
  }

  .text-muted {
    color: #94a3b8;
  }

  .unselect-btn {
    background: transparent;
    border: none;
    color: #f87171;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    padding: 2px 6px;
    &:hover {
      text-decoration: underline;
    }
  }
`

const InstructionBox = styled.div`
  background: rgba(56, 189, 248, 0.06);
  border: 1px dashed rgba(56, 189, 248, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #93c5fd;
  line-height: 1.5;

  strong {
    color: #38bdf8;
  }
`

const EditBox = styled.div`
  background: #1e293b;
  border: 1px solid #38bdf8;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    font-weight: 700;
    font-size: 13px;
    color: #38bdf8;

    .dismiss-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      &:hover {
        color: #ffffff;
      }
    }
  }

  .input-row {
    display: flex;
    gap: 8px;

    input {
      flex: 1;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 8px 10px;
      color: #ffffff;
      font-size: 13px;
      outline: none;

      &:focus {
        border-color: #38bdf8;
      }
    }

    button {
      background: #0284c7;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: #0369a1;
      }
    }
  }

  .door-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;

    button {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      border-radius: 6px;
      padding: 8px 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: rgba(56, 189, 248, 0.25);
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;

    button {
      flex: 1;
      border-radius: 6px;
      padding: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
    }

    .rotate-btn {
      background: #0284c7;
      color: #ffffff;
      &:hover {
        background: #0369a1;
      }
    }

    .delete-btn {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      &:hover {
        background: #ef4444;
        color: #ffffff;
      }
    }
  }
`

const ColorPaletteBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #1e293b;
  border: 1px solid #38bdf8;
  border-radius: 10px;
  padding: 12px;
  margin-top: 4px;

  .palette-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 700;
    color: #38bdf8;

    .current-color-badge {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
    }
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .color-btn {
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #ffffff;
    font-weight: 700;
    transition: all 0.15s;
    border: 2px solid transparent;

    &:hover {
      transform: scale(1.08);
      border-color: rgba(255, 255, 255, 0.5);
    }

    &.active {
      border-color: #ffffff;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
      transform: scale(1.04);
    }
  }

  .custom-color-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
    padding-top: 8px;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);

    input[type='color'] {
      -webkit-appearance: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      width: 32px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      background: transparent;
      padding: 0;
    }
  }
`

const SidebarFooter = styled.div`
  padding: 16px 20px;
  background: #0f172a;
  border-top: 1px solid rgba(255, 255, 255, 0.12);

  .finish-btn {
    width: 100%;
    background: #22c55e;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover {
      background: #16a34a;
    }
  }
`

const AlertMessage = styled.div<{ $type: 'error' | 'success' }>`
  background: ${(props) =>
    props.$type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)'};
  border: 1px solid
    ${(props) => (props.$type === 'error' ? '#ef4444' : '#22c55e')};
  color: ${(props) => (props.$type === 'error' ? '#fca5a5' : '#86efac')};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .close {
    cursor: pointer;
    font-weight: 700;
  }
`

export default function DesignWorkspaceDialog() {
  const dispatch = useAppDispatch()
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const { designMode, selectedTool, furnitures, errorNotice, successNotice } =
    useAppSelector((state) => state.workspace)

  const [activeTab, setActiveTab] = useState<'furniture' | 'room'>('furniture')
  const [selectedRugColor, setSelectedRugColor] = useState('#2563eb')

  // Tương tác trực tiếp: Nội thất và Phòng được chọn khi click trên map
  const [editingFurniture, setEditingFurniture] = useState<FurnitureLayoutItem | null>(null)
  const [editingRoom, setEditingRoom] = useState<RoomLayoutItem | null>(null)
  const [editingRoomName, setEditingRoomName] = useState('')

  // Lắng nghe sự kiện click từ Phaser Scene
  useEffect(() => {
    const onOpenFurn = (furn: FurnitureLayoutItem) => {
      setEditingFurniture(furn)
      setEditingRoom(null)
    }
    const onOpenRoom = (room: RoomLayoutItem) => {
      setEditingRoom(room)
      setEditingRoomName(room.name)
      setEditingFurniture(null)
    }

    phaserEvents.on(Event.OPEN_FURNITURE_DIALOG, onOpenFurn)
    phaserEvents.on(Event.OPEN_ROOM_DIALOG, onOpenRoom)

    return () => {
      phaserEvents.off(Event.OPEN_FURNITURE_DIALOG, onOpenFurn)
      phaserEvents.off(Event.OPEN_ROOM_DIALOG, onOpenRoom)
    }
  }, [])

  // Danh sách Nội thất
  const furnitureTools = [
    { type: 'table', label: 'Bàn Làm Việc', emoji: '🪵' },
    { type: 'chair', label: 'Ghế Ngồi', emoji: '💺' },
    { type: 'computer', label: 'Máy Tính (Trên Bàn)', emoji: '🖥️' },
    { type: 'vase', label: 'Bình Hoa Tươi', emoji: '🏺' },
    { type: 'rug', label: 'Thảm Trải Sàn', emoji: '🧶', hasColorPicker: true },
    { type: 'whiteboard', label: 'Bảng Trắng', emoji: '📋' },
    { type: 'vendingmachine', label: 'Máy Bán Nước', emoji: '🥤' },
    { type: 'eraser', label: 'Tẩy Xóa Đồ', emoji: '🧹', isEraser: true },
  ]

  // Danh sách Phân vùng phòng
  const roomTools = [
    { type: 'room_meeting', label: 'Phòng Họp', emoji: '👥' },
    { type: 'room_office', label: 'Phòng Làm Việc', emoji: '💼' },
    { type: 'room_lounge', label: 'Phòng Nghỉ', emoji: '🛋️' },
    { type: 'room_pantry', label: 'Khu Pantry', emoji: '☕' },
    { type: 'eraser', label: 'Xóa Phòng', emoji: '❌', isEraser: true },
  ]

  const handleToolSelect = (toolType: string) => {
    const isRug = toolType === 'rug' || toolType.startsWith('rug')
    const activeIsRug = selectedTool === 'rug' || selectedTool?.startsWith('rug')

    if (isRug && activeIsRug) {
      dispatch(setSelectedTool(null))
      return
    }
    if (selectedTool === toolType) {
      dispatch(setSelectedTool(null))
      return
    }

    const finalType = isRug ? `rug:${selectedRugColor}` : toolType
    dispatch(setSelectedTool(finalType))
    dispatch(clearNotices())
    phaserEvents.emit('select-furniture', finalType)
  }

  const handleColorChange = (hex: string) => {
    setSelectedRugColor(hex)
    dispatch(setSelectedTool(`rug:${hex}`))
    dispatch(clearNotices())
    phaserEvents.emit('select-furniture', `rug:${hex}`)
  }

  // --- NỘI THẤT: Đổi hướng xoay 90° & Xóa ---
  const handleRotateFurniture = () => {
    if (!editingFurniture) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const nextOrientation = ((editingFurniture.orientation || 0) + 1) % 4
    bootstrap.network.placeFurniture({
      ...editingFurniture,
      orientation: nextOrientation,
    })
    setEditingFurniture({ ...editingFurniture, orientation: nextOrientation })

    // Nếu xoay Bàn: Tự động xoay luôn máy tính đang đặt trên bàn đó
    if (editingFurniture.itemType === 'table') {
      const computerOnTable = Object.values(furnitures).find(
        (f) =>
          f.itemType === 'computer' &&
          f.gridX === editingFurniture.gridX &&
          f.gridY === editingFurniture.gridY
      )
      if (computerOnTable) {
        bootstrap.network.placeFurniture({
          ...computerOnTable,
          orientation: nextOrientation,
        })
      }
    }

    // Nếu xoay Máy tính: Tự động xoay luôn chiếc bàn bên dưới
    if (editingFurniture.itemType === 'computer') {
      const tableUnderComputer = Object.values(furnitures).find(
        (f) =>
          f.itemType === 'table' &&
          f.gridX === editingFurniture.gridX &&
          f.gridY === editingFurniture.gridY
      )
      if (tableUnderComputer) {
        bootstrap.network.placeFurniture({
          ...tableUnderComputer,
          orientation: nextOrientation,
        })
      }
    }

    dispatch(setSuccessNotice('Đã xoay hướng nội thất 90° (Bàn & Máy tính đồng bộ hướng)!'))
  }

  const handleDeleteFurniture = () => {
    if (!editingFurniture) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.removeFurniture(editingFurniture.id)
    dispatch(setSuccessNotice('Đã xóa nội thất khỏi bản đồ!'))
    setEditingFurniture(null)
  }

  // --- PHÒNG: Đổi tên, Đổi vị trí cửa trên tường & Xóa phòng ---
  const handleSaveRoomName = () => {
    if (!editingRoom) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const newName = editingRoomName.trim() || editingRoom.name
    bootstrap.network.updateRoom({
      ...editingRoom,
      name: newName,
    })
    setEditingRoom({ ...editingRoom, name: newName })
    dispatch(setSuccessNotice(`Đã đổi tên phòng thành: "${newName}"!`))
  }

  const handleChangeDoorPosition = (side: 'bottom' | 'top' | 'left' | 'right') => {
    if (!editingRoom) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    let doorX = editingRoom.doorX
    let doorY = editingRoom.doorY

    if (side === 'bottom') {
      doorX = Math.floor(editingRoom.gridX + editingRoom.width / 2)
      doorY = editingRoom.gridY + editingRoom.height - 1
    } else if (side === 'top') {
      doorX = Math.floor(editingRoom.gridX + editingRoom.width / 2)
      doorY = editingRoom.gridY
    } else if (side === 'left') {
      doorX = editingRoom.gridX
      doorY = Math.floor(editingRoom.gridY + editingRoom.height / 2)
    } else if (side === 'right') {
      doorX = editingRoom.gridX + editingRoom.width - 1
      doorY = Math.floor(editingRoom.gridY + editingRoom.height / 2)
    }

    bootstrap.network.updateRoom({
      ...editingRoom,
      doorX,
      doorY,
    })
    setEditingRoom({ ...editingRoom, doorX, doorY })
    dispatch(
      setSuccessNotice(
        `Đã chuyển cửa sang ${
          side === 'bottom'
            ? 'Cạnh Dưới'
            : side === 'top'
            ? 'Cạnh Trên'
            : side === 'left'
            ? 'Cạnh Trái'
            : 'Cạnh Phải'
        }!`
      )
    )
  }

  const handleDeleteRoom = () => {
    if (!editingRoom) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.removeRoom(editingRoom.id)
    dispatch(setSuccessNotice(`Đã xóa phòng "${editingRoom.name}"!`))
    setEditingRoom(null)
  }

  const handleClose = () => {
    dispatch(setSelectedTool(null))
    setEditingFurniture(null)
    setEditingRoom(null)
    dispatch(closeDesignMode())
  }

  // Khi chưa vào phòng thì không hiển thị gì
  if (!loggedIn && !roomJoined) return null

  // Khi chưa mở Design Mode -> Nút Tab mở nhanh ghim cố định ở mép phải
  if (!designMode) {
    return ReactDOM.createPortal(
      <SideOpenButton
        onClick={() => dispatch(openDesignMode())}
        title="Bấm để Mở Bảng Thiết Kế Workspace (Nội Thất & Phòng)"
      >
        <span style={{ fontSize: '18px' }}>🎨</span>
        <span className="text">THIẾT KẾ WORKSPACE</span>
      </SideOpenButton>,
      document.body
    )
  }

  const furnitureLabels: Record<string, string> = {
    table: 'Bàn Làm Việc',
    chair: 'Ghế Ngồi',
    computer: 'Máy Tính (Trên Bàn)',
    vase: 'Bình Hoa Tươi',
    rug: 'Thảm Trải Sàn',
    whiteboard: 'Bảng Trắng',
    vendingmachine: 'Máy Bán Nước',
  }

  const getFurnitureName = (type: string) => {
    if (!type) return ''
    if (type.startsWith('rug')) {
      const color = type.split(':')[1]
      const colorObj = RUG_COLORS.find((c) => c.hex.toLowerCase() === color?.toLowerCase())
      return colorObj ? `Thảm Trải Sàn (${colorObj.name})` : 'Thảm Trải Sàn'
    }
    return furnitureLabels[type] || type
  }

  const currentToolLabel = selectedTool?.startsWith('rug')
    ? (() => {
        const color = selectedTool.split(':')[1] || selectedRugColor
        const colorObj = RUG_COLORS.find((c) => c.hex.toLowerCase() === color.toLowerCase())
        return `Thảm Trải Sàn (${colorObj ? colorObj.name : color})`
      })()
    : furnitureTools.find((f) => f.type === selectedTool)?.label ||
      roomTools.find((r) => r.type === selectedTool)?.label ||
      selectedTool

  return ReactDOM.createPortal(
    <RightSidebar>
      <SidebarHeader>
        <div className="title-group">
          <span className="icon">🎨</span>
          <span className="title">THIẾT KẾ WORKSPACE</span>
        </div>
        <button className="close-btn" onClick={handleClose}>
          ✕ Đóng
        </button>
      </SidebarHeader>

      <SidebarBody>
        {/* Thông báo Real-time */}
        {errorNotice && (
          <AlertMessage $type="error">
            <span>⚠️ {errorNotice}</span>
            <span className="close" onClick={() => dispatch(clearNotices())}>✕</span>
          </AlertMessage>
        )}
        {successNotice && (
          <AlertMessage $type="success">
            <span>✅ {successNotice}</span>
            <span className="close" onClick={() => dispatch(clearNotices())}>✕</span>
          </AlertMessage>
        )}

        {/* Trạng thái công cụ đang chọn */}
        <StatusBox $hasTool={!!selectedTool}>
          <div>
            {selectedTool ? (
              <span className="text-highlight">
                🖌️ Đang chọn: {currentToolLabel}
              </span>
            ) : (
              <span className="text-muted">
                👆 Con trỏ tự do: Click vào đồ hoặc phòng trên map để sửa
              </span>
            )}
          </div>
          {selectedTool && (
            <button className="unselect-btn" onClick={() => dispatch(setSelectedTool(null))}>
              Bỏ chọn
            </button>
          )}
        </StatusBox>

        {/* Panel Chỉnh sửa Nội thất khi click vào món đồ trên map */}
        {editingFurniture && (
          <EditBox>
            <div className="header">
              <span>🛋️ Chỉnh Sửa Nội Thất Đã Chọn</span>
              <button className="dismiss-btn" onClick={() => setEditingFurniture(null)}>✕</button>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <strong>Vật phẩm:</strong> {getFurnitureName(editingFurniture.itemType)}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Tọa độ: ({editingFurniture.gridX}, {editingFurniture.gridY}) | Hướng: {
                ['Mặt trước (Trước)', 'Mặt trái (Trái)', 'Mặt sau (Sau)', 'Mặt phải (Phải)'][
                  (editingFurniture.orientation || 0) % 4
                ]
              }
            </div>

            {/* Nếu là thảm: Cho phép đổi màu trực tiếp */}
            {editingFurniture.itemType.startsWith('rug') && (
              <div style={{ marginTop: '2px' }}>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Đổi màu thảm đã đặt:
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {RUG_COLORS.map((c) => (
                    <div
                      key={c.hex}
                      onClick={() => {
                        const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
                        bootstrap.network.placeFurniture({
                          ...editingFurniture,
                          itemType: `rug:${c.hex}`,
                        })
                        setEditingFurniture({ ...editingFurniture, itemType: `rug:${c.hex}` })
                        dispatch(setSuccessNotice(`Đã đổi màu thảm sang ${c.name}!`))
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: c.hex,
                        cursor: 'pointer',
                        border:
                          editingFurniture.itemType === `rug:${c.hex}`
                            ? '2px solid #ffffff'
                            : '1px solid rgba(255,255,255,0.25)',
                        boxShadow:
                          editingFurniture.itemType === `rug:${c.hex}`
                            ? '0 0 8px rgba(255,255,255,0.7)'
                            : 'none',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="rotate-btn" onClick={handleRotateFurniture}>
                🔄 Đổi Hướng (Trước / Trái / Sau / Phải)
              </button>
              <button className="delete-btn" onClick={handleDeleteFurniture}>
                🗑️ Xóa Khỏi Map
              </button>
            </div>
          </EditBox>
        )}

        {/* Panel Chỉnh sửa Phòng khi click vào phòng trên map */}
        {editingRoom && (
          <EditBox>
            <div className="header">
              <span>🚪 Cấu Hình Phòng: {editingRoom.name}</span>
              <button className="dismiss-btn" onClick={() => setEditingRoom(null)}>✕</button>
            </div>

            {/* Đổi tên phòng */}
            <div className="input-row">
              <input
                type="text"
                value={editingRoomName}
                onChange={(e) => setEditingRoomName(e.target.value)}
                placeholder="Nhập tên phòng mới..."
              />
              <button onClick={handleSaveRoomName}>Lưu Tên</button>
            </div>

            {/* Đổi vị trí cửa ra vào trên tường */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                ĐỔI VỊ TRÍ CỬA TRÊN TƯỜNG (VẬT CẢN):
              </div>
              <div className="door-buttons">
                <button onClick={() => handleChangeDoorPosition('bottom')}>🚪 Cạnh Dưới</button>
                <button onClick={() => handleChangeDoorPosition('top')}>🚪 Cạnh Trên</button>
                <button onClick={() => handleChangeDoorPosition('left')}>🚪 Cạnh Trái</button>
                <button onClick={() => handleChangeDoorPosition('right')}>🚪 Cạnh Phải</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="delete-btn" onClick={handleDeleteRoom}>
                🗑️ Xóa Phòng Này
              </button>
            </div>
          </EditBox>
        )}

        {/* Thanh chuyển đổi 2 Tab */}
        <TabNav>
          <TabButton
            $active={activeTab === 'furniture'}
            onClick={() => {
              setActiveTab('furniture')
              dispatch(setSelectedTool(null))
              dispatch(clearNotices())
            }}
          >
            🛋️ Đặt Nội Thất
          </TabButton>
          <TabButton
            $active={activeTab === 'room'}
            onClick={() => {
              setActiveTab('room')
              dispatch(setSelectedTool(null))
              dispatch(clearNotices())
            }}
          >
            🚪 Phân Vùng Phòng
          </TabButton>
        </TabNav>

        {/* TAB 1: ĐẶT NỘI THẤT */}
        {activeTab === 'furniture' && (
          <>
            <InstructionBox>
              👉 <strong>Click chọn vật thể</strong> rồi click vào ô trên map để đặt (<strong>Máy tính bắt buộc phải đặt trên Bàn</strong>). Khi chọn <strong>Thảm Trải Sàn</strong>, bạn có thể <strong>chọn màu sắc yêu thích</strong> bên dưới trước khi đặt! Click trực tiếp vào món đồ trên map để Xoay hoặc Xóa.
            </InstructionBox>
            <ToolGrid>
              {furnitureTools.map((t) => (
                <ToolItem
                  key={t.type}
                  $active={
                    t.type === 'rug'
                      ? !!selectedTool?.startsWith('rug')
                      : selectedTool === t.type
                  }
                  $isEraser={t.isEraser}
                  onClick={() => handleToolSelect(t.type)}
                >
                  <span className="emoji">{t.emoji}</span>
                  <span className="label">{t.label}</span>
                </ToolItem>
              ))}
            </ToolGrid>

            {/* BẢNG CHỌN MÀU THẢM (Hiển thị khi chọn công cụ Thảm Trải Sàn) */}
            {selectedTool?.startsWith('rug') && (
              <ColorPaletteBox>
                <div className="palette-header">
                  <span>🎨 Chọn Màu Thảm Trước Khi Đặt:</span>
                  <span
                    className="current-color-badge"
                    style={{ background: selectedRugColor }}
                  />
                </div>
                <div className="color-grid">
                  {RUG_COLORS.map((c) => (
                    <div
                      key={c.hex}
                      className={`color-btn ${
                        selectedRugColor.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''
                      }`}
                      style={{ background: c.hex }}
                      onClick={() => handleColorChange(c.hex)}
                      title={c.name}
                    >
                      {selectedRugColor.toLowerCase() === c.hex.toLowerCase() && '✓'}
                    </div>
                  ))}
                </div>
                <div className="custom-color-row">
                  <label>Màu tùy chỉnh khác:</label>
                  <input
                    type="color"
                    value={selectedRugColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                  />
                  <span>{selectedRugColor.toUpperCase()}</span>
                </div>
              </ColorPaletteBox>
            )}
          </>
        )}

        {/* TAB 2: PHÂN VÙNG PHÒNG (KÉO THẢ DIỆN TÍCH TÙY Ý) */}
        {activeTab === 'room' && (
          <>
            <InstructionBox>
              👉 <strong>Click chọn loại phòng</strong> rồi <strong>NHẤN GIỮ CHUỘT TRÁI VÀ KÉO (Drag & Drop)</strong> trên bản đồ để tạo phòng có tường bao quanh và cửa ra vào.
            </InstructionBox>
            <ToolGrid>
              {roomTools.map((t) => (
                <ToolItem
                  key={t.type}
                  $active={selectedTool === t.type}
                  $isEraser={t.isEraser}
                  onClick={() => handleToolSelect(t.type)}
                >
                  <span className="emoji">{t.emoji}</span>
                  <span className="label">{t.label}</span>
                </ToolItem>
              ))}
            </ToolGrid>
          </>
        )}
      </SidebarBody>

      <SidebarFooter>
        <button className="finish-btn" onClick={handleClose}>
          ✓ Hoàn Tất & Điều Khiển Nhân Vật
        </button>
      </SidebarFooter>
    </RightSidebar>,
    document.body
  )
}
