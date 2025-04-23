import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    const connection = await createConnection()
    await connection.execute("SELECT 1")
    await connection.end()

    return NextResponse.json({ status: "ok", message: "Service is healthy" })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      { status: "error", message: "Service is unhealthy", error: error.message },
      { status: 500 },
    )
  }
}
