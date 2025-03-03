import { Application } from 'egg'

export default (app: Application) => {
  const { controller, router } = app

  const prefix = '/api'

  router.get('/', controller.home.index)
  router.get(`${prefix}/ping`, controller.home.info)
  // router.get('/test/:id', controller.test.index)
  // router.get('/dog', controller.test.getDog)
  router.post(`${prefix}/users/create`, controller.user.createByEmail)
  router.post(`${prefix}/users/loginByEmail`, controller.user.loginByEmail)
  router.get(`${prefix}/users/getUserInfo`, controller.user.show)
  router.post(`${prefix}/users/genVeriCode`, controller.user.sendVeriCode)
  router.post(
    `${prefix}/users/loginByPhoneNumber`,
    controller.user.loginByCellphone,
  )
  router.get(`${prefix}/users/passport/gitee`, controller.user.oauth)
  router.get(
    `${prefix}/users/passport/gitee/callback`,
    controller.user.oauthByGitee,
  )

  // works
  router.post(`${prefix}/works`, controller.work.createWork)
  router.get(`${prefix}/works`, controller.work.myList)
  router.get(`${prefix}/templates`, controller.work.templateList)
  router.get(`${prefix}/works/:id`, controller.work.myWork)
  router.patch(`${prefix}/works/:id`, controller.work.update)
  router.delete(`${prefix}/works/:id`, controller.work.delete)
  router.post(`${prefix}/works/publish/:id`, controller.work.publishWork)
  router.post(
    `${prefix}/works/publish-template/:id`,
    controller.work.publishTemplate,
  )

  // 上传
  // router.post(`${prefix}/utils/upload`, controller.utils.fileLocalUpload)
  // router.post(`${prefix}/utils/upload`, controller.utils.fileUploadByStream)
  // router.post(`${prefix}/utils/upload`, controller.utils.uploadToOSS)
  // router.post(`${prefix}/utils/upload`, controller.utils.uploadMutipleFiles)
  router.post(`${prefix}/utils/upload-img`, controller.utils.testBusboy)
  router.get(`${prefix}/pages/:idAndUuid`, controller.utils.renderH5Page)

  // channel
  router.post(`${prefix}/channel`, controller.work.createChannel)
  router.get(
    `${prefix}/channel/getWorkChannels/:id`,
    controller.work.getWorkChannel,
  )
  router.patch(
    `${prefix}/channel/updateName/:id`,
    controller.work.updateChannelName,
  )
  router.delete(`${prefix}/channel/:id`, controller.work.deleteChannel)
}
