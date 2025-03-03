import { Controller } from 'egg'
// import * as sharp from 'sharp'
// import { parse } from 'path'
import * as Busboy from 'busboy'
import { join, extname } from 'path'
import * as sendToWormhole from 'stream-wormhole'
import { nanoid } from 'nanoid'
import { createWriteStream } from 'fs'
import { createSSRApp } from 'vue'
import { renderToString, renderToNodeStream } from '@vue/server-renderer'
import { FileStream } from '../../typings/app'
import { pipeline } from 'stream/promises'

export default class UtilsController extends Controller {
  splitIdAndUuid(str = '') {
    const result = { id: '', uuid: '' }
    if (!str) return result
    const firstDashIndex = str.indexOf('-')
    if (firstDashIndex < 0) return result
    result.id = str.slice(0, firstDashIndex)
    result.uuid = str.slice(firstDashIndex + 1)
    return result
  }
  async renderH5Page() {
    // id-uuid split('-')
    // uuid = aa-bb-cc
    const { ctx } = this
    const { idAndUuid } = ctx.params
    const query = this.splitIdAndUuid(idAndUuid)
    try {
      const pageData = await this.service.utils.renderToPageData(query)
      await ctx.render('page.nj', pageData)
    } catch (e) {
      ctx.helper.error({ ctx, errorType: 'h5WorkNotExistError' })
    }
  }
  async renderH5PageByString() {
    const { ctx } = this
    const vueApp = createSSRApp({
      data: () => ({ msg: 'Hello World' }),
      template: '<h1>{{ msg }}</h1>',
    })
    const appContent = await renderToString(vueApp)
    ctx.response.type = 'text/html'
    ctx.response.body = appContent
  }
  async renderH5PageByStream() {
    const { ctx } = this
    const vueApp = createSSRApp({
      data: () => ({ msg: 'Hello World !!!' }),
      template: '<h1>{{ msg }}</h1>',
    })
    const stream = await renderToNodeStream(vueApp)
    ctx.status = 200
    await pipeline(stream, ctx.res)
  }
  async uploadToOSS() {
    const { ctx } = this
    const stream = await ctx.getFileStream()
    //  qsb-lego-backend
    const savedOSSPath = join(
      'imooc-test',
      nanoid(6) + extname(stream.filename),
    )
    try {
      const result = await ctx.oss.put(savedOSSPath, stream)
      const { name, url } = result
      ctx.helper.success({
        ctx,
        res: {
          name,
          url,
        },
      })
    } catch (error) {
      await sendToWormhole(stream)
      ctx.helper.error({
        ctx,
        errorType: 'imageUploadFail',
      })
    }
  }
  async uploadMutipleFiles() {
    const { ctx, app } = this
    const { fileSize } = app.config.multipart
    const parts = ctx.multipart({
      limits: { fileSize: fileSize as number },
    })
    const urls: string[] = []
    let part: FileStream | string[]
    while ((part = await parts())) {
      if (Array.isArray(part)) {
        app.logger.info(part)
      } else {
        try {
          const savedOSSPath = join(
            'imooc-test',
            nanoid(6) + extname(part.filename),
          )
          const result = await ctx.oss.put(savedOSSPath, part)
          const { url } = result
          urls.push(url)
          if (part.truncated) {
            await ctx.oss.delete(savedOSSPath)
            ctx.helper.error({
              ctx,
              errorType: 'imageUploadFileSizeError',
              error: `文件超过最大限制: ${fileSize} bytes`,
            })
            return
          }
        } catch (error) {
          await sendToWormhole(part)
          ctx.helper.error({
            ctx,
            errorType: 'imageUploadFail',
          })
        }
      }
    }
    ctx.helper.success({
      ctx,
      res: urls,
    })
  }
  uploadFileUseBusboy() {
    const { ctx, app } = this
    return new Promise<string[]>((resolve, reject) => {
      try {
        const busboy = new Busboy({ headers: ctx.req.headers as any })
        const results: string[] = []
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          console.log('file', fieldname, file, filename, encoding, mimetype)
          const uid = nanoid(6)
          const savedPath = join(
            app.config.baseDir,
            'uploads',
            `${uid}${extname(filename)}`,
          )
          file.pipe(createWriteStream(savedPath))
          file.on('end', () => {
            results.push(savedPath)
          })
        })
        busboy.on(
          'field',
          (fieldname, val, fieldnameTruncated, valTruncated) => {
            console.log(
              'field',
              fieldname,
              val,
              fieldnameTruncated,
              valTruncated,
            )
          },
        )
        busboy.on('finish', () => {
          app.logger.info('finish')
          resolve(results)
        })
        ctx.req.pipe(busboy)
      } catch (error) {
        reject(error)
      }
    })
  }
  async testBusboy() {
    const { ctx } = this
    const results = await this.uploadFileUseBusboy()
    ctx.helper.success({
      ctx,
      res: results,
    })
  }
  // async fileLocalUpload() {
  //   const { ctx, app } = this
  //   const file = ctx.request.files[0]
  //   const filepath = file.filepath
  //   // 生成sharp实例
  //   const imageSource = sharp(filepath)
  //   const meataData = await imageSource.metadata()

  //   let thumbnailUrl = ''

  //   const { width } = meataData || {}
  //   // 判断图片宽度是否大于300
  //   if (width && width > 300) {
  //     // 重置图片大小
  //     const { name, ext, dir } = parse(filepath)
  //     const newFilePath = join(dir, `${name}-thumbnail${ext}`)
  //     await imageSource.resize({ width: 300 }).toFile(newFilePath)
  //     thumbnailUrl = newFilePath.replace(app.config.baseDir, app.config.baseUrl)
  //   }

  //   const url = filepath.replace(app.config.baseDir, app.config.baseUrl)
  //   ctx.helper.success({
  //     ctx,
  //     res: { ...file, url, thumbnailUrl: thumbnailUrl || url },
  //   })
  // }
  pathToUrl(path: string) {
    const { app } = this
    return path.replace(app.config.baseDir, app.config.baseUrl)
  }
  // async fileUploadByStream() {
  //   // 通过流的方式上传文件
  //   const { ctx, app } = this

  //   const stream = await ctx.getFileStream()

  //   const uid = nanoid(6)

  //   const filename = stream.filename
  //   const filepath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     `${uid}${extname(filename)}`,
  //   )
  //   const thumbnailFilepath = join(
  //     app.config.baseDir,
  //     'uploads',
  //     `${uid}_thumbnail${extname(filename)}`,
  //   )
  //   // 创建写入流
  //   const target = createWriteStream(filepath)
  //   const target2 = createWriteStream(thumbnailFilepath)

  //   // 图片处理
  //   const p1 = new Promise((resolve, reject) => {
  //     stream.pipe(target).on('error', reject).on('finish', resolve)
  //   })
  //   // 生成缩略图异步处理
  //   const transformer = sharp().resize({ width: 300 })

  //   const p2 = new Promise((resolve, reject) => {
  //     stream
  //       .pipe(transformer)
  //       .on('error', reject)
  //       .pipe(target2)
  //       .on('error', reject)
  //       .on('finish', resolve)
  //   })
  //   try {
  //     await Promise.all([p1, p2])
  //   } catch (error) {
  //     ctx.helper.error({
  //       ctx,
  //       errorType: 'imageUploadFail',
  //     })
  //     return
  //   }
  //   ctx.helper.success({
  //     ctx,
  //     res: {
  //       url: this.pathToUrl(filepath),
  //       thumbnailUrl: this.pathToUrl(thumbnailFilepath),
  //     },
  //   })
  // }
}
