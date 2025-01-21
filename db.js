import mysql from 'mysql2/promise'
import dotenv from 'dotenv';
dotenv.config(); //loads in env variables from .env file

export const mySqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DATABASE_PASSWORD,
    database: "expense_db"
});

