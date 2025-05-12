import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Games extends Model { }

Games.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        pic: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            is_deleted: false,
        }
    },
    {
        sequelize,
        modelName: 'games',
    },
);
