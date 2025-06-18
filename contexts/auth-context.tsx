"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import type { User as AppUser } from "@/types/database"

interface AuthContextType {
  user: User | null
  userProfile: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!)
      }

      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!)
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // KEMBALI KE TABEL USERS - BUKAN STAFF
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error && error.code === "PGRST116") {
        // User doesn't exist, create one
        const newUser = {
          id: userId,
          email: email,
          full_name: email.split("@")[0],
          role: "admin" as const,
          phone: "",
          address: "",
          is_active: true,
        }

        const { data: createdUser, error: createError } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single()

        if (!createError) {
          setUserProfile(createdUser)
        }
      } else if (!error) {
        setUserProfile(data)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { error: error.message || "Login failed" }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  return <AuthContext.Provider value={{ user, userProfile, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
