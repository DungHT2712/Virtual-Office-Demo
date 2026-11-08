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
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import LockIcon from '@mui/icons-material/Lock'
import { useAppSelector } from '../hooks'
import { getAvatarString, getColorByString } from '../util'

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

  .avatar {
    height: 30px;
    width: 30px;
    font-size: 15px;
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
  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .MuiDialog-paper {
    background: #222639;
  }
`

export const CustomRoomTable = () => {
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
    try {
      const port = 2567
      const host = window.location.hostname
      const url = `${window.location.protocol}//${host}:${port}/api/workspaces/${targetDeleteRoom.id}`
      await fetch(url, { method: 'DELETE' })
    } catch (e) {
      console.error('Error deleting workspace:', e)
    }
    setDeleteDialogOpen(false)
    setTargetDeleteRoom(null)
  }

  const handleJoinClick = (roomId: string, password: string | null) => {
    if (!lobbyJoined) return
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
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
              <TableCell></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>ID</TableCell>
              <TableCell align="center">
                <PeopleAltIcon />
              </TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availableRooms.map((room) => {
              const { roomId, metadata, clients } = room
              const { name, description, hasPassword } = metadata
              return (
                <TableRowWrapper key={roomId}>
                  <TableCell>
                    <Avatar className="avatar" style={{ background: getColorByString(name) }}>
                      {getAvatarString(name)}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="name">{name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="description">{description}</div>
                  </TableCell>
                  <TableCell>{roomId}</TableCell>
                  <TableCell align="center">{clients}</TableCell>
                  <TableCell align="center">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Tooltip title={hasPassword ? 'Password required' : ''}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => {
                            if (hasPassword) {
                              setShowPasswordDialog(true)
                              setSelectedRoom(roomId)
                            } else {
                              handleJoinClick(roomId, null)
                            }
                          }}
                        >
                          <div className="join-wrapper">
                            {hasPassword && <LockIcon className="lock-icon" />}
                            Join
                          </div>
                        </Button>
                      </Tooltip>
                      <Tooltip title="Xóa Workspace này">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRoomClick(roomId, name)}
                          sx={{ '&:hover': { background: 'rgba(239, 68, 68, 0.15)' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
        PaperProps={{
          style: {
            background: '#1e2235',
            color: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteOutlineIcon /> Xóa Workspace?
        </DialogTitle>
        <DialogContent>
          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>
            Bạn có chắc chắn muốn xóa vĩnh viễn Workspace "{targetDeleteRoom?.name}" không? Thao tác này sẽ xóa toàn bộ dữ liệu phòng đã lưu và không thể hoàn tác.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#94a3b8', textTransform: 'none' }}>
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
