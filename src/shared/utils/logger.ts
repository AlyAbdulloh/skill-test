import 'server-only'
import pino from 'pino'
import path from 'path'
import fs from 'fs'
import { Writable } from 'stream'

const LOG_DIR = process.env.LOG_PATH || path.resolve(process.cwd(), 'storage/logs')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const isDevelopment = process.env.NODE_ENV !== 'production'

class DailyRotateStream extends Writable {
  private currentDate = ''
  private fileStream: fs.WriteStream | null = null

  constructor(private logDir: string) {
    super()
  }

  private getDate(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  }

  private ensureStream(): fs.WriteStream {
    const date = this.getDate()
    if (date !== this.currentDate || !this.fileStream) {
      if (this.fileStream) this.fileStream.end()
      this.currentDate = date
      const filePath = path.join(this.logDir, `${date}.log`)
      this.fileStream = fs.createWriteStream(filePath, { flags: 'a' })
    }
    return this.fileStream
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    try {
      this.ensureStream().write(chunk, encoding, (err) => callback(err))
    } catch (err) {
      callback(err as Error)
    }
  }

  _final(callback: (error?: Error | null) => void) {
    if (this.fileStream) this.fileStream.end()
    callback()
  }
}

const fileStream = new DailyRotateStream(LOG_DIR)

const streams: any[] = [{ stream: fileStream }]

if (isDevelopment) {
  streams.push({ stream: pino.destination(1) })
}

const baseLogger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: () =>
      `,"time":"${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}"`,
  },
  pino.multistream(streams),
)

type LogLevel = 'info' | 'warn' | 'error'

class CustomLogger {
  public log(
    module: string,
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    req?: unknown,
  ) {
    const logData: Record<string, unknown> = {
      msg: message,
      module: module.toUpperCase(),
    }
    if (meta) logData.meta = meta
    if (req) logData.req = req

    baseLogger[level](logData)
  }

  info(message: string, meta?: Record<string, unknown>, req?: unknown, module = 'general') {
    this.log(module, 'info', message, meta, req)
  }

  warn(message: string, meta?: Record<string, unknown>, req?: unknown, module = 'general') {
    this.log(module, 'warn', message, meta, req)
  }

  error(message: unknown, meta?: Record<string, unknown>, req?: unknown, module = 'general') {
    const msg = message instanceof Error ? message.message : String(message)
    const logData: Record<string, unknown> = {
      msg,
      module: module.toUpperCase(),
    }
    if (message instanceof Error && message.stack) {
      logData.stack = message.stack
    }
    if (meta) logData.meta = meta
    if (req) logData.req = req
    baseLogger.error(logData)
  }
}

class ModuleLogger {
  private logger: CustomLogger
  readonly module: string

  constructor(module: string, logger: CustomLogger) {
    this.module = module
    this.logger = logger
  }

  info(message: string, meta?: Record<string, unknown>, req?: unknown) {
    this.logger.log(this.module, 'info', message, meta, req)
  }

  warn(message: string, meta?: Record<string, unknown>, req?: unknown) {
    this.logger.log(this.module, 'warn', message, meta, req)
  }

  error(message: unknown, meta?: Record<string, unknown>, req?: unknown) {
    const msg = message instanceof Error ? message.message : String(message)
    this.logger.log(this.module, 'error', msg, meta, req)
  }
}

const customLogger = new CustomLogger()

export const Loggers = {
  auth: new ModuleLogger('AUTH', customLogger),
  category: new ModuleLogger('CATEGORY', customLogger),
  user: new ModuleLogger('USER', customLogger),
  role: new ModuleLogger('ROLE', customLogger),
  permission: new ModuleLogger('PERMISSION', customLogger),
  approval_line: new ModuleLogger('APPROVAL_LINE', customLogger),
  general: new ModuleLogger('GENERAL', customLogger),
}

export { baseLogger as logger }
