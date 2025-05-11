import { FileSerive } from './file.service.js'

export class FileController {
    static async saveFile(request, reply) {
        const data = await request.file();

        const { error, data: result } = await FileSerive.saveFile(data.file, data.filename, data.mimetype);

        if (error) {
            return { message: 'Internal server error' }
        }

        // TODO
        // Добавить модель File {id: key | UUID, size, mimetype, bucket, original_name}

        return { data: result }
    }

    static async getFile(request, reply) {
        // TODO
        // Проверить наличие метаинформации о файле в БД и в случае успеха вернуть Stream
        return { message: 'Need to be implemented' }
    }
}