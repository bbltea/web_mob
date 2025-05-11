import { AuthService } from "./auth.service.js";

export class AuthController {
    static async login(request, reply) {

    }

    static async register(request, reply) {
        const { username, password } = request.body;

        await AuthService.register(username, password);

        return { data: 'ok' };
    }
}