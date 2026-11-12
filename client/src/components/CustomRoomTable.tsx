import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Alert from '@mui/material/Alert'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LockIcon from '@mui/icons-material/Lock'
import { useAppSelector, useAppDispatch } from '../hooks'
import { removeAvailableRooms } from '../stores/RoomStore'
import { setWorkspaceData } from '../stores/WorkspaceStore'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

const MessageText = styled.p`
  margin: 10px;
  font-size: 18px;
  color: #eee;
  text-align: center;
`

const CustomRoomTableContainer = styled(TableContainer)<{
  component: React.ElementType
}>`
  max-height: 500px;

  table {
    min-width: 650px;
  }
`

const TableRowWrapper = styled(TableRow)`
  &:last-child td,
  &:last-child th {
    border: 0;
  }

  .name {
    min-width: 100px;
    overflow-wrap: anywhere;
  }

  .description {
    min-width: 200px;
    overflow-wrap: anywhere;
  }

  .join-wrapper {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .lock-icon {
    font-size: 18px;
  }
`

const PasswordDialog = styled(Dialog)`
  z-index: 99999999 !important;

  .MuiBackdrop-root {
    z-index: 99999998 !important;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .MuiDialog-paper {
    background: #222639;
    z-index: 99999999 !important;
  }
`

