import { Service } from 'egg'
import { UserProps } from '../model/user'
import * as $Dysmsapi from '@alicloud/dysmsapi20170525'

interface GiteeUserResp {
  id: number
  login: string
  name: string
  avatar_url: string
  email: string
}

export default class UserService extends Service {
  public async createByEmail(payload: UserProps) {
    const { ctx } = this
    const { username, password } = payload
    const hash = await ctx.genHash(password)
    const userCreatedData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    }
    const doc = await ctx.model.User.create(userCreatedData)
    return doc
  }
  async findById(id: string) {
    return this.ctx.model.User.findById(id)
  }
  async findByUsername(username: string) {
    return this.ctx.model.User.findOne({ username })
  }

  async sendSMS(phoneNumber: string, veriCode: string) {
    const { app } = this
    // 配置参数
    const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: '慕课乐高',
      templateCode: 'SMS_223580190',
      templateParam: `{\"code\":\"${veriCode}\"}`,
    })
    try {
      const ALClient = (app as any).ALClient as any
      const resp = await ALClient.sendSms(sendSMSRequest)
      return resp
    } catch (error) {
      return error
    }
  }

  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this
    const user = await this.findByUsername(cellphone)
    // 检查 user 记录是否存在
    if (user) {
      // generate token
      const token = app.jwt.sign(
        { username: user.username, _id: user._id },
        app.config.jwt.secret,
      )
      return token
    }
    // 新建一个用户
    const userCreatedData: Partial<UserProps> = {
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `乐高${cellphone.slice(-4)}`,
      type: 'cellphone',
    }
    const newUser = await ctx.model.User.create(userCreatedData)
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret,
    )
    return token
  }
  async getAccessToken(code: string) {
    const { app, ctx } = this
    const { cid, secret, redirectURL, authURL } = app.config.giteeOauthConfig
    const { data } = await ctx.curl(authURL, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: cid,
        redirect_uri: redirectURL,
        client_secret: secret,
      },
    })
    app.logger.info('=====getAccessToken====', data)
    return data.access_token
  }
  async getGiteeUserData(access_token: string) {
    const { ctx, app } = this
    const { giteeUserAPI } = app.config.giteeOauthConfig
    const { data } = await ctx.curl<GiteeUserResp>(
      `${giteeUserAPI}?access_token=${access_token}`,
      {
        dataType: 'json',
      },
    )
    return data
  }
  async loginByGitee(code: string) {
    const { ctx, app } = this
    // 获取 access_token
    const access_token = await this.getAccessToken(code)
    // 获取用户信息
    const user = await this.getGiteeUserData(access_token)
    // 检查用户是否存在
    const { id, name, avatar_url, email } = user
    const stringId = id.toString()
    // 平台 + id 作为唯一标识
    const existUser = await this.findByUsername(`Gitee${stringId}`)
    if (existUser) {
      // 生成 token
      const token = app.jwt.sign(
        { username: existUser.username, _id: existUser._id },
        app.config.jwt.secret,
      )
      return token
    }
    // 如果不存在，新建用户
    const userCreatedData: Partial<UserProps> = {
      oauthID: stringId,
      provider: 'gitee',
      username: `Gitee${stringId}`,
      picture: avatar_url,
      nickName: name,
      email,
      type: 'oauth',
    }
    const newUser = await ctx.model.User.create(userCreatedData)
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id },
      app.config.jwt.secret,
      { expiresIn: app.config.jwtExpires },
    )
    return token
  }
}
