import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  // Clear the auth cookie
  cookies().set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // Expire immediately
  })

  return NextResponse.json({ success: true })
}
