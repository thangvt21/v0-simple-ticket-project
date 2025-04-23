import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Cache issue types for 5 minutes
let issueTypesCache: any[] | null = null
let lastCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function GET() {
  try {
    const now = Date.now()

    // Return cached data if available and not expired
    if (issueTypesCache && now - lastCacheTime < CACHE_TTL) {
      return NextResponse.json({ types: issueTypesCache })
    }

    // Fetch fresh data
    const rows = await query("SELECT * FROM issues_type ORDER BY type_name ASC")

    // Update cache
    issueTypesCache = rows as any[]
    lastCacheTime = now

    return NextResponse.json({ types: rows })
  } catch (error) {
    console.error("Failed to fetch issue types:", error)
    return NextResponse.json({ error: "Failed to fetch issue types" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { typeName } = await request.json()

    if (!typeName || typeName.trim() === "") {
      return NextResponse.json({ error: "Type name is required" }, { status: 400 })
    }

    // Check if type already exists
    const existing = await query("SELECT * FROM issues_type WHERE type_name = ?", [typeName])

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: "Type already exists" }, { status: 409 })
    }

    // Insert new type
    const result = (await query("INSERT INTO issues_type (type_name) VALUES (?)", [typeName])) as any

    // Get the newly created type
    const newType = await query("SELECT * FROM issues_type WHERE id = ?", [result.insertId])

    // Invalidate cache
    issueTypesCache = null

    return NextResponse.json({
      success: true,
      type: Array.isArray(newType) ? newType[0] : null,
    })
  } catch (error) {
    console.error("Failed to add issue type:", error)
    return NextResponse.json({ error: "Failed to add issue type" }, { status: 500 })
  }
}
