"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { login, isLoading } = useAuth()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      })
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={error ? "email-error" : undefined}
          aria-invalid={error ? "true" : "false"}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-describedby={error ? "password-error" : undefined}
          aria-invalid={error ? "true" : "false"}
        />
      </div>
      {error && (
        <p id="login-error" className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </Button>
    </form>
  )
}
