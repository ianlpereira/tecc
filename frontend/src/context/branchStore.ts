import { create } from 'zustand'

interface Branch {
  id: number
  name: string
  is_headquarters: boolean
}

interface BranchStore {
  currentBranch: Branch | null
  setCurrentBranch: (branch: Branch | null) => void
}

export const useBranchStore = create<BranchStore>((set) => ({
  currentBranch: null,
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
}))
