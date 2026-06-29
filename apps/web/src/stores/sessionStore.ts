import { create } from 'zustand'

interface SessionState {
  activeSessionId: string | null
  isSidebarOpen: boolean
  setActiveSession: (id: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  isSidebarOpen: true,
  setActiveSession: (id) => set({ activeSessionId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}))
