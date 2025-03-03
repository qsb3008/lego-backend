import { IBoot, Application } from 'egg'

export default class AppBoot implements IBoot {
  private readonly app: Application
  constructor(app: Application) {
    this.app = app
    app.sessionMap = {}
    app.sessionStore = {
      get: (key: string) => {
        app.logger.info(`[egg-session] get session ${key}`)
        return app.sessionMap[key]
      },
      set: (key: string, value: any) => {
        app.logger.info(`[egg-session] set session ${key} ${JSON.stringify(value)}`)
        app.sessionMap[key] = value
      },
      destroy: (key: string) => {
        app.logger.info(`[egg-session] destroy session ${key}`)
        delete app.sessionMap[key]
      },
    }
    // const { url } = this.app.config.mongoose
    // assert(url, '[egg-mongoose] url is required on config')
    // const db = createConnection(url)
    // db.on('connected', () => {
    //   console.log('=== connected')
    //   app.logger.info(`[egg-mongoose] ${url} connected successfully`)
    // })
    // app.mongoose = db
  }
  configWillLoad(): void {
    // console.log('config ', this.app.config.baseUrl)
    // console.log('enable middleware ', this.app.config.coreMiddleware)
    // this.app.config.coreMiddleware.unshift('myLogger')
    // 添加 customError 中间件
    this.app.config.coreMiddleware.push('customError')
  }
  async willReady(): Promise<void> {
    // const dir = join(this.app.config.baseDir, 'app/model')
    // this.app.loader.loadToApp(dir, 'model', {
    //   caseStyle: 'upper',
    // })
    // app/model/user.ts => this.app.model.User
  }
  async didReady(): Promise<void> {
    // console.log('=== all middleware ===:', this.app.middleware)
  }
}
