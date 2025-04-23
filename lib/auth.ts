import { cookies } from "next/headers"
import { createConnection } from "@/lib/db"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // In production, use a proper secret

export type User = {
  id: number
  username: string
  email: string
  role: "admin" | "user"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(username: string, email: string, password: string, role: "admin" | "user" = "user") {
  const hashedPassword = await hashPassword(password)

  const connection = await createConnection()

  try {
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role],
    )

    return { success: true, userId: (result as any).insertId }
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      if (error.message.includes("username")) {
        throw new Error("Username already exists")
      } else if (error.message.includes("email")) {
        throw new Error("Email already exists")
      }
    }
    throw error
  } finally {
    await connection.end()
  }
}

export async function getUserByEmail(email: string) {
  const connection = await createConnection()

  try {
    const [rows] = await connection.execute("SELECT id, username, email, password, role FROM users WHERE email = ?", [
      email,
    ])

    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as any
    }

    return null
  } finally {
    await connection.end()
  }
}

export async function getUserById(id: number) {
  const connection = await createConnection()

  try {
    const [rows] = await connection.execute("SELECT id, username, email, role FROM users WHERE id = ?", [id])

    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as User
    }

    return null
  } finally {
    await connection.end()
  }
}

export function generateToken(user: { id: number; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; role: string }
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  return getUserById(payload.id)
}

export function isAdmin(user: User | null) {
  return user?.role === "admin"
}

export function canManageIssue(user: User | null, issueCreatorId: number) {
  if (!user) return false
  return user.role === "admin" || user.id === issueCreatorId
}
