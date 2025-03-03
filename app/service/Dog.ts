import { Service } from 'egg'

interface DogResp {
  message: string
  status: string
}

/**
 * Test Service
 */
export default class Dog extends Service {
  /**
   * sayHi to you
   */
  public async show() {
    const resp = await this.ctx.curl<DogResp>(
      'https://dog.ceo/api/breeds/image/random',
      {
        dataType: 'json',
      },
    )
    return resp.data
  }
  async showPlayers() {
    const resulet = await this.app.model.User.find({ age: { $gt: 30 } }).exec()
    return resulet
  }
}
