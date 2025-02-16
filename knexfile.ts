import { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    production: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        },
        migrations: {
            directory: "./migrations",
        },
        seeds: {
            directory: "./seeds",
        },
    },
    development: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
        },
        migrations: {
            directory: "./migrations",
        },
        seeds: {
            directory: "./seeds",
        },
    },
    test: {
        client: "pg",
        connection: {
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.TEST_DATABASE_NAME,
        },
        migrations: {
            directory: "./migrations",
        },
    },
};

export default config;
