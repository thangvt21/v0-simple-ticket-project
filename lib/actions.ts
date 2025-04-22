"use server"

import { createConnection } from "@/lib/db"

export async function submitIssue(formData: FormData) {
  const issueTitle = formData.get("issueTitle") as string
  const issueTypeId = formData.get("issueTypeId") as string
  const timeIssued = formData.get("timeIssued") as string
  const description = formData.get("description") as string
  const solution = formData.get("solution") as string
  const timeStart = formData.get("timeStart") as string
  const timeFinish = formData.get("timeFinish") as string

  // Validate required fields
  if (!issueTitle || !timeIssued || !description) {
    throw new Error("Missing required fields")
  }

  try {
    const connection = await createConnection()

    // Insert the issue into the database
    const [result] = await connection.execute(
      `INSERT INTO issues (
        issue_title,
        issue_type_id, 
        time_issued, 
        description, 
        solution, 
        time_start, 
        time_finish
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [issueTitle, issueTypeId || null, timeIssued, description, solution, timeStart, timeFinish],
    )

    await connection.end()
    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    throw new Error("Failed to save issue to database")
  }
}
