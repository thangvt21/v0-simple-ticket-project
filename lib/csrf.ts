import { randomBytes } from "crypto"
import { cookies } from "next/headers"

export function generateCsrfToken() {
  const token = randomBytes(32).toString("hex")
  cookies().set("csrf_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })
  return token
}

export function validateCsrfToken(token: string) {
  const storedToken = cookies().get("csrf_token")?.value
  return storedToken === token
}
