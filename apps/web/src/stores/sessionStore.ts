import { create } from 'zustand'

interface SessionState {
  activeSessionId: string | null
  isSidebarOpen: boolean
  isRightPanelOpen: boolean
  isFileViewMode: boolean
  rightPanelTab: "files" | "summary" | "edit"
  refreshKey: number
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  setRightPanelOpen: (open: boolean) => void
  setFileViewMode: (open: boolean) => void
  setRightPanelTab: (tab: "files" | "summary" | "edit") => void
  triggerRefresh: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  isSidebarOpen: true,
  isRightPanelOpen: false,
  isFileViewMode: false,
  rightPanelTab: "summary",
  refreshKey: 0,
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setRightPanelOpen: (open) => set((state) => {
    // When opening right panel, automatically close the left sidebar
    if (open && state.isSidebarOpen) {
      return { isRightPanelOpen: true, isSidebarOpen: false, isFileViewMode: false };
    }
    return { isRightPanelOpen: open, isFileViewMode: open ? state.isFileViewMode : false };
  }),
  setFileViewMode: (open) => set((state) => {
    if (open) {
      return { isRightPanelOpen: true, isFileViewMode: true, isSidebarOpen: false, rightPanelTab: "summary" };
    }
    return { isFileViewMode: false };
  }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab, isFileViewMode: false }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
