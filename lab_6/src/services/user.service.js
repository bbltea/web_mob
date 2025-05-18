import { User } from '../models/index.js';

export class UserService {
    static async registation(payload) {
        try {
            const result = await User.create({ email: payload.email, password: payload.password, salt: 'Salt' });

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
            if (user && user.password === payload.password) {

                return { error: null, data: user };
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