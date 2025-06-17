import 'reflect-metadata';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource, DataSourceOptions } from 'typeorm';

// This is the ESM-compatible way to get the current directory's path.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are loaded by 'dotenv-cli' in the package.json script.

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  username: process.env.DATABASE_USER || 'canvasser_user',
  password: process.env.DATABASE_PASSWORD || 'canvasser_password',
  database: process.env.DATABASE_NAME || 'canvasser',

  // Use the new __dirname to construct absolute paths
  entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],

  synchronize: process.env.NODE_ENV !== 'production',
};

// Default export is what the TypeORM CLI looks for
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
