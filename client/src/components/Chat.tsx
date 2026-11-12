import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
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

const SidebarContainer = styled.aside<{ $showChat: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 340px;
  max-width: 90vw;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #181b2a 0%, #0f121d 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
  transform: ${(props) => (props.$showChat ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: auto;
`

const SidebarToggleTab = styled.button`
  position: absolute;
  top: 96px;
  left: 100%;
  background: #181b2a;
  color: #38bdf8;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-left: none;
  border-radius: 0 10px 10px 0;
  padding: 10px 7px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: #0284c7;
    color: #ffffff;
    box-shadow: 4px 0 16px rgba(2, 132, 199, 0.5);
  }

  span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title {
    font-size: 15px;
    font-weight: 700;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      color: #38bdf8;
      font-size: 20px;
    }
  }

  .subtitle {
    font-size: 11px;
    color: #94a3b8;
  }
`

const ChatMessagesBox = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
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
  margin-bottom: 3px;
`

const MessageBubble = styled.div<{ $isMe: boolean }>`
  max-width: 82%;
  padding: 8px 12px;
  border-radius: ${(props) =>
    props.$isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
  background: ${(props) =>
    props.$isMe ? '#f1f5f9' : 'rgba(30, 41, 59, 0.9)'};
  color: ${(props) => (props.$isMe ? '#0f172a' : '#f8fafc')};
  border: ${(props) =>
    props.$isMe ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)'};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 3px;
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
    font-size: 10px;
    color: ${(props) => (props.$isMe ? '#64748b' : '#94a3b8')};
  }

  .message-body {
    font-size: 13px;
    line-height: 1.45;
    color: ${(props) => (props.$isMe ? '#0f172a' : '#f1f5f9')};
  }
`

const NotificationPill = styled.div`
  align-self: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 3px 12px;
  margin: 4px 0;
  text-align: center;

  span {
    font-size: 11px;
    color: #94a3b8;
    font-style: italic;
  }
`

const SearchBarWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  gap: 8px;
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
  font-size: 12px;
  pointer-events: auto;

  &:focus-within {
    border-color: #38bdf8;
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.25);
  }

  input {
    color: #f8fafc;
    padding: 3px 0;
    pointer-events: auto;
    &::placeholder {
      color: #64748b;
      font-size: 12px;
    }
  }
`

const SearchStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 14px;
  background: rgba(30, 41, 59, 0.45);
  font-size: 11px;
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
  padding: 36px 16px;
  color: #64748b;
  text-align: center;
  gap: 8px;
  font-size: 12px;

  svg {
    font-size: 32px;
    color: #475569;
  }
`

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 6px;
  position: relative;
`

const InputTextField = styled(InputBase)`
  flex: 1;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #f8fafc;
  padding: 4px 10px;
  font-size: 13px;

  &:focus-within {
    border-color: #38bdf8;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.25);
  }

  textarea {
    color: #f8fafc;
    padding: 4px 0;
    resize: none;
    line-height: 1.4;
    max-height: 110px;
    &::placeholder {
      color: #64748b;
      opacity: 1;
      font-size: 12px;
    }
  }

  input {
    color: #f8fafc;
    padding: 4px 0;
    &::placeholder {
      color: #64748b;
      opacity: 1;
      font-size: 12px;
    }
  }
`

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 60px;
  right: 12px;
  z-index: 1100;
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
                  width: 8,
                  height: 8,
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const chatMessages = useAppSelector((state) => state.chat.chatMessages)
  const focused = useAppSelector((state) => state.chat.focused)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const playerName = useAppSelector((state) => state.user.playerName)
  const currentStatus = useAppSelector((state) => state.user.currentStatus)
  const dispatch = useAppDispatch()
  const game = phaserGame.scene.keys.game as Game

  const myName = playerName || game?.myPlayer?.playerName?.text || ''

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
      }
      // Enter (không Shift) -> Cho phép xuống dòng bình thường trong textarea
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (focused && showChat) {
      // Chỉ focus vào ô nhập tin nhắn nếu người dùng không đang nhập ở ô tìm kiếm
      if (document.activeElement !== searchInputRef.current) {
        inputRef.current?.focus()
      }
    }
  }, [focused, showChat])

  useEffect(() => {
    if (!searchQuery) {
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
    <SidebarContainer $showChat={showChat}>
      {/* Nút Tab gắn ở cạnh phải sidebar để mở/đóng thuận tiện */}
      <Tooltip title={showChat ? 'Thu gọn chat' : 'Mở khung chat (Enter)'} placement="right">
        <SidebarToggleTab
          onClick={() => {
            const next = !showChat
            dispatch(setShowChat(next))
            if (next) dispatch(setFocused(true))
          }}
          aria-label="Toggle chat sidebar"
        >
          {showChat ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          <ChatBubbleOutlineIcon fontSize="small" />
          <span>CHAT</span>
        </SidebarToggleTab>
      </Tooltip>

      {/* Header Sidebar */}
      <SidebarHeader>
        <div className="header-left">
          <div className="title">
            <ChatBubbleOutlineIcon />
            <span>Chat Văn Phòng</span>
          </div>
          <span className="subtitle">Enter: xuống dòng • Shift+Enter: gửi tin</span>
        </div>
        <Tooltip title="Thu gọn (Esc)">
          <IconButton
            size="small"
            onClick={() => {
              dispatch(setShowChat(false))
              dispatch(setFocused(false))
            }}
            sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </SidebarHeader>

      {/* Thanh Search Tin Nhắn */}
      <SearchBarWrapper
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <SearchIcon sx={{ color: '#64748b', fontSize: 18 }} />
        <SearchInput
          inputRef={searchInputRef}
          placeholder="Tìm kiếm tin nhắn, người gửi..."
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
                searchInputRef.current?.blur()
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
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </SearchBarWrapper>

      {/* Thông tin số lượng kết quả khi đang tìm kiếm */}
      {searchQuery.trim() && (
        <SearchStatus>
          <span>
            Tìm thấy <strong>{filteredMessages.length}</strong> tin nhắn
          </span>
          <span className="clear-btn" onClick={() => setSearchQuery('')}>
            Xóa bộ lọc
          </span>
        </SearchStatus>
      )}

      {/* Danh sách tin nhắn */}
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
            <div>Không tìm thấy tin nhắn nào khớp với &quot;{searchQuery}&quot;</div>
          </EmptySearchResult>
        ) : (
          <EmptySearchResult>
            <ChatBubbleOutlineIcon />
            <div>Chưa có tin nhắn nào trong phòng.</div>
          </EmptySearchResult>
        )}
        <div ref={messagesEndRef} />
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
      </ChatMessagesBox>

      {/* Khung nhập tin nhắn ở chân sidebar (Multiline: Enter xuống dòng, Shift+Enter gửi) */}
      <InputWrapper>
        <InputTextField
          inputRef={inputRef}
          multiline
          minRows={1}
          maxRows={4}
          autoFocus={focused}
          placeholder="Nhập tin nhắn... (Enter: xuống dòng, Shift+Enter: gửi)"
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onFocus={() => {
            if (!focused) {
              dispatch(setFocused(true))
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
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            sx={{ color: '#94a3b8', mb: '4px', '&:hover': { color: '#facc15' } }}
          >
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Gửi tin nhắn (Shift + Enter)">
          <IconButton
            size="small"
            aria-label="send message"
            onClick={handleSendMessage}
            sx={{
              color: '#38bdf8',
              mb: '4px',
              background: 'rgba(56, 189, 248, 0.1)',
              '&:hover': { background: '#0284c7', color: '#ffffff' },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </InputWrapper>
    </SidebarContainer>
  )
}
