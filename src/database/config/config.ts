import { config as dotenvConfig } from 'dotenv';
import type { Dialect } from 'sequelize';

dotenvConfig();

interface Config {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging: boolean | ((sql: string, timing?: number) => void);
  define: {
    timestamps: boolean;
    underscored: boolean;
  };
}

interface Configs {
  development: Config;
  test: Config;
  production: Config;
}

const defaultConfig: Config = {
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'ecodeli_db',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  dialect: 'postgres' as Dialect,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
};

const config: Configs = {
  development: {
    ...defaultConfig,
    database: process.env.DB_DATABASE ?? 'ecodeli_db',
  },
  test: {
    ...defaultConfig,
    database: process.env.DB_DATABASE ?? 'ecodeli_db_test',
    logging: false,
  },
  production: {
    ...defaultConfig,
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'ecodeli_db',
    host: process.env.DB_HOST ?? 'postgres',
    port: Number(process.env.DB_PORT ?? '5432'),
    logging: false,
  },
};

export default config;
