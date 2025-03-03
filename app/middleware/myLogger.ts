import { Context } from 'egg'
import * as fs from 'fs'
import * as path from 'path'

export default function loggerMiddleware(options: any): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const start = Date.now()
    const requestTime = new Date()
    await next()
    const ms = Date.now() - start
    const log = `${requestTime} -- ${ctx.method} -- ${ctx.url} -- ${ms}ms\n`

    const logDir = path.join(__dirname, '../../logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }
    if (options.allowedMethod.includes(ctx.method)) {
      const logFile = path.join(logDir, 'request.log')
      fs.appendFileSync(logFile, log)
    }
  }
}
