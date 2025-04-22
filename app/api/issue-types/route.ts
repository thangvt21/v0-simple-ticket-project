import { NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function GET() {
  try {
    const connection = await createConnection()
    const [rows] = await connection.execute("SELECT * FROM issues_type ORDER BY type_name ASC")
    await connection.end()

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

    const connection = await createConnection()

    // Check if type already exists
    const [existing] = await connection.execute("SELECT * FROM issues_type WHERE type_name = ?", [typeName])

    if (Array.isArray(existing) && existing.length > 0) {
      await connection.end()
      return NextResponse.json({ error: "Type already exists" }, { status: 409 })
    }

    // Insert new type
    const [result] = await connection.execute("INSERT INTO issues_type (type_name) VALUES (?)", [typeName])

    const insertId = (result as any).insertId

    // Get the newly created type
    const [newType] = await connection.execute("SELECT * FROM issues_type WHERE id = ?", [insertId])

    await connection.end()

    return NextResponse.json({
      success: true,
      type: Array.isArray(newType) ? newType[0] : null,
    })
  } catch (error) {
    console.error("Failed to add issue type:", error)
    return NextResponse.json({ error: "Failed to add issue type" }, { status: 500 })
  }
}
