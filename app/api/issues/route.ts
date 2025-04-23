import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize

  try {
    const connection = await createConnection()

    // Get total count for pagination
    const [countResult] = await connection.execute("SELECT COUNT(*) as total FROM issues")
    const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any).total : 0

    // Get issues with pagination and join with issue types
    const [rows] = await connection.execute(
      `
      SELECT i.*, it.type_name 
      FROM issues i 
      LEFT JOIN issues_type it ON i.issue_type_id = it.id 
      ORDER BY i.created_at DESC 
      LIMIT ? OFFSET ?
    `,
      [pageSize, offset],
    )

    await connection.end()

    return NextResponse.json({
      issues: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}
