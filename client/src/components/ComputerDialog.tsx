import React, { useEffect } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeComputerDialog } from '../stores/ComputerStore'

import Video from './Video'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  background: rgba(10, 15, 30, 0.75);
  backdrop-filter: blur(8px);
  padding: 24px 200px 24px 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1300px;
  max-height: 90vh;
  background: #1e293b;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
  padding: 16px 20px;
  box-sizing: border-box;
  color: #eee;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #38bdf8;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`

const CloseBtn = styled.button`
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.6);
  color: #fca5a5;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
  }
`

const VideoGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
  overflow-y: auto;

  .video-container {
    position: relative;
    background: #0f172a;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    overflow: hidden;

    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      object-fit: contain;
    }

    .player-name {
      position: absolute;
      bottom: 12px;
      left: 12px;
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      background: rgba(0, 0, 0, 0.6);
      padding: 4px 10px;
      border-radius: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`

function VideoContainer({
  playerName,
  stream,
  isMyStream = false,
}: {
  playerName?: string
  stream: any
  isMyStream?: boolean
}) {
  return (
    <div className="video-container">
      <Video srcObject={stream} autoPlay playsInline muted={isMyStream}></Video>
      {playerName && <div className="player-name">{playerName}</div>}
    </div>
  )
}

export default function ComputerDialog() {
  const dispatch = useAppDispatch()
  const playerNameMap = useAppSelector((state) => state.user.playerNameMap)
  const shareScreenManager = useAppSelector((state) => state.computer.shareScreenManager)
  const myStream = useAppSelector((state) => state.computer.myStream)
  const peerStreams = useAppSelector((state) => state.computer.peerStreams)

  // Đóng dialog khi nhấn ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeComputerDialog())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <Backdrop
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dispatch(closeComputerDialog())
        }
      }}
    >
      <Wrapper onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="title-group">
            <span>🖥️</span>
            <span>Chia Sẻ Màn Hình / Máy Tính</span>
          </div>

          <div className="header-actions">
            <Button
              variant="contained"
              size="small"
              sx={{
                background: shareScreenManager?.myStream ? '#ef4444' : '#0284c7',
                '&:hover': {
                  background: shareScreenManager?.myStream ? '#dc2626' : '#0369a1',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
              onClick={() => {
                if (shareScreenManager?.myStream) {
                  shareScreenManager?.stopScreenShare()
                } else {
                  shareScreenManager?.startScreenShare()
                }
              }}
            >
              {shareScreenManager?.myStream ? 'Dừng Chia Sẻ (Stop)' : 'Bắt Đầu Chia Sẻ Màn Hình'}
            </Button>

            <CloseBtn onClick={() => dispatch(closeComputerDialog())} title="Đóng cửa sổ (hoặc bấm ESC)">
              <CloseIcon sx={{ fontSize: 16 }} />
              <span>Đóng (ESC)</span>
            </CloseBtn>
          </div>
        </DialogHeader>

        <VideoGrid>
          {myStream && <VideoContainer stream={myStream} playerName="Bạn (You)" isMyStream={true} />}

          {[...peerStreams.entries()].map(([id, { stream }]) => {
            const playerName = playerNameMap.get(id) || `Đồng nghiệp (${id.slice(0, 5)})`
            return <VideoContainer key={id} playerName={playerName} stream={stream} isMyStream={false} />
          })}

          {!myStream && peerStreams.size === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                gap: 12,
                height: '100%',
                minHeight: '200px',
              }}
            >
              <div style={{ fontSize: '48px' }}>🖥️</div>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Chưa có ai đang chia sẻ màn hình</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Bấm vào nút <strong>"Bắt Đầu Chia Sẻ Màn Hình"</strong> ở trên để trình chiếu cho mọi người trong phòng!
              </div>
            </div>
          )}
        </VideoGrid>
      </Wrapper>
    </Backdrop>
  )
}
