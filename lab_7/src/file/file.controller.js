import { FileSerive } from './file.service.js'

export class FileController {
    static async saveFile(request, reply) {
        const data = await request.file();

        const { error, data: file } = await FileSerive.saveFile(data.file, data.filename, data.mimetype);

        if (error) {
            return { message: 'Internal server error' }
        }
        return {
            id: file.id,
            key: file.key,
            size: file.size,
            mime_type: file.mime_type,
            url: `http://localhost:8000/api/files/${file.id}`
        }
    }

    static async getFile(request, reply) {
        const { fileId } = request.params
        const { error, data } = await FileSerive.getFile(fileId) // <-- Fix here

        if (error) {
            reply.code(404)
            return { message: `File not found` }
        }

        reply.header(`Content-Type`, data.file.mime_type)
        return data.stream
    }
}