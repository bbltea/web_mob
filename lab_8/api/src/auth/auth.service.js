import { AmpqProvider } from '../ampq/ampq.service.js';

export class AuthService {
    static async register(username, password) {
        const { error, data: result } = await AmpqProvider.sendEventToTheQueue('greetings', { username, password });

        // Type your old code
    }
}