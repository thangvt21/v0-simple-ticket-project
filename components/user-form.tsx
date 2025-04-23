"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: number
  username: string
  email: string
  role: "admin" | "user"
}

interface UserFormProps {
  user?: User | null
  onSuccess: () => void
  onCancel: () => void
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    role: user?.role || "user",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!user

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  function handleSelectChange(value: string) {
    setFormData((prev) => ({ ...prev, role: value as "admin" | "user" }))
  }

  function validateForm() {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/users/${user.id}` : "/api/users"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: data.error || `Failed to ${isEditing ? "update" : "create"} user`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Failed to ${isEditing ? "update" : "create"} user:`, error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} user. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{isEditing ? "Password (leave blank to keep current)" : "Password"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required={!isEditing}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required={!isEditing || !!formData.password}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? "Saving..." : "Creating...") : isEditing ? "Save Changes" : "Create User"}
        </Button>
      </div>
    </form>
  )
}
