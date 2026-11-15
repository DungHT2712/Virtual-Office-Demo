import React, { useState } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../hooks'
import CoreSidebar from './CoreSidebar'
import ProjectSidebar from './ProjectSidebar'
import DocumentSidebar from './DocumentSidebar'
import { WorkspaceCompany, WorkspaceUser, WorkspaceProject, DEFAULT_COMPANY, DEFAULT_PROJECTS } from '../types/core'

const LeftSidebarContainer = styled.div`
  position: fixed;
  top: 134px;
  left: 16px;
  z-index: 999;
  width: fit-content;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  pointer-events: none !important;
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }

  @media (max-width: 600px) {
    width: calc(100vw - 32px);
    top: 130px;
  }
`

export default function LeftSidebar() {
  const designMode = useAppSelector((state) => state.workspace.designMode)
  const [company, setCompany] = useState<WorkspaceCompany>(DEFAULT_COMPANY)
  const [users, setUsers] = useState<WorkspaceUser[]>([])
  const [projects, setProjects] = useState<WorkspaceProject[]>(DEFAULT_PROJECTS)

  if (designMode) return null

  return (
    <LeftSidebarContainer id="left-sidebar-container" data-pointer-events="none">
      <CoreSidebar onCompanyChange={setCompany} onUsersChange={setUsers} />
      <ProjectSidebar company={company} users={users} onProjectsChange={setProjects} />
      <DocumentSidebar projects={projects} users={users} />
    </LeftSidebarContainer>
  )
}
