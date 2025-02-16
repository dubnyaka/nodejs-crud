import dotenv from 'dotenv';
dotenv.config();

import { Options } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';

const {
    NODE_ENV = 'development',
    DATABASE_HOST = '127.0.0.1',
    DATABASE_PORT = '5432',
    DATABASE_USER,
    DATABASE_PASSWORD,
    DATABASE_NAME,
    TEST_DATABASE_NAME,
} = process.env;

const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

const config: Options = {
    driver: PostgreSqlDriver,
    dbName: isTest ? TEST_DATABASE_NAME : (DATABASE_NAME || 'nodejs_crud'),
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    metadataProvider: TsMorphMetadataProvider,
    migrations: {
        tableName: 'mikro_orm_migrations',
        path: isProduction ? './dist/src/migrations' : './src/migrations',
        pathTs: './src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: false,
        allOrNothing: true,
        dropTables: false,
        safe: true,
        snapshot: false,
        emit: 'js',
    },
    seeder: {
        path: isProduction ? './dist/src/seeders' : './src/seeders',
        pathTs: './src/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'js',
    },
    extensions: [SeedManager],
};

export default config;
