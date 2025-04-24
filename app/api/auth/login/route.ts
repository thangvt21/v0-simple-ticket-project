import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, comparePasswords, generateToken } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request as any, { limit: 5, windowMs: 60 * 1000 })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, role: user.role })

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 5, // 5 hours
      sameSite: "strict",
    })

    // Return user info (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
