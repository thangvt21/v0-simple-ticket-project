"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type IssueData = {
  issueTitle: string
  timeIssued: string
  description: string
  solution: string
  timeStart: string
  timeFinish: string
}

export default function IssueForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<IssueData | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    // Get form data
    const formData = new FormData(e.currentTarget)
    const issueData: IssueData = {
      issueTitle: formData.get("issueTitle") as string,
      timeIssued: formData.get("timeIssued") as string,
      description: formData.get("description") as string,
      solution: formData.get("solution") as string,
      timeStart: formData.get("timeStart") as string,
      timeFinish: formData.get("timeFinish") as string,
    }

    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted with data:", issueData)
      setSubmittedData(issueData)

      toast({
        title: "Success",
        description: "Issue has been submitted successfully",
      })

      // Reset the form
      e.currentTarget.reset()
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Issue</CardTitle>
        </CardHeader>
        <form id="issueForm" onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issueTitle">Issue Title</Label>
              <Input id="issueTitle" name="issueTitle" placeholder="Brief description of the issue" required />
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

      {submittedData && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Last Submitted Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Issue Title</h3>
                <p>{submittedData.issueTitle}</p>
              </div>
              <div>
                <h3 className="font-medium">Time Issued</h3>
                <p>{submittedData.timeIssued}</p>
              </div>
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{submittedData.description}</p>
              </div>
              {submittedData.solution && (
                <div>
                  <h3 className="font-medium">Solution</h3>
                  <p>{submittedData.solution}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submittedData.timeStart && (
                  <div>
                    <h3 className="font-medium">Time Start</h3>
                    <p>{submittedData.timeStart}</p>
                  </div>
                )}
                {submittedData.timeFinish && (
                  <div>
                    <h3 className="font-medium">Time Finish</h3>
                    <p>{submittedData.timeFinish}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
