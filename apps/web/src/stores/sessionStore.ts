import { create } from 'zustand'

interface SessionState {
  activeSessionId: string | null
  isSidebarOpen: boolean
  isRightPanelOpen: boolean
  rightPanelTab: "files" | "summary" | "edit"
  refreshKey: number
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelTab: (tab: "files" | "summary" | "edit") => void
  triggerRefresh: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  isSidebarOpen: true,
  isRightPanelOpen: false,
  rightPanelTab: "summary",
  refreshKey: 0,
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setRightPanelOpen: (open) => set((state) => {
    // When opening right panel, automatically close the left sidebar
    if (open && state.isSidebarOpen) {
      return { isRightPanelOpen: true, isSidebarOpen: false };
    }
    return { isRightPanelOpen: open };
  }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
