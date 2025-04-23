import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/logger"

export function middleware(request: NextRequest) {
  const start = Date.now()
  const requestId = crypto.randomUUID()

  // Add request ID to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  // Log request
  logger.info(`${request.method} ${request.nextUrl.pathname}`, {
    context: "http",
    data: {
      requestId,
      method: request.method,
      url: request.nextUrl.toString(),
      userAgent: request.headers.get("user-agent") || "unknown",
    },
  })

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add response headers
  response.headers.set("x-request-id", requestId)

  // Log response timing on finish
  response.headers.set("Server-Timing", `total;dur=${Date.now() - start}`)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
