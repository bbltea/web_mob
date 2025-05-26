import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import path from 'path';
import { PassThrough } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { File } from './models/file.model.js'

import { sequelize } from './config/database.js';
import { FileController } from './file/file.controller.js';

const fastify = Fastify({
    logger: true
})

fastify.register(multipart)

const querySchema = {
    type: 'object',
    properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1 }
    },
    required: [],
    additionalProperties: false
};

const postSchema = {
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1 },
            pic: { type: 'string', format: 'uri' }
        },
        required: ['name', 'pic'],
        additionalProperties: false
    }
};

const userSchema = {
    body: {
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
        },
        required: ['email', 'password'],
        additionalProperties: false
    }
};

fastify.register(fastifyJwt, {
    secret: '733e2f0a96964c7c6117daa6a7f5ff35dec4f182', 
});

fastify.decorate('authenticate', async function (request, reply) {
    try {
        let token;
        if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
            token = request.headers.authorization.split(' ')[1];
        } else if (request.cookies && request.cookies.token) {
            token = request.cookies.token;
        }
        if (!token) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        request.user = fastify.jwt.verify(token);
    } catch (err) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
});

fastify.get('/api/games', {
    schema: { querystring: querySchema },
    preHandler: [fastify.authenticate] }, async function handler(request, reply) {
    const { page = 1, limit = 10 } = request.query;
    const offset = (page - 1) * limit;
    const result = await Games.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
    });

    return {
        data: result.rows,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.count,
    };
});

fastify.post('/api/games', {
    schema: postSchema,
    preHandler: [fastify.authenticate] }, async function handler(request, reply) {
    try {
        const { name, pic } = request.body;
        const newGame = await Games.create({ name, pic });
        return newGame;
    } catch (err) {
        console.error(err);
        return { error: 'Internal server error' };
    }
});

fastify.post('/api/users/register', {
    schema: userSchema }, async function handler(request, reply) {
    const { email, password } = request.body;
    const result = await UserService.registation({ email, password });
    if (result.error) {
        reply.code(500).send({ error: result.error });
    } else {
        reply.code(201).send(result.data);
    }
});

fastify.post('/api/users/login', {
    schema: userSchema }, async function handler(request, reply) {
    const { email, password } = request.body;
    const result = await UserService.login({ email, password });
    if (result.error) {
        reply.code(401).send({ error: result.error });
    } else {
        const token = fastify.jwt.sign({ id: result.data.id, email: result.data.email });
        reply.setCookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24
        });
        await redis.set(`auth:${result.data.id}`, token, 'EX', 60 * 60 * 24);
        reply.code(200).send({ token });
    }
});

fastify.get('/api/users/:userId', {
    schema: { querystring: querySchema },
    preHandler: [fastify.authenticate]
}, async function handler(request, reply) {
    let { userId } = request.params;
    userId = parseInt(userId, 10);
    if (isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid userId' });
    }
    const result = await UserService.get(userId);
    if (result.error) {
        reply.code(500).send({ error: result.error });
    } else if (!result.data) {
        reply.code(404).send({ message: 'User not found!' });
    } else {
        reply.code(200).send(result.data);
    }
});


fastify.get('/health', async function handler(request, reply) {
    return { status: 'ok' }
});

fastify.post('/files', FileController.saveFile)

fastify.get('/files/:fileId', FileController.getFile)

fastify.get(`/api/files/:fileId/download`, FileController.downloadFile)

try {
    await sequelize.authenticate();
    await sequelize.sync();
    await fastify.listen({ port: 3000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}