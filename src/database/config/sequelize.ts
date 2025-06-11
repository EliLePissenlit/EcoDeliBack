import { Sequelize } from 'sequelize';
import config from './config';

type Environment = 'development' | 'test' | 'production';
const env = (process.env.NODE_ENV || 'development') as Environment;
const dbConfig = config[env];

export const sequelize = new Sequelize(dbConfig);
