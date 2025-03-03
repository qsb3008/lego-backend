import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config()

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1631677352881_6029'

  // add your egg config in here 启用中间件
  // config.middleware = ['customError']

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: ['http://127.0.0.1:5173'],
  }
  config.view = {
    defaultViewEngine: 'nunjucks',
  }
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/lego',
  }

  config.bcrypt = {
    saltRounds: 10,
  }
  config.jwt = {
    secret: process.env.JWT_SECRET || '',
    enable: true,
    match: [
      '/api/users/getUserInfo',
      '/api/works',
      '/api/utils/upload-img',
      '/api/channel',
    ],
  }

  // config.redis = {
  //   client: {
  //     port: 6379,
  //     host: '127.0.0.1',
  //     password: '',
  //     db: 0,
  //   },
  // }

  // config.cors = {
  //   origin: 'http://127.0.0.1:5173',
  //   allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  // }

  config.oss = {
    client: {
      accessKeyId: process.env.ALC_ACCESS_KEY || '',
      accessKeySecret: process.env.ALC_SECRET_KEY || '',
      bucket: 'qsb-lego-backend',
      endpoint: 'oss-cn-heyuan.aliyuncs.com',
    },
  }

  config.multipart = {
    whitelist: ['.jpg', '.jpeg', '.png', '.gif'],
    fileSize: '15kb',
  }

  config.static = {
    dir: [
      // 保留默认的
      {
        prefix: '/public/',
        dir: join(appInfo.baseDir, 'app/public'),
      },
      // 添加自定义的
      {
        prefix: '/uploads/',
        dir: join(appInfo.baseDir, 'uploads'),
      },
    ],
  }

  const aliCloudConfig = {
    accessKeyId: process.env.ALC_ACCESS_KEY,
    accessKeySecret: process.env.ALC_SECRET_KEY,
    endpoint: 'dysmsapi.aliyuncs.com',
  }

  const giteeOauthConfig = {
    cid: process.env.GITEE_CID,
    secret: process.env.GITEE_SECRET,
    redirectURL: 'http://127.0.0.1:7001/api/users/passport/gitee/callback',
    authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
    giteeUserAPI: 'https://gitee.com/api/v5/user',
  }

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowedMethod: ['GET'],
    },
    baseUrl: 'default.url',
    aliCloudConfig,
    giteeOauthConfig,
    H5BaseURL: 'http://127.0.0.1:7001/api/pages',
    jwtExpires: '1h',
  }

  // the return config will combines to EggAppConfig
  return {
    ...(config as {}),
    ...bizConfig,
  }
}
