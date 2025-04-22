import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function GET() {
  try {
    const connection = await createConnection()
    const [rows] = await connection.execute("SELECT * FROM issues ORDER BY created_at DESC")
    await connection.end()

    return NextResponse.json({ issues: rows })
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

