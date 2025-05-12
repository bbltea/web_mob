import Fastify from 'fastify'
import { sequelize } from './config/database.js'
import { Games } from './models/games.model.js';

const fastify = Fastify({
    logger: true
})

fastify.get('/api', async function handler(request, reply) {
    const { page = 1, limit = 10 } = request.query; 

    let whereCondition = {};

    if (is_deleted === 'true') {
    whereCondition.is_deleted = { [Sequelize.Op.not]: null };
    } else if (deleted === 'false') {
    whereCondition.is_deleted = null;
    } 
    const offset = (page - 1) * limit; 
    const result = await Games.findAndCountAll({
        where: whereCondition,
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

fastify.post('/api', async function handler(request, reply) {
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

fastify.put('/api/:gameId', async function handler(request, reply) {
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

fastify.patch('/api/:gameId', async function handler(request, reply) {
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

fastify.delete('/api/:gameId', async function handler(request, reply) {
    try {
        const { gameId } = request.params;

        const game = await Games.findByPk(gameId);

        if (!game) {
            reply.code(404).send({ message: 'Game not found!' });
            return;
        }

        //await game.destroy()
        game.is_deleted = true;
        await game.save();

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
