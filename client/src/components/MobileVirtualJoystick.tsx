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
`

const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`

const JoystickWrapper = styled.div`
  margin-top: auto;
  align-self: flex-end;
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

  const triggerKey = (keyName: string) => {
    const scene = phaserGame.scene.keys.game as Game
    if (!scene || !scene.input || !scene.input.keyboard) return
    scene.input.keyboard.emit(`keydown-${keyName}`)
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: keyName.toLowerCase(),
        code: `Key${keyName}`,
        bubbles: true,
      })
    )
    window.setTimeout(() => {
      window.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: keyName.toLowerCase(),
          code: `Key${keyName}`,
          bubbles: true,
        })
      )
    }, 100)
  }

  return (
    <>
      {!(showChat && hasSmallScreen) && showJoystick && (
        <LeftActionBackdrop>
          <ActionButton onClick={() => triggerKey('E')} title="Sit / Leave (E)">
            E
          </ActionButton>
          <ActionButton onClick={() => triggerKey('R')} title="Use Computer / Whiteboard (R)">
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
