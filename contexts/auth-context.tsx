"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: number
  username: string
  email: string
  role: "admin" | "user"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  canManageIssue: (creatorId: number) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  async function login(email: string, password: string) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  async function register(username: string, email: string, password: string) {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      const data = await response.json()
      setUser(data.user)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  function isAdmin() {
    return user?.role === "admin"
  }

  function canManageIssue(creatorId: number) {
    if (!user) return false
    return user.role === "admin" || user.id === creatorId
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        canManageIssue,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
