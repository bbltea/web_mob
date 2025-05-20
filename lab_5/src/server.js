import Fastify from 'fastify'
import { sequelize } from './config/database.js'
import { Games } from './models/games.model.js';

const fastify = Fastify({
    logger: true
})

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

const paramSchema = {
    params: {
        type: 'object',
        properties: {
            gameId: { type: 'integer', minimum: 1 }
        },
        required: ['gameId']
    }
};

const patchSchema = {
    body: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 1 },
            pic: { type: 'string', format: 'uri' }
        },
        required: [],
        additionalProperties: false
    }
};

fastify.get('/api', { schema: { querystring: querySchema } }, async function handler(request, reply) {
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
})

fastify.post('/api',  { schema: postSchema },  async function handler(request, reply) {
    try {
        const { name, pic } = request.body;

        const newGame = await Games.create({ name, pic });

        return newGame;
    }
    catch (err) {
        console.error(err);

        return { error: 'Internal server error' };
    }
})

fastify.put('/api/:gameId', { schema: { ...paramSchema, body: postSchema.body } }, async function handler(request, reply) {
    try {
        const { gameId } = request.params; 
        const { name, pic } = request.body; 

        const game = await Games.findByPk(gameId); 

        if (!game) {
            reply.code(404).send({ message: 'Game not found!' });
            return;
        }

        game.name = name;
        game.pic = pic;
        await game.save();

        return game; 
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
})

fastify.patch('/api/:gameId', { schema: { ...paramSchema, body: patchSchema.body } },  async function handler(request, reply) {
    try {
        const { gameId } = request.params; 
        const { name, pic } = request.body; 

        const game = await Games.findByPk(gameId); 

        if (!game) {
            reply.code(404).send({ message: 'Game not found!' });
            return;
        }

        if (name) game.name = name;
        if (pic) game.pic = pic;
        await game.save();

        return game; 
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
})

fastify.delete('/api/:gameId', { schema: paramSchema }, async function handler(request, reply) {
    try {
        const { gameId } = request.params;

        const game = await Games.findByPk(gameId);

        if (!game) {
            reply.code(404).send({ message: 'Game not found!' });
            return;
        }

        await game.destroy();

        reply.code(204).send();
    } catch (err) {
        console.error(err);
        reply.code(500).send({ error: 'Internal server error' });
    }
})

try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true })
    await fastify.listen({ port: 8000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}
