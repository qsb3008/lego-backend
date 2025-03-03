import { Controller } from 'egg'
import { omit } from 'lodash'
import validateInput from '../decorator/inputValidate'

const userCraeteRules = {
  username: 'email',
  password: {
    type: 'password',
    min: 8,
  },
}

const sendCodeRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
}

const userPhoneCreateRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
  veriCode: { type: 'string', format: /^\d{4}$/, message: '验证码格式错误' },
}

export default class TestController extends Controller {
  async createByEmail() {
    const { ctx, service } = this
    const error = this.validateUserInput(userCraeteRules)
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error })
    }
    const { username } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (user) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' })
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    const userObj = userData?.toJSON()
    if (userObj) {
      const info = omit(userObj, ['password', '__v'])
      ctx.helper.success({ ctx, res: info })
    }
  }
  async loginByCellphone() {
    const { ctx, app } = this
    const { phoneNumber, veriCode } = ctx.request.body
    // 检查用户的输入
    const error = this.validateUserInput(userPhoneCreateRules)
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error })
    }
    // 验证码是否正确
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    if (veriCode !== preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'loginVeriCodeIncorrectFailInfo' })
    }
    const token = await ctx.service.user.loginByCellphone(phoneNumber)
    ctx.helper.success({ ctx, res: { token } })
  }
  async sendVeriCode() {
    const { ctx, app } = this
    const { phoneNumber } = ctx.request.body
    const error = this.validateUserInput(sendCodeRules)
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error })
    }
    // 获取redis数据
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    // 判断是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo' })
    }
    // 生成验证码
    /**
     * Math.random()
     * [0, 1)
     * [0, 1) * 9000 => [0, 9000)
     * [0, 9000) + 1000 => [1000, 10000)
     */
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString()

    // 发送验证码
    // process.env.NODE_ENV 是node的，app.config.env是egg的
    // 判断是否生产环境
    // if (app.config.env === 'prod') {
    //   const resp = await this.service.user.sendSMS(phoneNumber, veriCode)
    //   console.log('====短信发送====', resp)
    //   if (resp.body?.code !== 'OK') {
    //     return ctx.helper.error({
    //       ctx,
    //       errorType: 'sendVeriCodeError',
    //       error: resp.body?.message || resp.message,
    //     })
    //   }
    // }

    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60)
    ctx.helper.success({
      ctx,
      res: app.config.env === 'local' ? { veriCode } : null,
      msg: '验证码发送成功',
    })
  }
  validateUserInput(rules?: any) {
    const { ctx, app } = this
    // ctx.validate(userCraeteRules)
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }
  @validateInput(userCraeteRules, 'userValidateFail')
  async loginByEmail() {
    const { ctx, service, app } = this
    // 取得用户信息
    const { username, password } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    // 校验密码
    const verifyPwd = await ctx.compare(password, user.password)
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    // 登录成功
    // ctx.cookies.set('username', user.username, { encrypt: true })
    // ctx.session.username = user.username
    const token = app.jwt.sign({ username: user.username, _id: user._id }, app.config.jwt.secret, {
      expiresIn: 60 * 60,
    })
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
  async oauth() {
    const { ctx, app } = this
    const { cid, redirectURL } = app.config.giteeOauthConfig
    ctx.redirect(
      `https://gitee.com/oauth/authorize?client_id=${cid}&redirect_uri=${redirectURL}&response_type=code`,
    )
  }

  async oauthByGitee() {
    const { ctx } = this
    const { code } = ctx.request.query
    try {
      const token = await ctx.service.user.loginByGitee(code)
      await ctx.render('success.nj', { token })
      // ctx.helper.success({ ctx, res: { token } })
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'giteeOauthError' })
    }
  }

  // 根据id查询用户信息userData并返回
  async show() {
    const { service, ctx } = this
    // const { username } = ctx.session
    // const { id } = ctx.params
    // const username = ctx.cookies.get('username', { encrypt: true })
    // /users/:id
    // const userData = await service.user.findById(id)
    // const token = this.getTokenValue()
    // if (!token) {
    //   return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    // }
    // try {
    //   const decoded = verify(token, app.config.secret)
    //   ctx.helper.success({ ctx, res: decoded })
    // } catch (error) {
    //   return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    // }
    // if (!username) {
    //   return ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    // }
    // ctx.helper.success({ ctx, res: username })
    const userData = await service.user.findByUsername(ctx.state.user.username)
    const userObj = userData?.toJSON()
    if (userObj) {
      const info = omit(userObj, ['password', '__v'])
      ctx.helper.success({ ctx, res: info })
    }
  }
}
