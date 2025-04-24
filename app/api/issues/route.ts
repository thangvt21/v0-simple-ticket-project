import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"
import { getCurrentUser, isAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  let connection = null
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Current user:", currentUser)

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || ""
    const typeId = searchParams.get("typeId") || ""
    const assignedTo = searchParams.get("assignedTo") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    console.log("Query parameters:", { page, pageSize, search, typeId, assignedTo, startDate, endDate })

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize

    // Build query conditions
    let whereClause = ""
    const countParams = []
    const issueParams = []

    // Start building the WHERE clause
    const conditions = []

    // Search condition
    if (search) {
      conditions.push("(i.issue_title LIKE ? OR i.description LIKE ?)")
      countParams.push(`%${search}%`, `%${search}%`)
      issueParams.push(`%${search}%`, `%${search}%`)
    }

    // Type filter
    if (typeId && typeId !== "all") {
      conditions.push("i.issue_type_id = ?")
      countParams.push(typeId)
      issueParams.push(typeId)
    }

    // Assigned to filter
    if (assignedTo) {
      if (assignedTo === "null") {
        conditions.push("i.assigned_to IS NULL")
      } else if (assignedTo !== "all") {
        conditions.push("i.assigned_to = ?")
        countParams.push(assignedTo)
        issueParams.push(assignedTo)
      }
    }

    // Date range filter
    if (startDate) {
      conditions.push("i.time_issued >= ?")
      countParams.push(startDate)
      issueParams.push(startDate)
    }

    if (endDate) {
      conditions.push("i.time_issued <= ?")
      countParams.push(endDate)
      issueParams.push(endDate)
    }

    // If not admin, only show issues created by or assigned to the user
    if (!isAdmin(currentUser)) {
      conditions.push(`(i.created_by = ? OR i.assigned_to = ?)`)
      countParams.push(currentUser.id, currentUser.id)
      issueParams.push(currentUser.id, currentUser.id)
    }

    // Combine all conditions
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`
    }

    console.log("Where clause:", whereClause)
    console.log("Count params:", countParams)
    console.log("Issue params:", issueParams)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM issues i 
      ${whereClause}
    `

    // Use direct connection for debugging
    connection = await createConnection()

    try {
      console.log("Executing count query:", countQuery)
      const [countRows] = await connection.execute(countQuery, countParams)
      console.log("Count result:", countRows)

      const total = Array.isArray(countRows) && countRows.length > 0 ? (countRows[0] as any).total : 0
      console.log("Total issues:", total)

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

      // Add pagination parameters
      issueParams.push(pageSize, offset)

      console.log("Executing issues query:", issuesQuery)
      console.log("Issues query params:", issueParams)

      const [issueRows] = await connection.execute(issuesQuery, issueParams)
      console.log("Issues result:", issueRows)

      return NextResponse.json({
        issues: issueRows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      })
    } finally {
      if (connection) {
        await connection.end()
      }
    }
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: `Failed to fetch issues: ${error.message}` }, { status: 500 })
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch (err) {
        console.error("Error closing connection:", err)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let connection = null
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { issueTitle, issueTypeId, timeIssued, description, solution, timeStart, timeFinish, assignedTo } = body

    console.log("Creating issue with data:", body)
    console.log("Current user:", currentUser)

    // Validate required fields
    if (!issueTitle || !timeIssued || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get a connection from the pool
    connection = await createConnection()

    // Handle the special values for issueTypeId and assignedTo
    const finalIssueTypeId = issueTypeId === "none" ? null : issueTypeId || null
    const finalAssignedTo = assignedTo === "unassigned" ? null : assignedTo || null

    // Insert the issue
    const [result] = await connection.execute(
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
        finalIssueTypeId,
        timeIssued,
        description,
        solution || null,
        timeStart || null,
        timeFinish || null,
        currentUser.id,
        finalAssignedTo,
      ],
    )

    console.log("Insert result:", result)

    return NextResponse.json({
      success: true,
      issueId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Failed to create issue:", error)
    return NextResponse.json({ error: `Failed to create issue: ${error.message}` }, { status: 500 })
  } finally {
    if (connection) {
      try {
        await connection.end()
      } catch (err) {
        console.error("Error closing connection:", err)
      }
    }
  }
}
