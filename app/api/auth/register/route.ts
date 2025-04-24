import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createUser, generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    try {
      // Create user
      const result = await createUser(username, email, password)

      // Generate JWT token
      const token = generateToken({ id: result.userId, role: "user" })

      // Set cookie
      cookies().set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 5, // 5 hours
      })

      return NextResponse.json({
        success: true,
        user: {
          id: result.userId,
          username,
          email,
          role: "user",
        },
      })
    } catch (error: any) {
      if (error.message === "Username already exists" || error.message === "Email already exists") {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
