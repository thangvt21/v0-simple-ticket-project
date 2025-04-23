type LogLevel = "debug" | "info" | "warn" | "error"

interface LogOptions {
  level?: LogLevel
  context?: string
  data?: Record<string, any>
}

class Logger {
  private static instance: Logger
  private isDevelopment = process.env.NODE_ENV !== "production"

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public debug(message: string, options?: Omit<LogOptions, "level">) {
    this.log(message, { ...options, level: "debug" })
  }

  public info(message: string, options?: Omit<LogOptions, "level">) {
    this.log(message, { ...options, level: "info" })
  }

  public warn(message: string, options?: Omit<LogOptions, "level">) {
    this.log(message, { ...options, level: "warn" })
  }

  public error(message: string | Error, options?: Omit<LogOptions, "level">) {
    const errorMessage = message instanceof Error ? message.message : message
    const errorStack = message instanceof Error ? message.stack : undefined

    this.log(errorMessage, {
      ...options,
      level: "error",
      data: {
        ...(options?.data || {}),
        stack: errorStack,
      },
    })
  }

  private log(message: string, options: LogOptions = {}) {
    const { level = "info", context, data } = options
    const timestamp = new Date().toISOString()

    const logEntry = {
      timestamp,
      level,
      message,
      ...(context ? { context } : {}),
      ...(data ? { data } : {}),
    }

    // In development, pretty print logs
    if (this.isDevelopment) {
      const colors = {
        debug: "\x1b[34m", // blue
        info: "\x1b[32m", // green
        warn: "\x1b[33m", // yellow
        error: "\x1b[31m", // red
        reset: "\x1b[0m", // reset
      }

      const levelColor = colors[level] || colors.reset
      const contextStr = context ? ` [${context}]` : ""

      console[level === "debug" ? "log" : level](
        `${levelColor}${timestamp} ${level.toUpperCase()}${colors.reset}${contextStr}: ${message}`,
        data ? data : "",
      )
    } else {
      // In production, output structured logs for log aggregation
      console[level === "debug" ? "log" : level](JSON.stringify(logEntry))
    }
  }
}

export const logger = Logger.getInstance()
