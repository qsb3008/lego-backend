import 'egg';
import { Connection, Model } from 'mongoose'
import * as OSS from 'ali-oss'
import { Options } from 'ali-oss'
declare module 'egg' {
  // type MongooseModels = {
  //   [key: string]: Model<any>
  // }
  // interface Application {
  //   mongoose: Connection
  //   model: MongooseModels
  // }
  interface MongooseModels extends IModel {
    [key: string]: Model<any>
  }
  interface Context {
    genHash(plainText: string): Promise<string>
    compare(plainText: string, hash: string): Promise<boolean>
    oss: OSS
  }
  interface EggAppConfig {
    bcrypt: {
      saltRounds: number
    }
    oss: {
      client?: Options
    }
  }

  interface Application {
    sessionMap: {
      [key: string]: any
    }
    sessionStore: any
  }
}
