import { User } from '../models/index.js';

export class UserService {
    static async registation(payload) {
        try {
            const salt = Math.random().toString(36).substring(2, 10);
            const crypto = await import('crypto');
            const hashedPassword = crypto.createHash('sha256').update(payload.password + salt).digest('hex');
            const result = await User.create({ email: payload.email, password: hashedPassword, salt: salt });

            return { error: null, data: result }
        }
        catch (err) {
            console.error(err);

            return {
                error: err, data: null
            }
        }
    }

    static async login(payload) {
        try {
            const user = await User.findOne({ where: { email: payload.email } });
            if (user) {
                const crypto = await import('crypto');
                const hashedPassword = crypto.createHash('sha256').update(payload.password + user.salt).digest('hex');
                if (user.password === hashedPassword) {
                    return { error: null, data: user };
                }
            }

            return { error: 'User not found', data: null }
        }
        catch (err) {
            console.error(err);

            return { error: err, data: null }
        }
    }

    static async logout() {

    }

    static async get(userId) {
        try {
            const user = await User.findByPk(userId);

            return { error: null, data: user }
        }
        catch (err) {
            console.error(err);

            return { error: err, data: null }
        }
    }
}