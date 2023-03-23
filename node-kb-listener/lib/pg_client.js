const {Pool} = require('pg');
const {PG_CONFIG} = require('../config/pg');

const pool = new Pool(PG_CONFIG);

exports.getPoolClient = async()=>{
    return await pool.connect();
}

exports.query = async (text,value)=>{
    return await pool.query(text,value);
}