export const CustomRoomTable = () => {
  const dispatch = useAppDispatch()
  const [password, setPassword] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [passwordFieldEmpty, setPasswordFieldEmpty] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [targetDeleteRoom, setTargetDeleteRoom] = useState<{ id: string; name: string } | null>(null)
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)
  const availableRooms = useAppSelector((state) => state.room.availableRooms)

  const handleDeleteRoomClick = (id: string, name: string) => {
    setTargetDeleteRoom({ id, name })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!targetDeleteRoom) return
    const idToDelete = targetDeleteRoom.id
    const nameToDelete = targetDeleteRoom.name

    // 1. Cập nhật UI ngay lập tức
    dispatch(removeAvailableRooms(idToDelete))

    // 2. Cập nhật localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('saved_workspaces') || '[]')
      const updated = stored.filter((w: any) => w.id !== idToDelete && w.name !== nameToDelete)
      localStorage.setItem('saved_workspaces', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }

    setDeleteDialogOpen(false)
    setTargetDeleteRoom(null)

    // 3. Gửi lệnh xóa lên server (thử qua proxy /api và fallback server port 2567)
    try {
      const query = nameToDelete ? `?name=${encodeURIComponent(nameToDelete)}` : ''
      const res = await fetch(`/api/workspaces/${idToDelete}${query}`, { method: 'DELETE' }).catch(() => null)
      if (!res || !res.ok) {
        const serverUrl =
          process.env.NODE_ENV === 'production' && import.meta.env.VITE_SERVER_URL
            ? import.meta.env.VITE_SERVER_URL
            : `${window.location.protocol}//${window.location.hostname}:2567`
        await fetch(`${serverUrl}/api/workspaces/${idToDelete}${query}`, { method: 'DELETE' }).catch(() => null)
      }
    } catch (e) {
      console.error('Error deleting workspace on server:', e)
    }
  }

  const handleJoinClick = (roomId: string, password: string | null) => {
    if (!lobbyJoined) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
    const targetRoom = availableRooms.find((r) => r.roomId === roomId)
    if (targetRoom?.metadata?.width && targetRoom?.metadata?.height) {
      dispatch(
        setWorkspaceData({
          sizeType: targetRoom.metadata.sizeType || 'MEDIUM',
          width: targetRoom.metadata.width,
          height: targetRoom.metadata.height,
        })
      )
    }
    bootstrap.network
      .joinCustomById(roomId, password)
      .then(() => bootstrap.launchGame())
      .catch((error) => {
        console.error(error)
        if (password) setShowPasswordError(true)
      })
  }

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isValidPassword = password !== ''

    if (isValidPassword === passwordFieldEmpty) setPasswordFieldEmpty(!passwordFieldEmpty)
    if (isValidPassword) handleJoinClick(selectedRoom, password)
  }

  const resetPasswordDialog = () => {
    setShowPasswordDialog(false)
    setPassword('')
    setPasswordFieldEmpty(false)
    setShowPasswordError(false)
  }

  return availableRooms.length === 0 ? (
    <MessageText>Hiện chưa có Workspace nào được tạo. Hãy bấm nút bên dưới để tạo Workspace đầu tiên!</MessageText>
  ) : (
    <>
      <CustomRoomTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>Name</TableCell>
              <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>Description</TableCell>
              <TableCell style={{ fontWeight: 700, color: '#f8fafc' }}>ID</TableCell>
              <TableCell align="center" style={{ fontWeight: 700, color: '#f8fafc' }}>
                Số người
              </TableCell>
              <TableCell align="center" style={{ fontWeight: 700, color: '#f8fafc' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableRooms.map((room) => {
              const { roomId, metadata, clients } = room
              const { name = '', description = '', hasPassword = false } = metadata || {}
              return (
                <TableRowWrapper key={roomId}>
                  <TableCell>
                    <div className="name" style={{ fontWeight: 600, color: '#ffffff' }}>
                      {name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="description" style={{ color: '#cbd5e1' }}>
                      {description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '13px' }}>
                      {roomId}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '15px' }}>
                      {clients}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Tooltip title={hasPassword ? 'Cần mật khẩu' : ''}>
                        <Button
                          variant="contained"
                          size="small"
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 600,
                            textTransform: 'none',
                            padding: '4px 14px',
                            borderRadius: '6px',
                          }}
                          onClick={() => {
                            if (hasPassword) {
                              setShowPasswordDialog(true)
                              setSelectedRoom(roomId)
                            } else {
                              handleJoinClick(roomId, null)
                            }
                          }}
                        >
                          <div className="join-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {hasPassword && <LockIcon style={{ fontSize: 15 }} />}
                            Join
                          </div>
                        </Button>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        style={{
                          borderColor: '#ef4444',
                          color: '#f87171',
                          fontWeight: 600,
                          textTransform: 'none',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.08)',
                        }}
                        onClick={() => handleDeleteRoomClick(roomId, name)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRowWrapper>
              )
            })}
          </TableBody>
        </Table>
      </CustomRoomTableContainer>
      <PasswordDialog open={showPasswordDialog} onClose={resetPasswordDialog}>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent className="dialog-content">
            <MessageText>This a private room, please enter password:</MessageText>
            <TextField
              autoFocus
              fullWidth
              error={passwordFieldEmpty}
              helperText={passwordFieldEmpty && 'Required'}
              value={password}
              label="Password"
              type="password"
              variant="outlined"
              color="secondary"
              onInput={(e) => {
                setPassword((e.target as HTMLInputElement).value)
              }}
            />
            {showPasswordError && (
              <Alert severity="error" variant="outlined">
                Incorrect Password!
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={resetPasswordDialog}>
              Cancel
            </Button>
            <Button color="secondary" type="submit">
              Join
            </Button>
          </DialogActions>
        </form>
      </PasswordDialog>

      {/* DIALOG XÁC NHẬN XÓA WORKSPACE TỪ BẢNG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        style={{ zIndex: 99999999 }}
        sx={{
          zIndex: 99999999,
          '& .MuiBackdrop-root': {
            zIndex: 99999998,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
        PaperProps={{
          style: {
            background: '#1e2235',
            color: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            padding: '12px',
            zIndex: 99999999,
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '18px' }}>
          <DeleteOutlineIcon fontSize="medium" /> Xác Nhận Xóa Workspace?
        </DialogTitle>
        <DialogContent sx={{ py: 1.5 }}>
          <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            Bạn có chắc chắn muốn xóa vĩnh viễn Workspace <b style={{ color: '#f87171' }}>"{targetDeleteRoom?.name}"</b> (ID: <code style={{ color: '#38bdf8' }}>{targetDeleteRoom?.id}</code>) không?
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 8, marginBottom: 0 }}>
            Thao tác này sẽ xóa vĩnh viễn dữ liệu phòng và không thể hoàn tác.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              color: '#94a3b8',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: '#ffffff', color: '#ffffff' },
            }}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              background: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { background: '#b91c1c' },
            }}
          >
            Xác Nhận Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
