import Fastify from 'fastify'
import multipart from '@fastify/multipart';

import { FileController } from './file/file.controller.js';

const fastify = Fastify({
    logger: true
})

fastify.register(multipart)

fastify.get('/health', async function handler(request, reply) {
    return { status: 'ok' }
})

fastify.post('/files', FileController.saveFile)
fastify.get('/files/:fileId', FileController.getFile)


try {
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}