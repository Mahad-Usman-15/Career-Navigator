type LogLevel = 'info' | 'warn' | 'error'

interface LogPayload {
  event: string
  userId?: string
  duration?: number
  error?: unknown
  [key: string]: unknown
}

function log(level: LogLevel, payload: LogPayload): void {
  const { error, ...rest } = payload
  const entry: Record<string, unknown> = {
    level,
    timestamp: new Date().toISOString(),
    ...rest,
  }
  if (error instanceof Error) {
    entry.errorMessage = error.message
    entry.errorStack = error.stack
  } else if (error !== undefined) {
    entry.errorMessage = String(error)
  }
  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (payload: LogPayload) => log('info', payload),
  warn: (payload: LogPayload) => log('warn', payload),
  error: (payload: LogPayload) => log('error', payload),
}
