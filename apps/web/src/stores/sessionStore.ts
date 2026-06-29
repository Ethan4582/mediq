import { create } from 'zustand'

interface SessionState {
  activeSessionId: string | null
  isSidebarOpen: boolean
  refreshKey: number
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
  triggerRefresh: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  isSidebarOpen: true,
  refreshKey: 0,
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
