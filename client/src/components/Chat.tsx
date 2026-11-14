import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Badge from '@mui/material/Badge'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SendIcon from '@mui/icons-material/Send'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { getColorByString } from '../util'
import { useAppDispatch, useAppSelector } from '../hooks'
import { MessageType, setFocused, setShowChat } from '../stores/ChatStore'

const ChatContainer = styled.aside<{ $showChat: boolean }>`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 33vw;
  min-width: 320px;
  max-width: 480px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(16px);
  overflow: hidden;
  pointer-events: auto;
  transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 640px) {
    width: calc(100vw - 32px);
    min-width: unset;
    max-width: unset;
  }
`

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      color: #38bdf8;
      font-size: 18px;
    }
  }

  .subtitle {
    font-size: 10px;
    color: #94a3b8;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 2px;
  }
`

const ChatMessagesBox = styled(Box)`
  height: 260px;
  max-height: 40vh;
  overflow-y: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

const MessageRow = styled.div<{ $isMe: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isMe ? 'flex-end' : 'flex-start')};
  width: 100%;
  margin-bottom: 2px;
`

const MessageBubble = styled.div<{ $isMe: boolean }>`
  max-width: 85%;
  padding: 6px 10px;
  border-radius: ${(props) =>
    props.$isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px'};
  background: ${(props) =>
    props.$isMe ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)'};
  color: ${(props) => (props.$isMe ? '#0f172a' : '#f8fafc')};
  border: ${(props) =>
    props.$isMe ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)'};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 2px;
  word-break: break-word;
  white-space: pre-wrap;
  user-select: text;
  transition: transform 0.1s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
  }

  .author-row {
    display: flex;
    align-items: center;
    justify-content: ${(props) => (props.$isMe ? 'flex-end' : 'flex-start')};
    gap: 6px;
    margin-bottom: 1px;
  }

  .author-name {
    font-size: 11px;
    font-weight: 700;
  }

  .message-time {
    font-size: 9px;
    color: ${(props) => (props.$isMe ? '#64748b' : '#94a3b8')};
  }

  .message-body {
    font-size: 12px;
    line-height: 1.4;
    color: ${(props) => (props.$isMe ? '#0f172a' : '#f1f5f9')};
  }
`

const NotificationPill = styled.div`
  align-self: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 2px 10px;
  margin: 2px 0;
  text-align: center;

  span {
    font-size: 10px;
    color: #94a3b8;
    font-style: italic;
  }
`

const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 6px;
  pointer-events: auto;
  position: relative;
  z-index: 10;
`

const SearchInput = styled(InputBase)`
  flex: 1;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #f8fafc;
  padding: 2px 8px;
  font-size: 11px;
  pointer-events: auto;

  &:focus-within {
    border-color: #38bdf8;
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.25);
  }

  input {
    color: #f8fafc;
    padding: 2px 0;
    pointer-events: auto;
    &::placeholder {
      color: #64748b;
      font-size: 11px;
    }
  }
`

const SearchStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  background: rgba(30, 41, 59, 0.45);
  font-size: 10px;
  color: #94a3b8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  span.clear-btn {
    color: #38bdf8;
    cursor: pointer;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`

const EmptySearchResult = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 12px;
  color: #64748b;
  text-align: center;
  gap: 6px;
  font-size: 11px;

  svg {
    font-size: 26px;
    color: #475569;
  }
`

