"use client"

import type React from "react"

import { createContext, type Dispatch, type SetStateAction, useContext, useState, useEffect } from "react"

type BranchContextProviderType = {
  children: React.ReactNode
}

type BranchContextType = {
  currentBranchId: string
  setCurrentBranchId: Dispatch<SetStateAction<string>>
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

export const BranchContextProvider: React.FC<BranchContextProviderType> = ({ children }) => {
  const [currentBranchId, setCurrentBranchId] = useState<string>("")

  // Load saved branch from localStorage on mount
  useEffect(() => {
    const savedBranchId = localStorage.getItem("currentBranchId")
    if (savedBranchId) {
      setCurrentBranchId(savedBranchId)
    }
  }, [])

  // Save branch to localStorage when it changes
  useEffect(() => {
    if (currentBranchId) {
      localStorage.setItem("currentBranchId", currentBranchId)
    }
  }, [currentBranchId])

  return (
    <BranchContext.Provider
      value={{
        currentBranchId: currentBranchId,
        setCurrentBranchId: setCurrentBranchId,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchContextProvider")
  }
  return context
}
