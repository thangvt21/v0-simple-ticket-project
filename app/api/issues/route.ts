import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || ""
    const typeId = searchParams.get("typeId") || ""
    const assignedTo = searchParams.get("assignedTo") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize

    // Build query conditions
    const conditions = []
    const params = []

    // Search condition
    if (search) {
      conditions.push("(i.issue_title LIKE ? OR i.description LIKE ?)")
      params.push(`%${search}%`, `%${search}%`)
    }

    // Type filter
    if (typeId && typeId !== "all") {
      conditions.push("i.issue_type_id = ?")
      params.push(typeId)
    }

    // Assigned to filter
    if (assignedTo) {
      if (assignedTo === "null") {
        conditions.push("i.assigned_to IS NULL")
      } else if (assignedTo !== "all") {
        conditions.push("i.assigned_to = ?")
        params.push(assignedTo)
      }
    }

    // Date range filter
    if (startDate) {
      conditions.push("i.time_issued >= ?")
      params.push(startDate)
    }

    if (endDate) {
      conditions.push("i.time_issued <= ?")
      params.push(endDate)
    }

    // If not admin, only show issues created by or assigned to the user
    if (!isAdmin(currentUser)) {
      conditions.push("(i.created_by = ? OR i.assigned_to = ?)")
      params.push(currentUser.id, currentUser.id)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM issues i 
      ${whereClause}
    `

    const countResult = (await query(countQuery, params)) as any[]
    const total = countResult.length > 0 ? countResult[0].total : 0

    // Get issues with pagination and join with issue types and users
    const issuesQuery = `
      SELECT 
        i.*, 
        it.type_name,
        creator.username as creator_username,
        assignee.username as assignee_username
      FROM issues i 
      LEFT JOIN issues_type it ON i.issue_type_id = it.id
      LEFT JOIN users creator ON i.created_by = creator.id
      LEFT JOIN users assignee ON i.assigned_to = assignee.id
      ${whereClause}
      ORDER BY i.created_at DESC 
      LIMIT ? OFFSET ?
    `

    const issues = await query(issuesQuery, [...params, pageSize, offset])

    return NextResponse.json({
      issues,
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

// Update the POST method similarly
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { issueTitle, issueTypeId, timeIssued, description, solution, timeStart, timeFinish, assignedTo } = body

    // Validate required fields
    if (!issueTitle || !timeIssued || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert the issue
    const result = (await query(
      `INSERT INTO issues (
        issue_title,
        issue_type_id, 
        time_issued, 
        description, 
        solution, 
        time_start, 
        time_finish,
        created_by,
        assigned_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        issueTitle,
        issueTypeId || null,
        timeIssued,
        description,
        solution || null,
        timeStart || null,
        timeFinish || null,
        currentUser.id,
        assignedTo === "unassigned" ? null : assignedTo || null,
      ],
    )) as any

    return NextResponse.json({
      success: true,
      issueId: result.insertId,
    })
  } catch (error) {
    console.error("Failed to create issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
