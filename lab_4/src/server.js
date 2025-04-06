import Fastify from 'fastify'
import { mockedData } from './mocks/data.js';

const fastify = Fastify({
    logger: true
})

const Id_software = mockedData;

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
            Id_softwareId: { type: 'integer', minimum: 1 }
        },
        required: ['Id_softwareId']
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
    const queryObject = request.query;
    const page = parseInt(queryObject.page) || 1;
    const limit = parseInt(queryObject.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = Id_software.slice(startIndex, endIndex);

    return paginatedData;
})

fastify.post('/api', { schema: postSchema }, async function handler(request, reply) {
    const { name, pic } = request.body;

    const ids = Id_software.length ? Id_software.map(Id_software => Id_software.id) : [0];
    const maxId = Math.max(...ids);

    const newId_software = { id: maxId + 1, name, pic };

    Id_software.push(newId_software);

    return Id_software;
})

fastify.put('/api/:Id_softwareId', { schema: { ...paramSchema, body: postSchema.body } }, async function handler(request, reply) {
    const { Id_softwareId } = request.params;
    const index = Id_software.findIndex(Id_software => Id_software.id === parseInt(Id_softwareId));

    const { name, pic } = request.body;

    if (index !== -1) {
        Id_software[index] = { id: Id_software[index].id, name, pic };
    } else {
        reply.code(404).send({ message: 'Not found!' });
        return;
    }

    return Id_software;
})

fastify.patch('/api/:Id_softwareId', { schema: { ...paramSchema, body: patchSchema.body } }, async function handler(request, reply) {
    const { Id_softwareId } = request.params;
    const index = Id_software.findIndex(Id_software => Id_software.id === parseInt(Id_softwareId));

    const { name, pic } = request.body;

    if (index !== -1) {
        if (name) {
            Id_software[index].name = name;
        }
        if (pic) {
            Id_software[index].pic = pic;
        }
    } else {
        reply.code(404).send({ message: 'Not found!' });
        return;
    }

    return Id_software;
})

fastify.delete('/api/:Id_softwareId', { schema: paramSchema }, async function handler(request, reply) {
    const { Id_softwareId } = request.params;
    const index = Id_software.findIndex(Id_software => Id_software.id === parseInt(Id_softwareId));

    if (index !== -1) {
        Id_software.splice(index, 1);
    } else {
        reply.code(404).send({ message: 'Not found!' });
        return;
    }

    return Id_software;
})

try {
    await fastify.listen({ port: 8000 })
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}