import mysql from 'mysql2/promise'
import dotenv from 'dotenv';
import { getRDSSecret } from './secretsManager.js';
dotenv.config(); //loads in env variables from .env file

export const getSqlPool = async () => {
    let sqlPool;
    var useAWS = true;

    if(useAWS){
        var poolVars = await getRDSSecret();
        sqlPool = mysql.createPool({
            host: poolVars.host,
            user: poolVars.username,
            password: poolVars.password,
            database: poolVars.dbname,
        });
        
    } else {
        sqlPool = mysql.createPool({
            host: process.env.LOCAL_HOST,
            user: process.env.LOCAL_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.LOCAL_DB
        });
    }
    return sqlPool;
}
