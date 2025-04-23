import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const connection = await createConnection()

    const [rows] = await connection.execute(
      `
      SELECT i.*, it.type_name 
      FROM issues i 
      LEFT JOIN issues_type it ON i.issue_type_id = it.id 
      WHERE i.id = ?
    `,
      [id],
    )

    await connection.end()

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 })
    }

    return NextResponse.json({ issue: rows[0] })
  } catch (error) {
    console.error("Failed to fetch issue:", error)
    return NextResponse.json({ error: "Failed to fetch issue" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const body = await request.json()
    const { issueTitle, issueTypeId, timeIssued, description, solution, timeStart, timeFinish } = body

    // Validate required fields
    if (!issueTitle || !timeIssued || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const connection = await createConnection()

    // Update the issue
    const [result] = await connection.execute(
      `
      UPDATE issues 
      SET 
        issue_title = ?, 
        issue_type_id = ?, 
        time_issued = ?, 
        description = ?, 
        solution = ?, 
        time_start = ?, 
        time_finish = ? 
      WHERE id = ?
    `,
      [issueTitle, issueTypeId, timeIssued, description, solution, timeStart, timeFinish, id],
    )

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const connection = await createConnection()

    // Delete the issue
    const [result] = await connection.execute("DELETE FROM issues WHERE id = ?", [id])

    await connection.end()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete issue:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }
}
