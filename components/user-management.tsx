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
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, AlertCircle, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { formatDate } from "@/lib/utils"
import UserForm from "./user-form"

type User = {
  id: number
  username: string
  email: string
  role: "admin" | "user"
  created_at: string
}

export default function UserManagement() {
  const { toast } = useToast()
  const router = useRouter()
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Redirect if not admin
    if (currentUser && !isAdmin()) {
      router.push("/dashboard")
      return
    }

    fetchUsers()
  }, [currentUser, isAdmin, router])

  async function fetchUsers() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleEditUser(user: User) {
    setUserToEdit(user)
    setEditDialogOpen(true)
  }

  function handleDeleteUser(userId: number) {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  async function confirmDeleteUser() {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/users/${userToDelete}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        // Refresh users list
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  function handleUserUpdated() {
    setEditDialogOpen(false)
    setUserToEdit(null)
    setCreateDialogOpen(false)
    fetchUsers()
    toast({
      title: "Success",
      description: "User updated successfully",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={user.role === "admin" ? "bg-purple-500" : "bg-blue-500"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      {currentUser?.id !== user.id && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user details below.</DialogDescription>
          </DialogHeader>
          <UserForm user={userToEdit} onSuccess={handleUserUpdated} onCancel={() => setEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Enter the details for the new user.</DialogDescription>
          </DialogHeader>
          <UserForm onSuccess={handleUserUpdated} onCancel={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
