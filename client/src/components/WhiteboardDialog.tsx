import React, { useEffect } from 'react'
import styled from 'styled-components'
import CloseIcon from '@mui/icons-material/Close'

import { useAppSelector, useAppDispatch } from '../hooks'
import { closeWhiteboardDialog } from '../stores/WhiteboardStore'

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

const WhiteboardWrapper = styled.div`
  flex: 1;
  min-height: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: #fff;
  }
`

export default function WhiteboardDialog() {
  const whiteboardUrl = useAppSelector((state) => state.whiteboard.whiteboardUrl)
  const dispatch = useAppDispatch()

  // Đóng dialog khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeWhiteboardDialog())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <Backdrop
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          dispatch(closeWhiteboardDialog())
        }
      }}
    >
      <Wrapper onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="title-group">
            <span>📋</span>
            <span>Bảng Trắng Trực Tuyến (Collaborative Whiteboard)</span>
          </div>

          <div className="header-actions">
            <CloseBtn onClick={() => dispatch(closeWhiteboardDialog())} title="Đóng bảng trắng (hoặc bấm ESC)">
              <CloseIcon sx={{ fontSize: 16 }} />
              <span>Đóng (ESC)</span>
            </CloseBtn>
          </div>
        </DialogHeader>

        {whiteboardUrl ? (
          <WhiteboardWrapper>
            <iframe title="white board" src={whiteboardUrl} />
          </WhiteboardWrapper>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              gap: 12,
            }}
          >
            <div style={{ fontSize: '48px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>Đang tải bảng trắng trực tuyến...</div>
          </div>
        )}
      </Wrapper>
    </Backdrop>
  )
}
