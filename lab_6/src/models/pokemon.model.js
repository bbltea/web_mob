import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

export class Pokemon extends Model { }

Pokemon.init(
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
    },
    {
        sequelize,
        modelName: 'pokemons',
    },
);