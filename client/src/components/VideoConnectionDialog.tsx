import React, { useState } from 'react'
import styled from 'styled-components'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { useAppSelector } from '../hooks'

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
`

const Wrapper = styled.div`
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  gap: 8px;
`

export default function VideoConnectionDialog() {
  const [connectionWarning, setConnectionWarning] = useState(true)
  const designMode = useAppSelector((state) => state.workspace.designMode)

  if (designMode) return null
  return (
    <Backdrop>
      <Wrapper>
        {connectionWarning && (
          <Alert
            severity="warning"
            onClose={() => {
              setConnectionWarning(!connectionWarning)
            }}
          >
            <AlertTitle>Warning</AlertTitle>
            No webcam connected
            <br /> <strong>connect one for full experience!</strong>
          </Alert>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            const game = phaserGame.scene.keys.game as Game
            game.network.webRTC?.getUserMedia()
          }}
        >
          Connect Webcam
        </Button>
      </Wrapper>
    </Backdrop>
  )
}
