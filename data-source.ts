import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({
  path: `./config/env/${process.env.NODE_ENV}.env`,
});

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  ssl: true,
  extra: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
