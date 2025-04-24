import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getCurrentUser, isAdmin, createUser } from "@/lib/auth"

// Modify the GET handler to allow regular users to access a limited version of the users list
export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const connection = await createConnection()

    try {
      // If the request is for the user list for filtering/assignment purposes
      // (indicated by a query parameter or the lack of admin role)
      const url = new URL(request.url)
      const forFiltering = url.searchParams.get("forFiltering") === "true" || !isAdmin(currentUser)

      if (forFiltering) {
        // For regular users or filtering purposes, return a limited set of user data
        const [rows] = await connection.execute("SELECT id, username FROM users ORDER BY username ASC")
        return NextResponse.json({ users: rows })
      } else if (isAdmin(currentUser)) {
        // For admin users requesting full user management data
        const [rows] = await connection.execute(
          "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC",
        )
        return NextResponse.json({ users: rows })
      } else {
        // If not admin and not for filtering, deny access
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
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
