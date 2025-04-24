"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type IssueType = {
  id: number
  type_name: string
}

type User = {
  id: number
  username: string
}

export default function IssueForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [newTypeName, setNewTypeName] = useState("")
  const [isAddingType, setIsAddingType] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resultMessage, setResultMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    issueTitle: "",
    issueTypeId: "",
    timeIssued: new Date().toISOString().slice(0, 16),
    description: "",
    solution: "",
    timeStart: "",
    timeFinish: "",
    assignedTo: "",
  })

  // Fetch issue types and users on component mount
  useEffect(() => {
    if (currentUser) {
      fetchIssueTypes()
      fetchUsers()
    }
  }, [currentUser])

  async function fetchIssueTypes() {
    try {
      setIsLoadingTypes(true)
      setError(null)
      const response = await fetch("/api/issue-types")

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, don't show an error toast, just return
          return
        }
        throw new Error(`Failed to fetch issue types: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched issue types:", data)

      if (data.types) {
        setIssueTypes(data.types)
      }
    } catch (error) {
      console.error("Failed to fetch issue types:", error)
      setError(`Failed to load issue types: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to load issue types: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingTypes(false)
    }
  }

  // Update the fetchUsers function to specify it's for filtering purposes
  async function fetchUsers() {
    try {
      setIsLoadingUsers(true)
      setError(null)
      const response = await fetch("/api/users?forFiltering=true")

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, don't show an error toast, just return
          return
        }
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Fetched users:", data)

      if (data.users) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setError(`Failed to load users: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to load users: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  async function handleAddType() {
    if (!newTypeName.trim()) {
      toast({
        title: "Error",
        description: "Type name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAddingType(true)
      setError(null)
      const response = await fetch("/api/issue-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ typeName: newTypeName }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to add issue type: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "New issue type added",
        })
        setNewTypeName("")
        setDialogOpen(false)
        await fetchIssueTypes()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add issue type",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add issue type:", error)
      setError(`Failed to add issue type: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to add issue type: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsAddingType(false)
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
      console.log("Submitting form data:", formData)
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to submit issue: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Issue submission response:", data)

      if (response.ok) {
        // Show success dialog
        setIsSuccess(true)
        setResultMessage("Issue has been submitted successfully!")
        setResultDialogOpen(true)

        // Reset the form
        setFormData({
          issueTitle: "",
          issueTypeId: "",
          timeIssued: new Date().toISOString().slice(0, 16),
          description: "",
          solution: "",
          timeStart: "",
          timeFinish: "",
          assignedTo: "",
        })
      } else {
        // Show error dialog
        setIsSuccess(false)
        setResultMessage(data.error || "Failed to submit issue. Please try again.")
        setResultDialogOpen(true)
      }
    } catch (error) {
      console.error("Error submitting issue:", error)
      setError(`Failed to submit issue: ${error.message}`)

      // Show error dialog
      setIsSuccess(false)
      setResultMessage(`Failed to submit issue: ${error.message}`)
      setResultDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="mb-4">Please log in to submit an issue.</p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Submit Issue</CardTitle>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            View All Issues
          </Link>
        </CardHeader>
        {error && (
          <div
            className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form id="issueForm" onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Issue Title</Label>
              <Input
                id="issueTitle"
                name="issueTitle"
                placeholder="Brief description of the issue"
                value={formData.issueTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="issueType">Issue Type</Label>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add Type</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Issue Type</DialogTitle>
                      <DialogDescription>Create a new issue type to categorize your issues.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="newTypeName">Type Name</Label>
                        <Input
                          id="newTypeName"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          placeholder="Enter new issue type"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddType} disabled={isAddingType || !newTypeName.trim()}>
                        {isAddingType ? "Adding..." : "Add Type"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={formData.issueTypeId} onValueChange={(value) => handleSelectChange("issueTypeId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTypes ? (
                    <SelectItem value="loading" disabled>
                      Loading issue types...
                    </SelectItem>
                  ) : issueTypes.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No issue types available
                    </SelectItem>
                  ) : (
                    issueTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.type_name}
                      </SelectItem>
                    ))
                  )}
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
                  {isLoadingUsers ? (
                    <SelectItem value="loading" disabled>
                      Loading users...
                    </SelectItem>
                  ) : users.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No users available
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))
                  )}
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
              <Label htmlFor="description">Describe Issue</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the issue"
                className="min-h-[100px]"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution</Label>
              <Textarea
                id="solution"
                name="solution"
                placeholder="How was the issue resolved?"
                className="min-h-[100px]"
                value={formData.solution}
                onChange={handleChange}
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
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Issue"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Success
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Error
                </>
              )}
            </DialogTitle>
            <DialogDescription>{resultMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {isSuccess ? (
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setResultDialogOpen(false)}>
                  Add Another Issue
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setResultDialogOpen(false)
                    router.push("/dashboard")
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <Button onClick={() => setResultDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