const InputWrapper = styled.div<{ $showChat: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background: rgba(15, 23, 42, 0.95);
  border-top: ${(props) => (props.$showChat ? '1px solid rgba(255, 255, 255, 0.1)' : 'none')};
  gap: 6px;
  position: relative;
`

const InputTextField = styled(InputBase)`
  flex: 1;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  padding: 3px 8px;
  font-size: 12px;

  &:focus-within {
    border-color: #38bdf8;
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.25);
  }

  textarea {
    color: #f8fafc;
    padding: 2px 0;
    resize: none;
    line-height: 1.4;
    max-height: 80px;
    &::placeholder {
      color: #64748b;
      opacity: 1;
      font-size: 11px;
    }
  }

  input {
    color: #f8fafc;
    padding: 2px 0;
    &::placeholder {
      color: #64748b;
      opacity: 1;
      font-size: 11px;
    }
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 52px;
  right: 8px;
  z-index: 1200;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  overflow: hidden;
`

const dateFormatter = new Intl.DateTimeFormat('vi', {
  hour: '2-digit',
  minute: '2-digit',
})

const MessageItem = ({
  chatMessage,
  messageType,
  isMe,
  myStatusColor,
}: {
  chatMessage: any
  messageType: MessageType
  isMe: boolean
  myStatusColor?: string
}) => {
  if (messageType !== MessageType.REGULAR_MESSAGE) {
    return (
      <NotificationPill>
        <span>
          {chatMessage.author}{' '}
          {chatMessage.content === 'joined the lobby' ? 'đã vào văn phòng' : 'đã rời văn phòng'}
        </span>
      </NotificationPill>
    )
  }

  return (
    <MessageRow $isMe={isMe}>
      <MessageBubble $isMe={isMe}>
        <div className="author-row">
          <span
            className="author-name"
            style={{
              color: isMe ? '#475569' : getColorByString(chatMessage.author),
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isMe && myStatusColor && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: myStatusColor,
                  display: 'inline-block',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              />
            )}
            {isMe ? 'Bạn' : chatMessage.author}
          </span>
          <span className="message-time">
            {chatMessage.createdAt ? dateFormatter.format(chatMessage.createdAt) : ''}
          </span>
        </div>
        <div className="message-body">{chatMessage.content}</div>
      </MessageBubble>
    </MessageRow>
  )
}

export default function Chat() {
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const prevMessagesLength = useRef(0)

  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const playerName = useAppSelector((state) => state.user.playerName)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const myName = playerName || game?.myPlayer?.playerName?.text || ''

  // Đếm tin nhắn chưa đọc khi khung chat đang bị ẩn (chỉ hiện textbox)
  useEffect(() => {
    if (showChat) {
      setUnreadCount(0)
    } else if (chatMessages.length > prevMessagesLength.current) {
      setUnreadCount((prev) => prev + (chatMessages.length - prevMessagesLength.current))
    }
    prevMessagesLength.current = chatMessages.length
  }, [chatMessages.length, showChat])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(event.target.value)
  }

  const handleSendMessage = () => {
    const val = inputValue.trim()
    setInputValue('')
    if (val) {
      game.network.addChatMessage(val)
      game.myPlayer.updateDialogBubble(val)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      dispatch(setFocused(false))
      dispatch(setShowChat(false))
      return
    }

    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Shift + Enter -> Gửi tin nhắn
        event.preventDefault()
        handleSendMessage()
      } else if (!showChat) {
        // Khi đang ẩn mà gõ Enter -> Mở rộng lịch sử chat
        event.preventDefault()
        dispatch(setShowChat(true))
      }
      // Enter (không Shift) khi đang mở chat -> Xuống dòng bình thường
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused && showChat) {
      if (document.activeElement !== searchInputRef.current) {
        inputRef.current?.focus()
      }
    }
  }, [focused, showChat])

  useEffect(() => {
    if (showChat && !searchQuery) {
      scrollToBottom()
    }
  }, [chatMessages, showChat, searchQuery])

  if (designMode) return null

  // Lọc tin nhắn theo từ khóa tìm kiếm (nội dung hoặc tên người gửi)
  const filteredMessages = chatMessages.filter(({ chatMessage }) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    const matchContent = chatMessage.content?.toLowerCase().includes(q)
    const matchAuthor = chatMessage.author?.toLowerCase().includes(q)
    return matchContent || matchAuthor
  })

  return (
    <ChatContainer $showChat={showChat}>
      {/* Khi hiện: Hiển thị Header, Tìm kiếm và Lịch sử chat */}
      {showChat && (
        <>
          {/* Header */}
          <ChatHeader>
            <div className="header-left">
              <div className="title">
                <ChatBubbleOutlineIcon />
                <span>Chat Văn Phòng</span>
              </div>
              <span className="subtitle">• Shift+Enter gửi tin</span>
            </div>
            <div className="header-actions">
              <Tooltip title={showSearch ? 'Đóng tìm kiếm' : 'Tìm kiếm tin nhắn'}>
                <IconButton
                  size="small"
                  onClick={() => setShowSearch(!showSearch)}
                  sx={{
                    color: showSearch ? '#38bdf8' : '#94a3b8',
                    padding: '3px',
                    '&:hover': { color: '#ffffff' },
                  }}
                >
                  <SearchIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ẩn lịch sử chat (Esc)">
                <IconButton
                  size="small"
                  onClick={() => {
                    dispatch(setShowChat(false))
                    dispatch(setFocused(false))
                  }}
                  sx={{ color: '#94a3b8', padding: '3px', '&:hover': { color: '#ffffff' } }}
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </div>
          </ChatHeader>

          {/* Thanh Search Tin Nhắn (khi mở tìm kiếm) */}
          {showSearch && (
            <SearchBarWrapper
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <SearchIcon sx={{ color: '#64748b', fontSize: 16 }} />
              <SearchInput
                inputRef={searchInputRef}
                placeholder="Tìm tin nhắn, người gửi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  game?.disableKeys()
                }}
                onBlur={() => {
                  game?.enableKeys()
                }}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Escape') {
                    if (searchQuery) {
                      setSearchQuery('')
                    } else {
                      setShowSearch(false)
                      game?.enableKeys()
                    }
                  }
                }}
              />
              {searchQuery && (
                <Tooltip title="Xóa tìm kiếm">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('')
                      searchInputRef.current?.focus()
                    }}
                    sx={{ color: '#94a3b8', padding: '2px', '&:hover': { color: '#ffffff' } }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
            </SearchBarWrapper>
          )}

          {/* Thông tin số lượng kết quả khi đang tìm kiếm */}
          {showSearch && searchQuery.trim() && (
            <SearchStatus>
              <span>
                Tìm thấy <strong>{filteredMessages.length}</strong> tin nhắn
              </span>
              <span className="clear-btn" onClick={() => setSearchQuery('')}>
                Xóa lọc
              </span>
            </SearchStatus>
          )}

          {/* Danh sách lịch sử tin nhắn */}
          <ChatMessagesBox>
            {filteredMessages.length > 0 ? (
              filteredMessages.map(({ messageType, chatMessage }, index) => {
                const isMe = Boolean(myName && chatMessage.author === myName)
                return (
                  <MessageItem
                    chatMessage={chatMessage}
                    messageType={messageType}
                    isMe={isMe}
                    myStatusColor={currentStatus?.color}
                    key={index}
                  />
                )
              })
            ) : searchQuery.trim() ? (
              <EmptySearchResult>
                <SearchIcon />
                <div>Không tìm thấy tin nhắn khớp &quot;{searchQuery}&quot;</div>
              </EmptySearchResult>
            ) : (
              <EmptySearchResult>
                <ChatBubbleOutlineIcon />
                <div>Chưa có tin nhắn nào trong phòng.</div>
              </EmptySearchResult>
            )}
            <div ref={messagesEndRef} />
          </ChatMessagesBox>
        </>
      )}

      {/* Emoji Picker nếu đang bật */}
      {showEmojiPicker && (
        <EmojiPickerWrapper>
          <Picker
            theme="dark"
            showSkinTones={false}
            showPreview={false}
            onSelect={(emoji: any) => {
              setInputValue(inputValue + emoji.native)
              setShowEmojiPicker(false)
              dispatch(setFocused(true))
            }}
            exclude={['recent', 'flags']}
          />
        </EmojiPickerWrapper>
      )}

      {/* Thanh Textbox ở dưới cùng (Luôn hiển thị khi ẩn/hiện) */}
      <InputWrapper $showChat={showChat}>
        <Tooltip title={showChat ? 'Ẩn lịch sử chat (Esc)' : 'Hiện lịch sử chat (Enter)'}>
          <IconButton
            size="small"
            onClick={() => {
              const next = !showChat
              dispatch(setShowChat(next))
              if (next) dispatch(setFocused(true))
            }}
            sx={{
              color: showChat ? '#94a3b8' : '#38bdf8',
              padding: '4px',
              '&:hover': { color: '#ffffff' },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              {showChat ? (
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
              ) : (
                <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
              )}
            </Badge>
          </IconButton>
        </Tooltip>

        <InputTextField
          inputRef={inputRef}
          multiline={showChat}
          minRows={1}
          maxRows={showChat ? 3 : 1}
          placeholder={
            showChat
              ? 'Nhập tin nhắn... (Shift+Enter gửi)'
              : 'Trò chuyện... (Click hoặc Enter để mở)'
          }
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onFocus={() => {
            if (!focused) {
              dispatch(setFocused(true))
            }
            if (!showChat) {
              dispatch(setShowChat(true))
            }
          }}
          onBlur={() => {
            dispatch(setFocused(false))
          }}
        />

        <Tooltip title="Chèn biểu tượng cảm xúc">
          <IconButton
            size="small"
            aria-label="emoji"
            onClick={() => {
              if (!showChat) dispatch(setShowChat(true))
              setShowEmojiPicker(!showEmojiPicker)
            }}
            sx={{ color: '#94a3b8', padding: '4px', '&:hover': { color: '#facc15' } }}
          >
            <InsertEmoticonIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Gửi tin nhắn (Shift + Enter)">
          <IconButton
            size="small"
            aria-label="send message"
            onClick={handleSendMessage}
            sx={{
              color: '#38bdf8',
              padding: '4px',
              background: 'rgba(56, 189, 248, 0.1)',
              '&:hover': { background: '#0284c7', color: '#ffffff' },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </InputWrapper>
    </ChatContainer>
  )
}
