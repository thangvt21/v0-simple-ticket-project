"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, AlertCircle, Search, Filter, X, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import EditIssueForm from "./edit-issue-form"
import { useAuth } from "@/contexts/auth-context"
import { ExportIssues } from "./export-issues"
import { IssueTableSkeleton } from "./skeleton/issue-skeleton"

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
  created_by: number
  creator_username: string
  assigned_to: number | null
  assignee_username: string | null
}

type IssueType = {
  id: number
  type_name: string
}

type User = {
  id: number
  username: string
}

export default function IssuesDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const { user: currentUser, canManageIssue } = useAuth()
  const [issues, setIssues] = useState<Issue[]>([])
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFilters, setIsLoadingFilters] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    typeId: "",
    assignedTo: "",
    startDate: "",
    endDate: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 10

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    fetchFiltersData()
  }, [currentUser, router])

  useEffect(() => {
    if (currentUser) {
      fetchIssues(currentPage)
    }
  }, [currentPage, currentUser])

  async function fetchFiltersData() {
    try {
      setIsLoadingFilters(true)

      // Fetch issue types
      const typesResponse = await fetch("/api/issue-types")
      if (!typesResponse.ok) {
        throw new Error(`Failed to fetch issue types: ${typesResponse.status} ${typesResponse.statusText}`)
      }
      const typesData = await typesResponse.json()

      if (typesData.types) {
        setIssueTypes(typesData.types)
      }

      // Fetch users
      const usersResponse = await fetch("/api/users")
      if (!usersResponse.ok) {
        throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`)
      }
      const usersData = await usersResponse.json()

      if (usersData.users) {
        setUsers(usersData.users)
      }
    } catch (error) {
      console.error("Failed to fetch filters data:", error)
      setError(`Failed to load filters data: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to load filters data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingFilters(false)
    }
  }

  async function fetchIssues(page: number) {
    try {
      setIsLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (filters.search) params.append("search", filters.search)
      if (filters.typeId) params.append("typeId", filters.typeId)
      if (filters.assignedTo) params.append("assignedTo", filters.assignedTo)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      console.log("Fetching issues with params:", params.toString())
      const response = await fetch(`/api/issues?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch issues: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Received issues data:", data)

      setIssues(data.issues || [])
      setTotalPages(Math.ceil(data.total / pageSize))
    } catch (error) {
      console.error("Failed to fetch issues:", error)
      setError(`Failed to fetch issues: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to fetch issues: ${error.message}`,
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

  // Update the handleDeleteIssue function to use optimistic updates
  function handleDeleteIssue(issueId: number) {
    setIssueToDelete(issueId)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteIssue() {
    if (!issueToDelete) return

    // Optimistically update UI
    const previousIssues = [...issues]

    try {
      setIsDeleting(true)

      // Optimistically update UI
      setIssues(issues.filter((issue) => issue.id !== issueToDelete))

      const response = await fetch(`/api/issues/${issueToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete issue: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Issue deleted successfully",
        })
        // No need to refresh since we already updated optimistically
      } else {
        // Revert optimistic update on error
        setIssues(previousIssues)
        toast({
          title: "Error",
          description: data.error || "Failed to delete issue",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Revert optimistic update on error
      setIssues(previousIssues)
      console.error("Failed to delete issue:", error)
      toast({
        title: "Error",
        description: `Failed to delete issue: ${error.message}`,
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

  function handleFilterChange(name: string, value: string) {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function applyFilters() {
    setCurrentPage(1)
    fetchIssues(1)
  }

  function resetFilters() {
    setFilters({
      search: "",
      typeId: "",
      assignedTo: "",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(1)
    fetchIssues(1)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters()
                }
              }}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button variant="outline" className="sm:w-auto" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={() => fetchIssues(currentPage)} title="Refresh issues">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md">
            <div className="space-y-2">
              <Label htmlFor="typeId">Issue Type</Label>
              <Select value={filters.typeId} onValueChange={(value) => handleFilterChange("typeId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={filters.assignedTo} onValueChange={(value) => handleFilterChange("assignedTo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="null">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>

            <div className="col-span-full flex justify-end">
              <Button variant="outline" onClick={resetFilters} className="gap-2">
                <X className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-4">
        <ExportIssues issues={issues} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Time Issued</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <IssueTableSkeleton />
            ) : issues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No issues found.{" "}
                  {currentUser ? `Try adding an issue or refreshing the page.` : "Please log in to view issues."}
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
                  <TableCell>{issue.creator_username}</TableCell>
                  <TableCell>
                    {issue.assignee_username ? (
                      issue.assignee_username
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
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
                      {canManageIssue(issue.created_by) && (
                        <>
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
                        </>
                      )}
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
