import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getCurrentUser, isAdmin, createUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const connection = await createConnection()

    try {
      const [rows] = await connection.execute(
        "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC",
      )

      return NextResponse.json({ users: rows })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { username, email, password, role } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    try {
      // Create user
      const result = await createUser(username, email, password, role || "user")

      return NextResponse.json({
        success: true,
        userId: result.userId,
      })
    } catch (error: any) {
      if (error.message === "Username already exists" || error.message === "Email already exists") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "An error occurred while creating user" }, { status: 500 })
  }
}
