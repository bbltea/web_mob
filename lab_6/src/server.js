import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyRedis from '@fastify/redis';
import { DateTime } from 'luxon';

import { sequelize } from './config/database.js'
import { Pokemon, User } from './models/index.js';
import { UserService } from './services/user.service.js'

const fastify = Fastify({
    logger: true
})

fastify.register(fastifyJwt, {
    secret: 'supersecret',
    cookie: {
        cookieName: 'access_token',
        signed: false,
        expiresIn: '2d'
    }
})

fastify.register(fastifyRedis, { host: '127.0.0.1', password: 'qazwsxedc' })

fastify.decorate("authenticate", async function (request, reply) {
    try {
        const user = await request.jwtVerify();

        const token = request.cookies.access_token
        const existingToken = await fastify.redis.get(`user:access_token:${user.id}`);

        if (token !== existingToken) {
            throw Error('Invalid token')
        }
    } catch (err) {
        reply.send(err)
    }
})


fastify.register(fastifyCookie, {
    secret: "supersecret",
    hook: 'onRequest',
    parseOptions: {}  // options for parsing cookies
})

fastify.post('/registration', async function handler(request, reply) {
    const { error, data: result } = await UserService.registation(request.body);

    if (error) {
        return { error: 'Internal server error' };
    }

    return result;
})

fastify.post('/login', async function handler(request, reply) {
    const { error, data: user } = await UserService.login(request.body);

    if (error) {
        return {
            error
        };
    }

    const token = fastify.jwt.sign(user.dataValues, { expiresIn: '2d' });

    await fastify.redis.set(`user:access_token:${user.dataValues.id}`, token)

    reply.setCookie('access_token', token, {
        domain: 'localhost',
        path: '/',
        secure: true,
        sameSite: true,
        expires: DateTime.now().plus({ days: 2 }).toJSDate(),
    })
})

fastify.get('/me', {
    onRequest: [fastify.authenticate]
}, async function handler(request, reply) {
    const { error, data: user } = await UserService.get(request.user.id);

    if (error) {
        return { error: 'Internal server error' };
    }

    return user
})

fastify.get('/api', async function handler(request, reply) {
    // Need to implement pagination
    const result = await Pokemon.findAll();

    return result
})

fastify.post('/api', async function handler(request, reply) {
    try {
        const { name, pic } = request.body;

        const newPokemon = await Pokemon.create({ name, pic });

        return newPokemon;
    }
    catch (err) {
        console.error(err);

        return { error: 'Internal server error' };
    }
})

fastify.put('/api/:pokemonId', async function handler(request, reply) {
    // Need to be implemented

    return {};
})

fastify.patch('/api/:pokemonId', async function handler(request, reply) {
    // Need to be implemented

    return {};
})

fastify.delete('/api/:pokemonId', async function handler(request, reply) {
    // Need to be implemented

    return {};
})

try {
    await sequelize.authenticate();
    await sequelize.sync()
    await fastify.listen({ port: 8000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}