import mysql from 'mysql2/promise'
import dotenv from 'dotenv';
dotenv.config(); //loads in env variables from .env file

export const localSqlPool = mysql.createPool({
    host: process.env.LOCAL_HOST,
    user: process.env.LOCAL_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.LOCAL_DB
});

export const awsSqlPool = mysql.createPool({
    host: process.env.RDS_HOST,
    user: process.env.RDS_USER,
    password: process.env.RDS_PW,
    database: process.env.AWS_DB
});
