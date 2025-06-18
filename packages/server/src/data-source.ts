import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'canvasser_user',
  password: process.env.DB_PASSWORD || 'canvasser_password',
  database: process.env.DB_DATABASE || 'canvasser',
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Looks for entities in src and its subdirectories
  migrationsTableName: 'migrations',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
