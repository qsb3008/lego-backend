import { Controller } from 'egg'

export default class TestController extends Controller {
  async index() {
    const { ctx } = this
    const { id } = ctx.params

    const { body, query } = ctx.request
    const { baseUrl } = ctx.app.config
    const persons = await ctx.service.dog.showPlayers()

    const resp = {
      id,
      query,
      body,
      baseUrl,
      persons,
    }
    ctx.helper.success({ ctx, res: resp })
  }

  async getDog() {
    const { ctx, service } = this
    const resp = await service.dog.show()
    await ctx.render('test.nj', {
      url: resp.message,
    })
  }
}
