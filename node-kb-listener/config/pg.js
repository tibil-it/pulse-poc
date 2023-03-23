const dotenv = require('dotenv');
dotenv.config();

const host = (()=>{
    if(process.env.NEED_SOCKET){
        return `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME ? process.env.CLOUD_SQL_CONNECTION_NAME : ''}`
    }else{
        return process.env.PG_HOST || 'localhost';
    }
})()

exports.PG_CONFIG = {
    host : host,
    user : process.env.PG_USER || (()=> {throw "NO_DB_USER_PASSED";})(),
    password : process.env.PG_PASSWORD || (()=> {throw "NO_DB_PWD_PASSED";})(),
    database : process.env.PG_DB || (()=> {throw "NO_DB_PASSED";})(),
    port : (process.env.PG_PORT) ? parseInt(process.env.PG_PORT) : 5432
}

console.log(exports.PG_CONFIG);
