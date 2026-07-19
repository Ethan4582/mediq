import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PipelineStatus } from "@/components/chat/ChatPanel"

interface SessionState {
  activeSessionId: string | null
  isSidebarOpen: boolean
  isRightPanelOpen: boolean
  isFileViewMode: boolean
  rightPanelTab: "files" | "summary" | "edit"
  refreshKey: number
  pendingPipelineStatus: PipelineStatus | null
  selectedProvider: string | null
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  setRightPanelOpen: (open: boolean) => void
  setFileViewMode: (open: boolean) => void
  setRightPanelTab: (tab: "files" | "summary" | "edit") => void
  triggerRefresh: () => void
  setPendingPipelineStatus: (status: PipelineStatus | null) => void
  setSelectedProvider: (provider: string | null) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      isSidebarOpen: true,
      isRightPanelOpen: false,
      isFileViewMode: false,
      rightPanelTab: "summary",
      refreshKey: 0,
      pendingPipelineStatus: null,
      selectedProvider: null,
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setRightPanelOpen: (open) => set((state) => {
    // When opening right panel, automatically close the left sidebar
    if (open && state.isSidebarOpen) {
      return { isRightPanelOpen: true, isSidebarOpen: false, isFileViewMode: false };
    }
    if (!open) {
      // When closing right panel, automatically open the left sidebar
      return { isRightPanelOpen: false, isFileViewMode: false, isSidebarOpen: true };
    }
    return { isRightPanelOpen: open, isFileViewMode: open ? state.isFileViewMode : false };
  }),
  setFileViewMode: (open) => set((state) => {
    if (open) {
      return { isRightPanelOpen: true, isFileViewMode: true, isSidebarOpen: false, rightPanelTab: "summary" };
    }
    // When closing file viewer, close the right panel and open the left sidebar
    return { isFileViewMode: false, isRightPanelOpen: false, isSidebarOpen: true };
  }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab, isFileViewMode: false }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
  setPendingPipelineStatus: (status) => set({ pendingPipelineStatus: status }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
    }),
    {
      name: 'session-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ selectedProvider: state.selectedProvider }), // only persist selectedProvider
    }
  )
)
