import { create } from 'zustand'
import type { Branch } from '../types'

interface BranchStore {
  currentBranch: Branch | null
  includeChildren: boolean
  setCurrentBranch: (branch: Branch | null) => void
  setIncludeChildren: (include: boolean) => void
}

export const useBranchStore = create<BranchStore>((set) => ({
  currentBranch: null,
  includeChildren: true, // Por padrão, incluir filiais no filtro
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
  setIncludeChildren: (include) => set({ includeChildren: include }),
}))
