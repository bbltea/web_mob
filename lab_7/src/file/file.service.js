import path from 'node:path';
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export class FileSerive {
    static client = new S3Client({
        region: "ru-rnd-1",
        endpoint: "http://localhost:9000",
        forcePathStyle: true,
        credentials: {
            accessKeyId: 'ribisGsNz4aFJaiuazBt',
            secretAccessKey: 'alEwaVJj9RibfN6uYe6SQPEPQnDRY2jWLStMHVN0'
        },
    });

    static async saveFile(fileStream, fileName, mimetype) {
        try {
            const params = {
                Body: fileStream,
                Bucket: "storage",
                Key: `${Math.random().toString(36).slice(2)}${path.extname(fileName)}`,
                ContentType: mimetype,
            };

            const parallelUploads3 = new Upload({
                client: this.client,
                params,
                queueSize: 4,
                partSize: 1024 * 1024 * 5,
                leavePartsOnError: false,
            })

            const result = await parallelUploads3.done();

            return { error: null, data: result };
        }
        catch (error) {
            console.error(error);

            return { error, data: null };
        }
    }
}