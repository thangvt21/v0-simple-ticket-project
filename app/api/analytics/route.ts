import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get issues by type
    const issuesByType = await query(`
      SELECT it.type_name as name, COUNT(i.id) as value
      FROM issues_type it
      LEFT JOIN issues i ON it.id = i.issue_type_id
      GROUP BY it.id, it.type_name
      ORDER BY value DESC
    `)

    // Get issues by status
    const issuesByStatus = await query(`
      SELECT 
        CASE
          WHEN time_finish IS NOT NULL THEN 'Completed'
          WHEN time_start IS NOT NULL THEN 'In Progress'
          ELSE 'Open'
        END as name,
        COUNT(id) as value
      FROM issues
      GROUP BY 
        CASE
          WHEN time_finish IS NOT NULL THEN 'Completed'
          WHEN time_start IS NOT NULL THEN 'In Progress'
          ELSE 'Open'
        END
      ORDER BY 
        CASE name
          WHEN 'Open' THEN 1
          WHEN 'In Progress' THEN 2
          WHEN 'Completed' THEN 3
        END
    `)

    // Get issues by month (last 6 months)
    const issuesByMonth = await query(`
      SELECT 
        DATE_FORMAT(time_issued, '%b') as name,
        COUNT(id) as count
      FROM issues
      WHERE time_issued >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(time_issued, '%Y-%m'), DATE_FORMAT(time_issued, '%b')
      ORDER BY MIN(time_issued)
    `)

    return NextResponse.json({
      issuesByType,
      issuesByStatus,
      issuesByMonth,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
