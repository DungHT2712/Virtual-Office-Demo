import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'

import DescriptionIcon from '@mui/icons-material/Description'
import CategoryIcon from '@mui/icons-material/Category'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { useAppSelector } from '../hooks'
import {
  DocumentType,
  WorkspaceDocument,
  WorkspaceProject,
  WorkspaceUser,
  DEFAULT_DOCUMENT_TYPES,
  DEFAULT_DOCUMENTS,
} from '../types/core'
import DocumentTypeConfigDialog from './DocumentTypeConfigDialog'
import DocumentUploadDialog from './DocumentUploadDialog'

const SidebarCard = styled.div<{ $collapsed: boolean }>`
  position: relative;
  width: 280px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
  padding: ${(props) => (props.$collapsed ? '8px 12px' : '10px 12px')};
  color: #f8fafc;
  user-select: none;
  pointer-events: auto;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 600px) {
    width: calc(100vw - 32px);
  }
`

const ToggleOpenPill = styled.div`
  position: relative;
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 5px 12px 5px 6px;
  color: #f8fafc;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(14, 165, 233, 0.4);
    transform: translateX(3px);
    box-shadow: 0 6px 20px rgba(14, 165, 233, 0.25);

    .chevron-icon {
      transform: translateX(2px);
      color: #38bdf8;
    }
  }

  .label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #f8fafc;
  }

  .chevron-icon {
    font-size: 16px;
    color: #94a3b8;
    transition: transform 0.2s ease, color 0.2s ease;
  }
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconBadge = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(56, 189, 248, 0.2));
  border: 1px solid rgba(14, 165, 233, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
`

const TitleText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  .name {
    font-size: 13px;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.5px;
  }
`

const HeaderRightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const ModuleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 2px;
`

const ModuleItem = styled.div<{ $accentColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(30, 41, 59, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.85);
    border-color: ${(props) => props.$accentColor};
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

    .chevron {
      color: ${(props) => props.$accentColor};
      transform: translateX(2px);
    }
  }

  .chevron {
    color: #64748b;
    transition: all 0.2s ease;
  }
`

const ModuleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
`

const ModuleIconBox = styled.div<{ $color: string; $bg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(props) => props.$bg};
  border: 1px solid ${(props) => props.$color}40;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color};
  flex-shrink: 0;
`

const ModuleTextBlock = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 1.25;

  .module-title {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .module-sub {
    font-size: 11px;
    color: #94a3b8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const FooterNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 0 4px;
  font-size: 10px;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`

interface Props {
  projects?: WorkspaceProject[]
  users?: WorkspaceUser[]
}

