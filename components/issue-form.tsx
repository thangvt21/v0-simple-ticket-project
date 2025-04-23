"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitIssue } from "@/lib/actions"
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

type IssueType = {
  id: number
  type_name: string
}

export default function IssueForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [newTypeName, setNewTypeName] = useState("")
  const [isAddingType, setIsAddingType] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resultMessage, setResultMessage] = useState("")

  // Fetch issue types on component mount
  useEffect(() => {
    fetchIssueTypes()
  }, [])

  async function fetchIssueTypes() {
    try {
      setIsLoadingTypes(true)
      const response = await fetch("/api/issue-types")
      const data = await response.json()

      if (data.types) {
        setIssueTypes(data.types)
      }
    } catch (error) {
      console.error("Failed to fetch issue types:", error)
      toast({
        title: "Error",
        description: "Failed to load issue types",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTypes(false)
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
      const response = await fetch("/api/issue-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ typeName: newTypeName }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
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
      toast({
        title: "Error",
        description: "Failed to add issue type",
        variant: "destructive",
      })
    } finally {
      setIsAddingType(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await submitIssue(formData)

      // Show success dialog
      setIsSuccess(true)
      setResultMessage("Issue has been submitted successfully!")
      setResultDialogOpen(true)

      // Reset the form
      const form = document.getElementById("issueForm") as HTMLFormElement
      form.reset()
    } catch (error) {
      console.error("Error submitting issue:", error)

      // Show error dialog
      setIsSuccess(false)
      setResultMessage("Failed to submit issue. Please try again.")
      setResultDialogOpen(true)
    } finally {
      setIsSubmitting(false)
    }
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
        <form id="issueForm" action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Issue Title</Label>
              <Input id="issueTitle" name="issueTitle" placeholder="Brief description of the issue" required />
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
              <Select name="issueTypeId">
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
              <Label htmlFor="timeIssued">Time Issued</Label>
              <Input id="timeIssued" name="timeIssued" type="datetime-local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Describe Issue</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the issue"
                className="min-h-[100px]"
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeStart">Time Start</Label>
                <Input id="timeStart" name="timeStart" type="datetime-local" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFinish">Time Finish</Label>
                <Input id="timeFinish" name="timeFinish" type="datetime-local" />
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
                    window.location.href = "/dashboard"
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
