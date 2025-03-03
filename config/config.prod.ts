import { EggAppConfig, PowerPartial } from 'egg'

export default () => {
  const config: PowerPartial<EggAppConfig> = {}
  config.baseUrl = 'prod.url'
  // 1、给 mongodb 和 redis 添加密码
  // config.mongoose = {
  //   client: {
  //     url: 'xxx',
  //     options: {
  //       dbName: 'lego',
  //       user: 'qsb',
  //       pass: 'pass',
  //     },
  //   },
  // }

  config.redis = {
    client: {
      port: 6379,
      host: 'lego-redis',
      password: process.env.REDIS_PASSWORD,
      // 这个要配置，不然会报错，0 表示默认数据库
      db: 0,
    },
  }

  config.mongoose = {
    url: 'mongodb://lego-mongo:27017/lego',
    options: {
      user: process.env.MONGO_DB_USERNAME,
      pass: process.env.MONGO_DB_PASSWORD,
    },
  }

  // 2、配置 cors 跨域允许的域名
  // config.security = {
  //   csrf: {
  //     enable: false,
  //   },
  //   domainWhiteList: ['https://imooc-lego.com', 'https//www.imooc-lego.com'],
  // }
  // // 3、配置 jwt 过期时间
  // config.jwtExpires = '2 days'

  // // 4、本地的 URL 替换
  // config.giteeOauthConfig = {
  //   redirectURL: 'https://api.imooc-lego.com/api/users/passport/gitee/callback',
  // }

  // config.H5BaseURL = 'https://h5.imooc-lego.com'

  return config
}
