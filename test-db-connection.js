require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing connection with DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('FULL ERROR:', err);
    } else {
        console.log('SUCCESS: Connected to database');
        release();
    }
    pool.end();
});
