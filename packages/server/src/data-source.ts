import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

// Environment variables will be loaded by AppModule

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'canvasser_app',
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // Looks for entities in src and its subdirectories
  synchronize: process.env.NODE_ENV === 'development', // Auto-creates schema in dev. Use migrations in prod.
  // migrationsTableName: 'migrations',
  // migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // logging: process.env.NODE_ENV === 'development' ? 'all' : ['error'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
