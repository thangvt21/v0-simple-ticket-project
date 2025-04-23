import { type NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  limit: number
  windowMs: number
}

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(req: NextRequest, config: RateLimitConfig = { limit: 5, windowMs: 60 * 1000 }) {
  const ip = req.ip || "unknown"
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean up old entries
  for (const [key, data] of ipRequestCounts.entries()) {
    if (data.resetTime < windowStart) {
      ipRequestCounts.delete(key)
    }
  }

  // Get or create entry for this IP
  const entry = ipRequestCounts.get(ip) || { count: 0, resetTime: now + config.windowMs }

  // Check if over limit
  if (entry.count >= config.limit) {
    return NextResponse.json(
      { error: "Too many requests, please try again later" },
      { status: 429, headers: { "Retry-After": `${Math.ceil((entry.resetTime - now) / 1000)}` } },
    )
  }

  // Increment count
  entry.count++
  ipRequestCounts.set(ip, entry)

  return null
}
