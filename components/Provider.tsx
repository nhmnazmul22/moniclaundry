// app/providers.tsx
"use client";

import { Toaster } from "@/components/ui/toaster";
import { BranchContextProvider } from "@/contexts/branch-context";
import { store } from "@/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <BranchContextProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </BranchContextProvider>
      </SessionProvider>
    </Provider>
  );
}
