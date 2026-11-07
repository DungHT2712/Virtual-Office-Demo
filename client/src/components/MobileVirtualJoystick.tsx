import { useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import JoystickItem from './Joystick'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { useAppSelector } from '../hooks'
import { JoystickMovement } from './Joystick'

const Backdrop = styled.div`
  position: fixed;
  bottom: 100px;
  right: 32px;
  max-height: 50%;
  max-width: 100%;
  pointer-events: none !important;
`

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
`

const JoystickWrapper = styled.div`
  margin-top: auto;
  align-self: flex-end;
  pointer-events: auto;
`
export const minimumScreenWidthSize = 650 //px

const isSmallScreen = (smallScreenSize: number) => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width <= smallScreenSize
}

const LeftActionBackdrop = styled.div`
  position: fixed;
  bottom: 32px;
  left: 32px;
  display: flex;
  gap: 12px;
  z-index: 1000;
`

const ActionButton = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(34, 38, 57, 0.88);
  border: 2px solid #42eacb;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.92);
    background: #42eacb;
    color: #000;
  }
`

export default function MobileVirtualJoystick() {
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const hasSmallScreen = isSmallScreen(minimumScreenWidthSize)
  const game = phaserGame.scene.keys.game as Game

  useEffect(() => {}, [showJoystick, showChat])

  const handleMovement = (movement: JoystickMovement) => {
    game.myPlayer?.handleJoystickMovement(movement)
  }

  const triggerAction = (action: 'E' | 'R') => {
    if (game && game.myPlayer) {
      if (action === 'E') game.myPlayer.virtualButtonE = true
      if (action === 'R') game.myPlayer.virtualButtonR = true
    }
  }

  return (
    <>
      {!(showChat && hasSmallScreen) && showJoystick && (
        <LeftActionBackdrop>
          <ActionButton onClick={() => triggerAction('E')} title="Sit / Leave (E)">
            E
          </ActionButton>
          <ActionButton onClick={() => triggerAction('R')} title="Use Computer / Whiteboard (R)">
            R
          </ActionButton>
        </LeftActionBackdrop>
      )}
      <Backdrop>
        <Wrapper>
          {!(showChat && hasSmallScreen) && showJoystick && (
            <JoystickWrapper>
              <JoystickItem onDirectionChange={handleMovement}></JoystickItem>
            </JoystickWrapper>
          )}
        </Wrapper>
      </Backdrop>
    </>
  )
}
