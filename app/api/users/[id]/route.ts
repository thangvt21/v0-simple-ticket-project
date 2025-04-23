import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getCurrentUser, isAdmin, hashPassword } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id
    const connection = await createConnection()

    try {
      const [rows] = await connection.execute("SELECT id, username, email, role, created_at FROM users WHERE id = ?", [
        id,
      ])

      if (Array.isArray(rows) && rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      return NextResponse.json({ user: rows[0] })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "An error occurred while fetching user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id
    const { username, email, password, role } = await request.json()

    // Validate input
    if (!username || !email || !role) {
      return NextResponse.json({ error: "Username, email, and role are required" }, { status: 400 })
    }

    const connection = await createConnection()

    try {
      // If password is provided, update it too
      if (password) {
        const hashedPassword = await hashPassword(password)
        await connection.execute("UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?", [
          username,
          email,
          hashedPassword,
          role,
          id,
        ])
      } else {
        await connection.execute("UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?", [
          username,
          email,
          role,
          id,
        ])
      }

      return NextResponse.json({ success: true })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "An error occurred while updating user" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id

    // Prevent deleting self
    if (currentUser.id.toString() === id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const connection = await createConnection()

    try {
      // First update any issues where this user is creator or assignee
      await connection.execute("UPDATE issues SET assigned_to = NULL WHERE assigned_to = ?", [id])

      // Check if user has created any issues
      const [issueRows] = await connection.execute("SELECT COUNT(*) as count FROM issues WHERE created_by = ?", [id])

      const issueCount = Array.isArray(issueRows) && issueRows.length > 0 ? (issueRows[0] as any).count : 0

      if (issueCount > 0) {
        return NextResponse.json({ error: "Cannot delete user who has created issues" }, { status: 400 })
      }

      // Delete the user
      await connection.execute("DELETE FROM users WHERE id = ?", [id])

      return NextResponse.json({ success: true })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "An error occurred while deleting user" }, { status: 500 })
  }
}
