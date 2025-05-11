import Fastify from 'fastify'
import multipart from '@fastify/multipart';

import { FileController } from './file/file.controller.js';
import { AuthController } from './auth/auth.contoller.js';
import { AmpqProvider } from './ampq/ampq.service.js';
import queueConfig from './config/queue.js';


const fastify = Fastify({
    logger: true
})

fastify.register(multipart)

fastify.get('/health', async function handler(request, reply) {
    return { status: 'ok' }
})

fastify.post('/register', AuthController.register)

fastify.post('/files', FileController.saveFile)
fastify.get('/files/:fileId', FileController.getFile)


try {
    await AmpqProvider.connect(queueConfig)
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}