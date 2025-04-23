import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getCurrentUser, isAdmin, canManageIssue } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const connection = await createConnection()

    try {
      const [rows] = await connection.execute(
        `
        SELECT 
          i.*, 
          it.type_name,
          creator.username as creator_username,
          assignee.username as assignee_username
        FROM issues i 
        LEFT JOIN issues_type it ON i.issue_type_id = it.id
        LEFT JOIN users creator ON i.created_by = creator.id
        LEFT JOIN users assignee ON i.assigned_to = assignee.id
        WHERE i.id = ?
        `,
        [id],
      )

      if (Array.isArray(rows) && rows.length === 0) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 })
      }

      const issue = rows[0] as any

      // Check if user has permission to view this issue
      if (!isAdmin(currentUser) && currentUser.id !== issue.created_by && currentUser.id !== issue.assigned_to) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      return NextResponse.json({ issue })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Failed to fetch issue:", error)
    return NextResponse.json({ error: "Failed to fetch issue" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const connection = await createConnection()

    try {
      // Check if issue exists and if user has permission to edit it
      const [issueRows] = await connection.execute("SELECT * FROM issues WHERE id = ?", [id])

      if (Array.isArray(issueRows) && issueRows.length === 0) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 })
      }

      const issue = issueRows[0] as any

      if (!canManageIssue(currentUser, issue.created_by)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      const body = await request.json()
      const { issueTitle, issueTypeId, timeIssued, description, solution, timeStart, timeFinish, assignedTo } = body

      // Validate required fields
      if (!issueTitle || !timeIssued || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      // Update the issue
      await connection.execute(
        `
        UPDATE issues 
        SET 
          issue_title = ?, 
          issue_type_id = ?, 
          time_issued = ?, 
          description = ?, 
          solution = ?, 
          time_start = ?, 
          time_finish = ?,
          assigned_to = ?
        WHERE id = ?
        `,
        [
          issueTitle,
          issueTypeId || null,
          timeIssued,
          description,
          solution || null,
          timeStart || null,
          timeFinish || null,
          assignedTo || null,
          id,
        ],
      )

      return NextResponse.json({ success: true })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Failed to update issue:", error)
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const connection = await createConnection()

    try {
      // Check if issue exists and if user has permission to delete it
      const [issueRows] = await connection.execute("SELECT * FROM issues WHERE id = ?", [id])

      if (Array.isArray(issueRows) && issueRows.length === 0) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 })
      }

      const issue = issueRows[0] as any

      if (!canManageIssue(currentUser, issue.created_by)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Delete the issue
      await connection.execute("DELETE FROM issues WHERE id = ?", [id])

      return NextResponse.json({ success: true })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error("Failed to delete issue:", error)
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 })
  }
}
