type ErrorWithMessage = {
  message: string
  code?: string
  status?: number
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError))
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message
}

export function getErrorStatus(error: unknown): number {
  if (isErrorWithMessage(error) && error.status) {
    return error.status
  }
  return 500
}

export class AppError extends Error {
  status: number
  code: string

  constructor(message: string, status = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message)
    this.status = status
    this.code = code
    this.name = "AppError"
  }

  static badRequest(message = "Bad Request") {
    return new AppError(message, 400, "BAD_REQUEST")
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, "UNAUTHORIZED")
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, "FORBIDDEN")
  }

  static notFound(message = "Not Found") {
    return new AppError(message, 404, "NOT_FOUND")
  }

  static conflict(message = "Conflict") {
    return new AppError(message, 409, "CONFLICT")
  }

  static tooManyRequests(message = "Too Many Requests") {
    return new AppError(message, 429, "TOO_MANY_REQUESTS")
  }

  static internal(message = "Internal Server Error") {
    return new AppError(message, 500, "INTERNAL_SERVER_ERROR")
  }
}
