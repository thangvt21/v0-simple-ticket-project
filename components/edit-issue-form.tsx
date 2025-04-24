"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type Issue = {
  id: number
  issue_title: string
  issue_type_id: number | null
  type_name?: string
  time_issued: string
  description: string
  solution: string | null
  time_start: string | null
  time_finish: string | null
  created_by: number
  assigned_to: number | null
}

type IssueType = {
  id: number
  type_name: string
}

type User = {
  id: number
  username: string
}

interface EditIssueFormProps {
  issue: Issue
  onSuccess: () => void
  onCancel: () => void
}

export default function EditIssueForm({ issue, onSuccess, onCancel }: EditIssueFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    issueTitle: issue.issue_title,
    issueTypeId: issue.issue_type_id?.toString() || "",
    timeIssued: issue.time_issued ? issue.time_issued.slice(0, 16) : "",
    description: issue.description,
    solution: issue.solution || "",
    timeStart: issue.time_start ? issue.time_start.slice(0, 16) : "",
    timeFinish: issue.time_finish ? issue.time_finish.slice(0, 16) : "",
    assignedTo: issue.assigned_to?.toString() || "",
  })
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIssueTypes()
    fetchUsers()
  }, [])

  async function fetchIssueTypes() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/issue-types")
      const data = await response.json()

      if (data.types) {
        setIssueTypes(data.types)
      }
    } catch (error) {
      console.error("Failed to fetch issue types:", error)
      setError("Failed to load issue types")
      toast({
        title: "Error",
        description: "Failed to load issue types",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/users?forFiltering=true")
      const data = await response.json()

      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError("Failed to load users")
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/issues/${issue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issueTitle: formData.issueTitle,
          issueTypeId: formData.issueTypeId ? Number.parseInt(formData.issueTypeId) : null,
          timeIssued: formData.timeIssued,
          description: formData.description,
          solution: formData.solution || null,
          timeStart: formData.timeStart || null,
          timeFinish: formData.timeFinish || null,
          assignedTo: formData.assignedTo ? Number.parseInt(formData.assignedTo) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.error || "Failed to update issue")
        toast({
          title: "Error",
          description: data.error || "Failed to update issue",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update issue:", error)
      setError("Failed to update issue. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update issue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="issueTitle">Issue Title</Label>
        <Input id="issueTitle" name="issueTitle" value={formData.issueTitle} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="issueTypeId">Issue Type</Label>
        <Select value={formData.issueTypeId} onValueChange={(value) => handleSelectChange("issueTypeId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select issue type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {issueTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assign To</Label>
        <Select value={formData.assignedTo} onValueChange={(value) => handleSelectChange("assignedTo", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select user to assign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeIssued">Time Issued</Label>
        <Input
          id="timeIssued"
          name="timeIssued"
          type="datetime-local"
          value={formData.timeIssued}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="solution">Solution</Label>
        <Textarea
          id="solution"
          name="solution"
          value={formData.solution}
          onChange={handleChange}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeStart">Time Start</Label>
          <Input
            id="timeStart"
            name="timeStart"
            type="datetime-local"
            value={formData.timeStart}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeFinish">Time Finish</Label>
          <Input
            id="timeFinish"
            name="timeFinish"
            type="datetime-local"
            value={formData.timeFinish}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
