"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

type BranchContextProviderType = {
  children: React.ReactNode;
};

type BranchContextType = {
  currentBranchId: string;
  setCurrentBranchId: Dispatch<SetStateAction<string>>;
};

const AuthContext = createContext<BranchContextType | undefined>(undefined);

export const BranchContextProvider: React.FC<BranchContextProviderType> = ({
  children,
}) => {
  const [currentBranchId, setCurrentBranchId] = useState<string>("");

  return (
    <AuthContext.Provider
      value={{
        currentBranchId: currentBranchId,
        setCurrentBranchId: setCurrentBranchId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useBranch() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within an AuthProvider");
  }
  return context;
}
