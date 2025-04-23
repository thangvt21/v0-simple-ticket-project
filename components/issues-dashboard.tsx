"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import EditIssueForm from "./edit-issue-form"

type Issue = {
  id: number
  issue_title: string
  issue_type_id: number
  type_name?: string
  time_issued: string
  description: string
  solution: string | null
  time_start: string | null
  time_finish: string | null
  created_at: string
}

export default function IssuesDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const pageSize = 10

  useEffect(() => {
    fetchIssues(currentPage)
  }, [currentPage])

  async function fetchIssues(page: number) {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/issues?page=${page}&pageSize=${pageSize}`)
      const data = await response.json()

      if (response.ok) {
        setIssues(data.issues)
        setTotalPages(Math.ceil(data.total / pageSize))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch issues",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch issues:", error)
      toast({
        title: "Error",
        description: "Failed to fetch issues. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditIssue(issue: Issue) {
    setIssueToEdit(issue)
    setEditDialogOpen(true)
  }

  function handleDeleteIssue(issueId: number) {
    setIssueToDelete(issueId)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteIssue() {
    if (!issueToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/issues/${issueToDelete}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Issue deleted successfully",
        })
        // Refresh issues list
        fetchIssues(currentPage)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete issue",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete issue:", error)
      toast({
        title: "Error",
        description: "Failed to delete issue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setIssueToDelete(null)
    }
  }

  function handleIssueUpdated() {
    setEditDialogOpen(false)
    setIssueToEdit(null)
    fetchIssues(currentPage)
    toast({
      title: "Success",
      description: "Issue updated successfully",
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Time Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading issues...
                </TableCell>
              </TableRow>
            ) : issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No issues found
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.id}</TableCell>
                  <TableCell>{issue.issue_title}</TableCell>
                  <TableCell>
                    {issue.type_name ? (
                      <Badge variant="outline">{issue.type_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(issue.time_issued)}</TableCell>
                  <TableCell>
                    {issue.time_finish ? (
                      <Badge className="bg-green-500">Completed</Badge>
                    ) : issue.time_start ? (
                      <Badge className="bg-yellow-500">In Progress</Badge>
                    ) : (
                      <Badge className="bg-blue-500">Open</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditIssue(issue)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteIssue(issue.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => {
              // Show first page, last page, and pages around current page
              if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(i + 1)
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              }

              // Show ellipsis for skipped pages
              if ((i === 1 && currentPage > 4) || (i === totalPages - 2 && currentPage < totalPages - 3)) {
                return (
                  <PaginationItem key={i}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }

              return null
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteIssue} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Issue Dialog */}
      {issueToEdit && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Issue</DialogTitle>
              <DialogDescription>Make changes to the issue details below.</DialogDescription>
            </DialogHeader>
            <EditIssueForm
              issue={issueToEdit}
              onSuccess={handleIssueUpdated}
              onCancel={() => setEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
