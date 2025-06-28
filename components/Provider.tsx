// app/providers.tsx
"use client";

import { Toaster } from "@/components/ui/toaster";
import { BranchContextProvider } from "@/contexts/branch-context";
import { store } from "@/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionProvider>
        <BranchContextProvider>
          {children}
          <Toaster />
        </BranchContextProvider>
      </SessionProvider>
    </Provider>
  );
}
