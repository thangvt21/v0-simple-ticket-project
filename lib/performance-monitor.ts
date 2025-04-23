import { type NextRequest, NextResponse } from "next/server"

export function performanceMiddleware(request: NextRequest) {
  const start = performance.now()
  const requestId = crypto.randomUUID()

  // Add request ID to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Add timing headers
  response.headers.set("Server-Timing", `request;dur=${performance.now() - start}`)
  response.headers.set("X-Request-ID", requestId)

  return response
}
