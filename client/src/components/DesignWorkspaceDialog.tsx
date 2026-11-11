import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { useAppSelector, useAppDispatch } from '../hooks'
import {
  openDesignMode,
  closeDesignMode,
  setSelectedTool,
  setCloneTemplate,
  setCloneTemplates,
  setCloneContinuous,
  clearSelectedFurnitureIds,
  setSuccessNotice,
  setErrorNotice,
  clearNotices,
  setCurrentFloor,
  FurnitureLayoutItem,
  RoomLayoutItem,
} from '../stores/WorkspaceStore'
import store from '../stores'
import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'
import Game from '../scenes/Game'
import { phaserEvents, Event } from '../events/EventCenter'
import { RUG_COLORS } from '../utils/FurnitureTextures'

export const FURNITURE_COLORS = [
  { name: 'Mặc định (Trắng)', hex: '#ffffff' },
  { name: 'Xanh Lam', hex: '#2563eb' },
  { name: 'Xanh Da Trời', hex: '#38bdf8' },
  { name: 'Xanh Lá', hex: '#16a34a' },
  { name: 'Đỏ', hex: '#dc2626' },
  { name: 'Cam', hex: '#ea580c' },
  { name: 'Vàng', hex: '#eab308' },
  { name: 'Tím', hex: '#7c3aed' },
  { name: 'Hồng', hex: '#ec4899' },
  { name: 'Nâu Cổ Điển', hex: '#854d0e' },
  { name: 'Xám Ghi', hex: '#64748b' },
]

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
    flex-wrap: wrap;

    button {
      flex: 1 1 calc(50% - 4px);
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

    .copy-btn {
      background: #4f46e5;
      color: #ffffff;
      &:hover {
        background: #4338ca;
      }
    }

    .clone-btn {
      background: #059669;
      color: #ffffff;
      &:hover {
        background: #047857;
      }
    }

    .continuous-clone-btn {
      background: #7c3aed;
      color: #ffffff;
      &:hover {
        background: #6d28d9;
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

const FloorCard = styled.div<{ $isCurrent: boolean }>`
  background: ${(props) => (props.$isCurrent ? 'rgba(2, 132, 199, 0.15)' : '#1e293b')};
  border: 1px solid
    ${(props) => (props.$isCurrent ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .floor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .floor-title {
      font-weight: 700;
      font-size: 13px;
      color: ${(props) => (props.$isCurrent ? '#38bdf8' : '#f1f5f9')};
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .badge {
      background: #0284c7;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .door-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .door-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0.25);
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    color: #cbd5e1;

    .door-edit-btn {
      background: #334155;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        background: #0284c7;
        color: #ffffff;
      }
    }
  }

  .floor-actions {
    display: flex;
    gap: 6px;
    margin-top: 4px;

    button {
      flex: 1;
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }

    .switch-btn {
      background: #0284c7;
      color: #ffffff;
      &:hover {
        background: #0369a1;
      }
    }

    .delete-floor-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      &:hover {
        background: #ef4444;
        color: #ffffff;
      }
    }
  }
`

const AddFloorButton = styled.button`
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);

  &:hover {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }
`

const FloorPillContainer = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`

const FloorPill = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? '#0284c7' : '#1e293b')};
  color: ${(props) => (props.$active ? '#ffffff' : '#94a3b8')};
  border: 1px solid
    ${(props) => (props.$active ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;

  &:hover {
    background: ${(props) => (props.$active ? '#0284c7' : 'rgba(255, 255, 255, 0.08)')};
    color: #ffffff;
  }
`

export default function DesignWorkspaceDialog() {
  const dispatch = useAppDispatch()
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const roomJoined = useAppSelector((state) => state.room.roomJoined)
  const {
    designMode,
    selectedTool,
    cloneTemplate,
    cloneTemplates,
    cloneContinuous,
    selectedFurnitureIds,
    furnitures,
    currentFloor,
    floorsConfig,
    errorNotice,
    successNotice,
  } = useAppSelector((state) => state.workspace)

  const [activeTab, setActiveTab] = useState<'furniture' | 'room' | 'floor'>('furniture')
  const [selectedRugColor, setSelectedRugColor] = useState('#2563eb')

  // Tương tác trực tiếp: Nội thất và Phòng được chọn khi click trên map
  const [editingFurniture, setEditingFurniture] = useState<FurnitureLayoutItem | null>(null)
  const [tileFurnitures, setTileFurnitures] = useState<FurnitureLayoutItem[]>([])
  const [selectedCloneIds, setSelectedCloneIds] = useState<string[]>([])
  const [editingRoom, setEditingRoom] = useState<RoomLayoutItem | null>(null)
  const [editingRoomName, setEditingRoomName] = useState('')
  const [clipboardItem, setClipboardItem] = useState<FurnitureLayoutItem | null>(null)

  // Lắng nghe sự kiện click từ Phaser Scene
  useEffect(() => {
    const onOpenFurn = (furnOrFurns: FurnitureLayoutItem | FurnitureLayoutItem[]) => {
      const furnList = Array.isArray(furnOrFurns) ? furnOrFurns : [furnOrFurns]
      // Sắp xếp thứ tự layer: Thảm -> Bàn/Ghế/Vật phẩm -> Máy tính
      const sortedFurnList = [...furnList].sort((a, b) => {
        const getWeight = (item: FurnitureLayoutItem) => {
          if (item.itemType.startsWith('rug')) return 1
          if (item.itemType === 'computer') return 3
          return 2
        }
        return getWeight(a) - getWeight(b)
      })

      setTileFurnitures(sortedFurnList)
      // Ưu tiên chọn bàn hoặc vật thể đặc làm item sửa mặc định, nếu không thì máy tính hoặc thảm
      const primaryItem =
        sortedFurnList.find(
          (f) => !f.itemType.startsWith('rug') && f.itemType !== 'computer'
        ) ||
        sortedFurnList.find((f) => f.itemType === 'computer') ||
        sortedFurnList[0] ||
        null

      setEditingFurniture(primaryItem)
      setSelectedCloneIds(sortedFurnList.map((f) => f.id))
      setEditingRoom(null)
    }
    const onOpenRoom = (room: RoomLayoutItem) => {
      setEditingRoom(room)
      setEditingRoomName(room.name)
      setEditingFurniture(null)
      setTileFurnitures([])
      setSelectedCloneIds([])
    }

    phaserEvents.on(Event.OPEN_FURNITURE_DIALOG, onOpenFurn)
    phaserEvents.on(Event.OPEN_ROOM_DIALOG, onOpenRoom)

    return () => {
      phaserEvents.off(Event.OPEN_FURNITURE_DIALOG, onOpenFurn)
      phaserEvents.off(Event.OPEN_ROOM_DIALOG, onOpenRoom)
    }
  }, [])

  // Danh sách Nội thất & Ngoại thất cảnh quan
  const furnitureTools = [
    { type: 'table', label: 'Bàn Làm Việc', emoji: '🪵' },
    { type: 'chair', label: 'Ghế Ngồi', emoji: '💺' },
    { type: 'computer', label: 'Máy Tính (Trên Bàn)', emoji: '🖥️' },
    { type: 'vase', label: 'Bình Hoa Tươi', emoji: '🏺' },
    { type: 'rug', label: 'Thảm Trải Sàn', emoji: '🧶', hasColorPicker: true },
    { type: 'whiteboard', label: 'Bảng Trắng', emoji: '📋' },
    { type: 'wall', label: 'Tường / Vách Trơn', emoji: '🧱' },
    { type: 'grass', label: 'Thảm Cỏ', emoji: '🌱' },
    { type: 'tree_large', label: 'Cây Lớn Quả', emoji: '🌳' },
    { type: 'tree_small', label: 'Cây Cảnh Nhỏ', emoji: '🪴' },
    { type: 'bush', label: 'Bụi Cỏ / Hoa', emoji: '🌿' },
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
    // Trừ thảm trải sàn & thảm cỏ (không áp dụng đổi hướng)
    if (editingFurniture.itemType.startsWith('rug') || editingFurniture.itemType === 'grass') return

    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const nextOrientation = ((editingFurniture.orientation || 0) + 1) % 4
    const chairDirections = ['down', 'left', 'up', 'right']
    const nextDirection = chairDirections[nextOrientation]

    const updatedFurniture = {
      ...editingFurniture,
      orientation: nextOrientation,
      itemDirection:
        editingFurniture.itemType === 'chair' ? nextDirection : editingFurniture.itemDirection,
    }

    bootstrap.network.placeFurniture(updatedFurniture)
    setEditingFurniture(updatedFurniture)
    setTileFurnitures((prev) =>
      prev.map((f) => (f.id === updatedFurniture.id ? updatedFurniture : f))
    )

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

    const directionNames = ['Mặt Trước (Xuống)', 'Mặt Trái', 'Mặt Sau (Lên)', 'Mặt Phải']
    dispatch(setSuccessNotice(`Đã đổi hướng sang: ${directionNames[nextOrientation]}!`))
  }

  const handleDeleteFurniture = () => {
    if (!editingFurniture) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.removeFurniture(editingFurniture.id)
    dispatch(setSuccessNotice('Đã xóa nội thất khỏi bản đồ!'))
    const remaining = tileFurnitures.filter((f) => f.id !== editingFurniture.id)
    setTileFurnitures(remaining)
    setSelectedCloneIds((prev) => prev.filter((id) => id !== editingFurniture.id))
    setEditingFurniture(remaining.length > 0 ? remaining[0] : null)
  }

  // --- COPY / PASTE & CLONE NỘI THẤT ---
  // Bắt đầu chế độ nhân bản: Chọn nội thất -> Nhân bản -> Click vào vị trí cần đặt
  const handleStartClone = (continuous = false, explicitItem?: FurnitureLayoutItem) => {
    let itemsToClone: FurnitureLayoutItem[] = []
    if (explicitItem) {
      itemsToClone = [explicitItem]
    } else if (tileFurnitures.length > 1) {
      itemsToClone = tileFurnitures.filter((f) => selectedCloneIds.includes(f.id))
      if (itemsToClone.length === 0) {
        dispatch(setErrorNotice('Vui lòng tích chọn ít nhất một vật phẩm để nhân bản!'))
        return
      }
    } else if (editingFurniture) {
      itemsToClone = [editingFurniture]
    } else if (tileFurnitures.length === 1) {
      itemsToClone = [tileFurnitures[0]]
    }

    if (itemsToClone.length === 0) return

    // Sắp xếp thứ tự: Thảm (1) -> Bàn / Vật thể khác (2) -> Máy tính (3)
    const sorted = [...itemsToClone].sort((a, b) => {
      const getWeight = (item: FurnitureLayoutItem) => {
        if (item.itemType.startsWith('rug')) return 1
        if (item.itemType === 'computer') return 3
        return 2
      }
      return getWeight(a) - getWeight(b)
    })

    dispatch(setCloneTemplates(sorted))
    dispatch(setCloneContinuous(continuous))
    dispatch(setSelectedTool('clone'))
    dispatch(clearNotices())
    setEditingFurniture(null)
    setTileFurnitures([])
    setSelectedCloneIds([])

    const names = sorted.map((it) => getFurnitureName(it.itemType)).join(' + ')
    if (continuous) {
      dispatch(
        setSuccessNotice(
          `♾️ Đang nhân bản liên tục [${names}]. Hãy bấm các ô trên bản đồ để đặt (Nhấn ESC hoặc Bỏ chọn để dừng)!`
        )
      )
    } else {
      dispatch(
        setSuccessNotice(
          `👉 Đang nhân bản [${names}]. Hãy bấm vào vị trí trên bản đồ để đặt!`
        )
      )
    }
  }

  const cloneItem = (originalItem: FurnitureLayoutItem, targetX?: number, targetY?: number) => {
    const ws = store.getState().workspace
    const wsW = ws.workspace.width || 30
    const wsH = ws.workspace.height || 30

    let newX = targetX !== undefined ? targetX : originalItem.gridX + 1
    let newY = targetY !== undefined ? targetY : originalItem.gridY

    if (newX >= wsW) {
      newX = Math.max(0, originalItem.gridX - 1)
    }
    if (newY >= wsH) {
      newY = Math.max(0, originalItem.gridY - 1)
    }

    const clonedItemData = {
      name: (originalItem as any).name || originalItem.itemType,
      id: `${originalItem.itemType.split(':')[0]}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      itemType: originalItem.itemType,
      gridX: newX,
      gridY: newY,
      x: newX,
      y: newY,
      orientation: originalItem.orientation || 0,
      itemDirection: originalItem.itemDirection,
      tint: originalItem.tint || 0xffffff, // Lấy màu hiện tại
    }

    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    bootstrap.network.placeFurniture(clonedItemData)
    dispatch(
      setSuccessNotice(
        `Đã nhân bản "${getFurnitureName(originalItem.itemType)}" tại ô (${newX}, ${newY})!`
      )
    )
    return clonedItemData
  }

  const handleCopyFurniture = (furnToCopy?: FurnitureLayoutItem) => {
    const item = furnToCopy || editingFurniture
    if (!item) return
    setClipboardItem(item)
    dispatch(
      setSuccessNotice(
        `Đã sao chép "${getFurnitureName(item.itemType)}"! Nhấn Dán hoặc phím Ctrl+V để dán vào vị trí mong muốn.`
      )
    )
  }

  const handlePasteFurniture = () => {
    if (!clipboardItem) {
      dispatch(setErrorNotice('Chưa có nội thất nào trong bộ nhớ đệm để dán!'))
      return
    }
    handleStartClone(false, clipboardItem)
  }

  // Xóa hàng loạt các nội thất đã quét chọn bằng Shift + Kéo chuột
  const handleDeleteMultiSelected = () => {
    if (selectedFurnitureIds.length === 0) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const count = selectedFurnitureIds.length
    selectedFurnitureIds.forEach((id) => {
      bootstrap.network.removeFurniture(id)
    })
    dispatch(clearSelectedFurnitureIds())
    const game = phaserGame.scene.keys.game as Game
    if (game?.drawSelectedHighlights) {
      game.drawSelectedHighlights([])
    }
    dispatch(setSuccessNotice(`Đã xóa nhanh ${count} nội thất khỏi bản đồ!`))
  }

  // Lắng nghe phím tắt Copy (Ctrl+C), Paste (Ctrl+V), Xóa (Delete/Backspace) và Hủy (ESC) trong Design Mode
  useEffect(() => {
    if (!designMode) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase()
      if (activeTag === 'input' || activeTag === 'textarea') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFurnitureIds.length > 0) {
          e.preventDefault()
          handleDeleteMultiSelected()
          return
        }
        if (editingFurniture) {
          e.preventDefault()
          handleDeleteFurniture()
          return
        }
      } else if (e.key === 'Escape') {
        if (selectedFurnitureIds.length > 0) {
          e.preventDefault()
          dispatch(clearSelectedFurnitureIds())
          const game = phaserGame.scene.keys.game as Game
          if (game?.drawSelectedHighlights) game.drawSelectedHighlights([])
          dispatch(setSuccessNotice('Đã hủy chọn các nội thất.'))
          return
        }
        if (selectedTool) {
          e.preventDefault()
          dispatch(setSelectedTool(null))
          dispatch(setCloneTemplate(null))
          dispatch(setCloneTemplates([]))
          dispatch(setCloneContinuous(false))
          dispatch(setSuccessNotice('Đã dừng chế độ đặt / nhân bản.'))
        } else if (editingFurniture) {
          e.preventDefault()
          setEditingFurniture(null)
          setTileFurnitures([])
          setSelectedCloneIds([])
        } else if (editingRoom) {
          e.preventDefault()
          setEditingRoom(null)
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (
          editingFurniture &&
          !editingFurniture.itemType.startsWith('rug') &&
          editingFurniture.itemType !== 'grass'
        ) {
          e.preventDefault()
          handleRotateFurniture()
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (editingFurniture) {
          e.preventDefault()
          handleCopyFurniture(editingFurniture)
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (clipboardItem) {
          e.preventDefault()
          handlePasteFurniture()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [designMode, editingFurniture, editingRoom, selectedTool, clipboardItem, selectedFurnitureIds])

  // --- ĐỔI MÀU NỘI THẤT (Tất cả generic trừ computer & whiteboard) ---
  const handleFurnitureColorChange = (hex: string) => {
    if (!editingFurniture) return
    if (editingFurniture.itemType === 'computer' || editingFurniture.itemType === 'whiteboard') return

    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const tintNum = parseInt(hex.replace('#', ''), 16)
    if (editingFurniture.itemType.startsWith('rug')) {
      const updated = {
        ...editingFurniture,
        itemType: `rug:${hex}`,
        tint: tintNum,
      }
      bootstrap.network.placeFurniture(updated)
      setEditingFurniture(updated)
      setTileFurnitures((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      )
      dispatch(setSuccessNotice(`Đã đổi màu thảm sang ${hex}!`))
    } else {
      const updated = {
        ...editingFurniture,
        tint: tintNum,
      }
      bootstrap.network.placeFurniture(updated)
      setEditingFurniture(updated)
      setTileFurnitures((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      )
      dispatch(setSuccessNotice(`Đã đổi màu nội thất sang ${hex}!`))
    }
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
    dispatch(setCloneTemplate(null))
    dispatch(setCloneTemplates([]))
    dispatch(setCloneContinuous(false))
    dispatch(clearSelectedFurnitureIds())
    const game = phaserGame.scene.keys.game as Game
    if (game?.drawSelectedHighlights) game.drawSelectedHighlights([])
    setEditingFurniture(null)
    setTileFurnitures([])
    setSelectedCloneIds([])
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
    wall: 'Tường / Vách Trơn',
    grass: 'Thảm Cỏ',
    tree_large: 'Cây Lớn Ăn Quả',
    tree_small: 'Cây Cảnh Nhỏ',
    bush: 'Bụi Cỏ / Hoa',
  }

  const getFurnitureName = (type: string, itemOrientation?: number) => {
    if (!type) return ''
    if (type.startsWith('rug')) {
      const color = type.split(':')[1]
      const colorObj = RUG_COLORS.find((c) => c.hex.toLowerCase() === color?.toLowerCase())
      return colorObj ? `Thảm Trải Sàn (${colorObj.name})` : 'Thảm Trải Sàn'
    }
    if (type === 'tree_large') {
      const fruitNames = ['Táo Đỏ', 'Cam Mọng', 'Chanh Vàng', 'Đào Hồng']
      const fruit =
        itemOrientation !== undefined ? ` (${fruitNames[itemOrientation % 4]})` : ''
      return `Cây Lớn Ăn Quả${fruit}`
    }
    return furnitureLabels[type] || type
  }

  const activeCloneList =
    cloneTemplates && cloneTemplates.length > 0
      ? cloneTemplates
      : cloneTemplate
      ? [cloneTemplate]
      : []

  const currentToolLabel =
    selectedTool === 'place_new_floor_door'
      ? '🚪 Đặt Cửa Lên Tầng Mới (Click vào ô trống trên bản đồ)'
      : selectedTool?.startsWith('move_floor_door:')
      ? '✏️ Đổi Vị Trí Cửa Nối Tầng (Click vào ô trống mới trên bản đồ)'
      : selectedTool === 'clone' && activeCloneList.length > 0
      ? cloneContinuous
        ? `♾️ Nhân Bản Liên Tục "${activeCloneList.map((t) => getFurnitureName(t.itemType)).join(' + ')}" (Bấm các ô để đặt liên tục - ESC để dừng)`
        : `Nhân Bản "${activeCloneList.map((t) => getFurnitureName(t.itemType)).join(' + ')}" (Bấm ô trên map để đặt)`
      : selectedTool?.startsWith('rug')
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {selectedTool ? (
              <span className="text-highlight">
                🖌️ Đang chọn: {currentToolLabel}
              </span>
            ) : (
              <span className="text-muted">
                👆 Con trỏ tự do: Click vào đồ hoặc phòng trên map để sửa
              </span>
            )}
            {clipboardItem && (
              <button
                onClick={handlePasteFurniture}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Dán nội thất từ bộ nhớ đệm (Ctrl+V)"
              >
                📋 Dán {getFurnitureName(clipboardItem.itemType)} (Ctrl+V)
              </button>
            )}
          </div>
          {selectedTool && (
            <button
              className="unselect-btn"
              onClick={() => {
                dispatch(setSelectedTool(null))
                dispatch(setCloneTemplate(null))
                dispatch(setCloneTemplates([]))
                dispatch(setCloneContinuous(false))
              }}
            >
              {selectedTool === 'clone' ? 'Dừng (ESC)' : 'Bỏ chọn'}
            </button>
          )}
        </StatusBox>

        {/* Panel Quản lý Chọn Nhiều Nội Thất để Xóa Nhanh */}
        {selectedFurnitureIds.length > 0 && (
          <EditBox style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }}>
            <div className="header">
              <span style={{ color: '#fca5a5' }}>
                📦 Đã Quét Chọn {selectedFurnitureIds.length} Nội Thất
              </span>
              <button
                className="dismiss-btn"
                onClick={() => {
                  dispatch(clearSelectedFurnitureIds())
                  const game = phaserGame.scene.keys.game as Game
                  if (game?.drawSelectedHighlights) game.drawSelectedHighlights([])
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#fecaca', marginBottom: '4px' }}>
              Bạn đang chọn hàng loạt <strong>{selectedFurnitureIds.length}</strong> vật thể trên bản đồ (Giữ Shift để kéo quét tiếp nếu muốn).
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
              💡 Bấm nút đỏ bên dưới hoặc phím <strong>Delete / Backspace</strong> để xóa toàn bộ cùng lúc.
            </div>
            <div className="action-buttons">
              <button
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  padding: '10px',
                  flex: '1 1 100%',
                }}
                onClick={handleDeleteMultiSelected}
              >
                🗑️ XÓA NHANH {selectedFurnitureIds.length} NỘI THẤT (Delete)
              </button>
              <button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  flex: '1 1 100%',
                }}
                onClick={() => {
                  dispatch(clearSelectedFurnitureIds())
                  const game = phaserGame.scene.keys.game as Game
                  if (game?.drawSelectedHighlights) game.drawSelectedHighlights([])
                }}
              >
                ✕ Hủy Chọn (ESC)
              </button>
            </div>
          </EditBox>
        )}

        {/* Panel Chỉnh sửa Nội thất khi click vào món đồ trên map */}
        {editingFurniture && selectedFurnitureIds.length === 0 && (
          <EditBox>
            <div className="header">
              <span>🛋️ Chỉnh Sửa Nội Thất Đã Chọn</span>
              <button
                className="dismiss-btn"
                onClick={() => {
                  setEditingFurniture(null)
                  setTileFurnitures([])
                  setSelectedCloneIds([])
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
              <strong>Vật phẩm đang sửa:</strong> {getFurnitureName(editingFurniture.itemType, editingFurniture.orientation)}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Tọa độ: ({editingFurniture.gridX}, {editingFurniture.gridY}) | {
                editingFurniture.itemType === 'tree_large'
                  ? 'Loại cây: ' + ['Táo Đỏ', 'Cam Mọng', 'Chanh Vàng', 'Đào Hồng'][(editingFurniture.orientation || 0) % 4]
                  : editingFurniture.itemType === 'wall'
                  ? 'Kiểu vách: ' + ['Vách xám đá hiện đại', 'Vách xanh navy', 'Vách gỗ ấm cúng', 'Vách kính mờ'][(editingFurniture.orientation || 0) % 4]
                  : editingFurniture.itemType === 'tree_small'
                  ? 'Chậu cây: ' + ['Đất nung', 'Sứ trắng', 'Khay gỗ bonsai', 'Gốm xám đá'][(editingFurniture.orientation || 0) % 4]
                  : editingFurniture.itemType === 'bush'
                  ? 'Loại hoa: ' + ['Hoa hồng đỏ', 'Hoa vàng rực', 'Cúc trắng', 'Hoa tím oải hương'][(editingFurniture.orientation || 0) % 4]
                  : 'Hướng: ' + ['Mặt trước (Trước)', 'Mặt trái (Trái)', 'Mặt sau (Sau)', 'Mặt phải (Phải)'][(editingFurniture.orientation || 0) % 4]
              }
            </div>

            {/* Nếu ô được chọn có chứa nhiều vật phẩm, hiển thị checkbox các vật phẩm muốn nhân bản */}
            {tileFurnitures.length > 1 && (
              <div
                style={{
                  margin: '8px 0',
                  padding: '8px 10px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  borderRadius: '6px',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#38bdf8',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>📦 Ô có {tileFurnitures.length} vật phẩm (Tích để nhân bản):</span>
                  <span
                    onClick={() => {
                      if (selectedCloneIds.length === tileFurnitures.length) {
                        setSelectedCloneIds([])
                      } else {
                        setSelectedCloneIds(tileFurnitures.map((f) => f.id))
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      fontSize: '10px',
                      color: '#94a3b8',
                      textDecoration: 'underline',
                    }}
                  >
                    {selectedCloneIds.length === tileFurnitures.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {tileFurnitures.map((f) => {
                    const isChecked = selectedCloneIds.includes(f.id)
                    const isCurrent = editingFurniture?.id === f.id
                    const baseType = f.itemType.split(':')[0]
                    const emoji =
                      furnitureTools.find((item) => item.type === baseType)?.emoji || '🛋️'
                    return (
                      <div
                        key={f.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          background: isCurrent ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.5)',
                          border: isCurrent
                            ? '1px solid rgba(56, 189, 248, 0.5)'
                            : '1px solid transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`clone_chk_${f.id}`}
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCloneIds((prev) => [...prev, f.id])
                            } else {
                              setSelectedCloneIds((prev) => prev.filter((id) => id !== f.id))
                            }
                          }}
                          style={{
                            cursor: 'pointer',
                            accentColor: '#38bdf8',
                            width: '15px',
                            height: '15px',
                          }}
                        />
                        <label
                          htmlFor={`clone_chk_${f.id}`}
                          style={{
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: isChecked ? '#f8fafc' : '#94a3b8',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontWeight: isChecked ? 600 : 400 }}>
                            {getFurnitureName(f.itemType)}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingFurniture(f)}
                          style={{
                            background: isCurrent ? '#0284c7' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                          }}
                          title="Chọn vật phẩm này để sửa màu sắc / đổi hướng / xóa"
                        >
                          {isCurrent ? 'Đang sửa' : 'Sửa'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Đổi màu nội thất cho tất cả các item generic trừ computer và whiteboard */}
            {editingFurniture.itemType !== 'computer' &&
              editingFurniture.itemType !== 'whiteboard' && (
                <div style={{ marginTop: '4px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#38bdf8',
                      fontWeight: 600,
                      marginBottom: '6px',
                    }}
                  >
                    🎨 Đổi màu sắc nội thất:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {FURNITURE_COLORS.map((c) => {
                      const isCurrent = editingFurniture.itemType.startsWith('rug')
                        ? (editingFurniture.itemType.split(':')[1] || '#2563eb').toLowerCase() ===
                          c.hex.toLowerCase()
                        : (editingFurniture.tint || 0xffffff) === parseInt(c.hex.replace('#', ''), 16)
                      return (
                        <div
                          key={c.hex}
                          onClick={() => handleFurnitureColorChange(c.hex)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '5px',
                            background: c.hex,
                            cursor: 'pointer',
                            border: isCurrent
                              ? '2px solid #ffffff'
                              : '1px solid rgba(255,255,255,0.3)',
                            boxShadow: isCurrent ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                          }}
                          title={c.name}
                        />
                      )
                    })}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                    }}
                  >
                    <label style={{ color: '#94a3b8' }}>Màu tự chọn:</label>
                    <input
                      type="color"
                      value={
                        editingFurniture.itemType.startsWith('rug')
                          ? editingFurniture.itemType.split(':')[1] || '#2563eb'
                          : '#' + (editingFurniture.tint || 0xffffff).toString(16).padStart(6, '0')
                      }
                      onChange={(e) => handleFurnitureColorChange(e.target.value)}
                      style={{
                        width: '26px',
                        height: '26px',
                        padding: 0,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                      {(
                        editingFurniture.itemType.startsWith('rug')
                          ? editingFurniture.itemType.split(':')[1] || '#2563eb'
                          : '#' + (editingFurniture.tint || 0xffffff).toString(16).padStart(6, '0')
                      ).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}

            <div className="action-buttons">
              {!editingFurniture.itemType.startsWith('rug') &&
                editingFurniture.itemType !== 'grass' && (
                  <button className="rotate-btn" onClick={handleRotateFurniture}>
                    🔄 Đổi Hướng / Đổi Kiểu (R)
                  </button>
                )}
              <button className="clone-btn" onClick={() => handleStartClone(false)}>
                📑 Nhân Bản ({tileFurnitures.length > 1 ? `${selectedCloneIds.length} Đã Chọn (1 Lần)` : '1 Lần'})
              </button>
              <button className="continuous-clone-btn" onClick={() => handleStartClone(true)}>
                ♾️ Nhân Bản Liên Tục {tileFurnitures.length > 1 ? `(${selectedCloneIds.length} Đã Chọn)` : ''}
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

        {/* Thanh chuyển đổi 3 Tab */}
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
          <TabButton
            $active={activeTab === 'floor'}
            onClick={() => {
              setActiveTab('floor')
              dispatch(setSelectedTool(null))
              dispatch(clearNotices())
            }}
          >
            🏢 Quản Lý Tầng
          </TabButton>
        </TabNav>

        {/* TAB 1: ĐẶT NỘI THẤT */}
        {activeTab === 'furniture' && (
          <>
            <InstructionBox>
              👉 <strong>Click chọn vật thể</strong> rồi click vào ô trên map để đặt (<strong>Máy tính bắt buộc phải đặt trên Bàn</strong>).
              <br /><br />
              🌳 <strong>CÂY & CẢNH QUAN MỚI:</strong> Thêm <strong>Tường / Vách liền mạch</strong>, <strong>Thảm cỏ liền mạch</strong> (đi lại tự do), <strong>Cây lớn ăn quả</strong> (Ngẫu nhiên Táo, Cam, Chanh, Đào - Bấm <strong>R</strong> để đổi loại quả), <strong>Cây cảnh nhỏ</strong> và <strong>Bụi cỏ hoa</strong>!
              <br /><br />
              ⚡ <strong>XÓA NHANH HÀNG LOẠT:</strong> Giữ phím <strong>Shift + Kéo chuột trái</strong> trên bản đồ để quét chọn nhiều nội thất cùng lúc và bấm nút <strong>Xóa Nhanh</strong> hoặc phím <strong>Delete</strong>!
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

        {/* TAB 3: QUẢN LÝ TẦNG (FLOORS) */}
        {activeTab === 'floor' && (
          <>
            <InstructionBox>
              🏢 <strong>Hệ thống Quản lý Tầng:</strong>
              <br />
              • Bạn đang đứng và thiết kế tại <strong>Tầng {currentFloor || 1}</strong>.
              <br />
              • Để thiết kế tầng khác, hãy bấm chọn tầng bên dưới hoặc điều khiển nhân vật bước vào cửa chuyển tầng trên map.
              <br />
              • Bấm <strong>➕ Thêm Tầng Mới</strong> và click vào 1 ô trống trên map để đặt cửa nối lên tầng mới.
              <br />
              • Bạn có thể sửa vị trí cửa hoặc xóa tầng bất kỳ (yêu cầu tối thiểu còn 1 tầng).
            </InstructionBox>

            {/* Thanh chuyển đổi nhanh tầng đang chỉnh sửa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                📍 Chọn tầng muốn thiết kế / di chuyển đến:
              </div>
              <FloorPillContainer>
                {(floorsConfig?.floors || [{ floorNumber: 1, name: 'Tầng 1' }]).map((f) => (
                  <FloorPill
                    key={f.floorNumber}
                    $active={(currentFloor || 1) === f.floorNumber}
                    onClick={() => {
                      const game = phaserGame.scene.keys.game as Game
                      game?.changeFloor?.(f.floorNumber)
                    }}
                  >
                    <span>🏢</span>
                    <span>{f.name}</span>
                    {(currentFloor || 1) === f.floorNumber && <span>✓</span>}
                  </FloorPill>
                ))}
              </FloorPillContainer>
            </div>

            {/* Nút Thêm Tầng Mới */}
            <AddFloorButton
              onClick={() => {
                dispatch(setSelectedTool('place_new_floor_door'))
                dispatch(
                  setSuccessNotice(
                    '👉 Hãy CLICK vào một ô trống trên bản đồ của Tầng hiện tại để đặt cửa nối lên Tầng mới!'
                  )
                )
              }}
            >
              ➕ Thêm Tầng Mới (Đặt Cửa Nối)
            </AddFloorButton>

            {/* Danh sách các tầng và cấu hình cửa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>
                📋 Danh Sách Các Tầng ({floorsConfig?.floors?.length || 1} tầng):
              </div>

              {(floorsConfig?.floors || [{ floorNumber: 1, name: 'Tầng 1' }])
                .slice()
                .sort((a, b) => a.floorNumber - b.floorNumber)
                .map((f) => {
                  const isCurrent = (currentFloor || 1) === f.floorNumber
                  const upDoors = (floorsConfig?.doors || []).filter(
                    (d) => d.fromFloor === f.floorNumber
                  )
                  const downDoors = (floorsConfig?.doors || []).filter(
                    (d) => d.toFloor === f.floorNumber
                  )

                  return (
                    <FloorCard key={f.floorNumber} $isCurrent={isCurrent}>
                      <div className="floor-header">
                        <div className="floor-title">
                          <span>🏢</span>
                          <span>{f.name}</span>
                        </div>
                        {isCurrent && <span className="badge">Đang đứng ở tầng này</span>}
                      </div>

                      <div className="door-list">
                        {upDoors.length === 0 && downDoors.length === 0 && (
                          <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                            Chưa có cửa nối tầng nào
                          </div>
                        )}

                        {upDoors.map((door) => (
                          <div key={door.id} className="door-row">
                            <span>
                              🚪 <strong>Lên Tầng {door.toFloor}</strong>: Ô ({door.gridX}, {door.gridY})
                            </span>
                            <button
                              className="door-edit-btn"
                              onClick={() => {
                                dispatch(setSelectedTool(`move_floor_door:${door.id}`))
                                dispatch(
                                  setSuccessNotice(
                                    `👉 Click vào ô trống mới trên map để dời cửa lên Tầng ${door.toFloor}!`
                                  )
                                )
                              }}
                              title="Bấm để dời vị trí cửa sang ô khác"
                            >
                              ✏️ Đổi Vị Trí
                            </button>
                          </div>
                        ))}

                        {downDoors.map((door) => (
                          <div key={door.id} className="door-row">
                            <span>
                              🚪 <strong>Xuống Tầng {door.fromFloor}</strong>: Ô ({door.gridX}, {door.gridY})
                            </span>
                            <button
                              className="door-edit-btn"
                              onClick={() => {
                                dispatch(setSelectedTool(`move_floor_door:${door.id}`))
                                dispatch(
                                  setSuccessNotice(
                                    `👉 Click vào ô trống mới trên map để dời cửa xuống Tầng ${door.fromFloor}!`
                                  )
                                )
                              }}
                              title="Bấm để dời vị trí cửa sang ô khác"
                            >
                              ✏️ Đổi Vị Trí
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="floor-actions">
                        {!isCurrent && (
                          <button
                            className="switch-btn"
                            onClick={() => {
                              const game = phaserGame.scene.keys.game as Game
                              game?.changeFloor?.(f.floorNumber)
                            }}
                          >
                            🚀 Chuyển Đến {f.name}
                          </button>
                        )}
                        {(floorsConfig?.floors?.length || 1) > 1 && (
                          <button
                            className="delete-floor-btn"
                            onClick={() => {
                              const confirmMsg = `Bạn có chắc chắn muốn xóa ${f.name}?\n- Toàn bộ nội thất và phòng trên tầng này sẽ bị xóa.\n- Vị trí cửa nối sẽ tự động liên kết với tầng liền kề theo quy tắc.`
                              if (window.confirm(confirmMsg)) {
                                const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
                                bootstrap.network.deleteFloor(f.floorNumber)
                                if ((currentFloor || 1) === f.floorNumber) {
                                  const remaining = floorsConfig?.floors.find(
                                    (x) => x.floorNumber !== f.floorNumber
                                  )
                                  if (remaining) {
                                    const game = phaserGame.scene.keys.game as Game
                                    game?.changeFloor?.(remaining.floorNumber)
                                  }
                                }
                                dispatch(setSuccessNotice(`Đã gửi yêu cầu xóa ${f.name}!`))
                              }
                            }}
                          >
                            🗑️ Xóa Tầng
                          </button>
                        )}
                      </div>
                    </FloorCard>
                  )
                })}
            </div>
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
