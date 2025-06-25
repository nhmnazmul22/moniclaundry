"use client"

import { supabase } from "@/lib/supabase"
import type { User as AppUser } from "@/types/database"
import type { User } from "@supabase/supabase-js"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

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
  const [profileLoading, setProfileLoading] = useState(false)

  const fetchUserProfile = useCallback(
    async (userId: string, email: string) => {
      if (profileLoading) return // Prevent multiple simultaneous calls

      setProfileLoading(true)
      try {
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

          if (!createError && createdUser) {
            setUserProfile(createdUser)
          } else {
            console.error("Error creating user:", createError)
          }
        } else if (!error && data) {
          setUserProfile(data)
        } else if (error) {
          console.error("Error fetching user profile:", error)
        }
      } catch (error) {
        console.error("Unexpected error fetching user profile:", error)
      } finally {
        setProfileLoading(false)
      }
    },
    [profileLoading],
  )

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email!)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth event:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!)
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove fetchUserProfile from dependencies to prevent loops

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
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
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