export default function DocumentSidebar({ projects = [], users = [] }: Props) {
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const roomId = useAppSelector((state) => state.room.roomId)
  const currentUserName = useAppSelector((state) => state.user.playerName)
  const currentUserId = useAppSelector((state) => state.user.userId)

  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem('skyoffice_document_sidebar_visible')
    return stored !== 'false'
  })

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('skyoffice_document_sidebar_collapsed') === 'true'
  })

  // State Document Types & Documents
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() => {
    try {
      const stored = localStorage.getItem(`skyoffice_doc_types_${roomId}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_DOCUMENT_TYPES
  })

  const [documents, setDocuments] = useState<WorkspaceDocument[]>(() => {
    try {
      const stored = localStorage.getItem(`skyoffice_docs_${roomId}`)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_DOCUMENTS
  })

  // Dialogs
  const [openTypeDialog, setOpenTypeDialog] = useState(false)
  const [openDocDialog, setOpenDocDialog] = useState(false)

  // Fetch từ server khi roomId thay đổi
  useEffect(() => {
    if (!roomId) return

    let isMounted = true
    const fetchDocumentsData = async () => {
      try {
        const res = await fetch(`/api/workspaces/${roomId}/documents-data`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && isMounted) {
            if (data.documentTypes && data.documentTypes.length > 0) {
              setDocumentTypes(data.documentTypes)
              localStorage.setItem(`skyoffice_doc_types_${roomId}`, JSON.stringify(data.documentTypes))
            }
            if (data.documents && data.documents.length > 0) {
              setDocuments(data.documents)
              localStorage.setItem(`skyoffice_docs_${roomId}`, JSON.stringify(data.documents))
            }
          }
        }
      } catch (err) {
        console.warn('Could not load documents from API, using cached state', err)
      }
    }

    fetchDocumentsData()
    return () => {
      isMounted = false
    }
  }, [roomId])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('skyoffice_document_sidebar_collapsed', String(next))
  }

  const handleToggleVisible = (nextVal: boolean) => {
    setVisible(nextVal)
    localStorage.setItem('skyoffice_document_sidebar_visible', String(nextVal))
  }

  if (designMode) return null

  const safeUsers = users && users.length > 0 ? users : [
    {
      id: currentUserId,
      name: currentUserName,
      username: currentUserName.toLowerCase().replace(/\s+/g, ''),
      role: 'Member',
      status: 'active' as const,
    },
  ]

  return (
    <>
      {!visible ? (
        <Tooltip title="Mở thanh Document (Loại tài liệu, Upload...)">
          <ToggleOpenPill onClick={() => handleToggleVisible(true)}>
            <IconBadge style={{ width: 22, height: 22, borderRadius: 6 }}>
              <DescriptionIcon sx={{ fontSize: 13 }} />
            </IconBadge>
            <span className="label">Document</span>
            <ChevronRightIcon className="chevron-icon" />
          </ToggleOpenPill>
        </Tooltip>
      ) : (
        <SidebarCard $collapsed={collapsed}>
          {/* Header bar */}
          <HeaderRow>
            <HeaderLeft>
              <IconBadge>
                <DescriptionIcon sx={{ fontSize: 16 }} />
              </IconBadge>
              <TitleText>
                <span className="name">Document</span>
                <Chip
                  label="Frappe"
                  size="small"
                  sx={{
                    height: '16px',
                    fontSize: '9px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(14, 165, 233, 0.15)',
                    color: '#38bdf8',
                    borderRadius: '4px',
                  }}
                />
              </TitleText>
            </HeaderLeft>

            <HeaderRightGroup>
              <Tooltip title={collapsed ? 'Mở rộng module' : 'Thu gọn module'}>
                <IconButton
                  size="small"
                  onClick={toggleCollapse}
                  sx={{
                    color: '#94a3b8',
                    padding: '3px',
                    '&:hover': { color: '#f8fafc', background: 'rgba(255, 255, 255, 0.08)' },
                  }}
                >
                  {collapsed ? (
                    <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>

              <Tooltip title="Ẩn thanh Document">
                <IconButton
                  size="small"
                  onClick={() => handleToggleVisible(false)}
                  sx={{
                    color: '#94a3b8',
                    padding: '3px',
                    '&:hover': { color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)' },
                  }}
                >
                  <VisibilityOffIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </HeaderRightGroup>
          </HeaderRow>

          {/* Module List khi mở rộng */}
          {!collapsed && (
            <>
              <ModuleList>
                {/* 1. Module Loại Document */}
                <ModuleItem
                  $accentColor="#0ea5e9"
                  onClick={() => setOpenTypeDialog(true)}
                >
                  <ModuleLeft>
                    <ModuleIconBox $color="#38bdf8" $bg="rgba(14, 165, 233, 0.15)">
                      <CategoryIcon sx={{ fontSize: 18 }} />
                    </ModuleIconBox>
                    <ModuleTextBlock>
                      <span className="module-title">Loại Document</span>
                      <span className="module-sub">
                        {documentTypes.length} loại tài liệu • Thiết lập phân loại
                      </span>
                    </ModuleTextBlock>
                  </ModuleLeft>
                  <ChevronRightIcon className="chevron" sx={{ fontSize: 18 }} />
                </ModuleItem>

                {/* 2. Module Document (Upload & Quản lý) */}
                <ModuleItem
                  $accentColor="#10b981"
                  onClick={() => setOpenDocDialog(true)}
                >
                  <ModuleLeft>
                    <ModuleIconBox $color="#34d399" $bg="rgba(16, 185, 129, 0.15)">
                      <CloudUploadIcon sx={{ fontSize: 18 }} />
                    </ModuleIconBox>
                    <ModuleTextBlock>
                      <span className="module-title">Document</span>
                      <span className="module-sub">
                        {documents.length} tài liệu • Upload & Quản lý file
                      </span>
                    </ModuleTextBlock>
                  </ModuleLeft>
                  <ChevronRightIcon className="chevron" sx={{ fontSize: 18 }} />
                </ModuleItem>
              </ModuleList>

              <FooterNote>
                <span>Chuẩn Frappe Document Management</span>
                <span>{documents.length} files đã lưu</span>
              </FooterNote>
            </>
          )}
        </SidebarCard>
      )}

      {/* Dialog Loại Document */}
      <DocumentTypeConfigDialog
        open={openTypeDialog}
        onClose={() => setOpenTypeDialog(false)}
        roomId={roomId}
        documentTypes={documentTypes}
        documents={documents}
        onSave={(updated) => setDocumentTypes(updated)}
      />

      {/* Dialog Document (Upload & Quản lý) */}
      <DocumentUploadDialog
        open={openDocDialog}
        onClose={() => setOpenDocDialog(false)}
        roomId={roomId}
        documents={documents}
        documentTypes={documentTypes}
        projects={projects}
        users={safeUsers}
        currentUserName={currentUserName}
        onSave={(updated) => setDocuments(updated)}
      />
    </>
  )
}
