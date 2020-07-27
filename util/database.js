const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '54.86.125.185',
    user: 'jrana',
    database: 'group25_assignment6',
    port:'3306',
    password: 'jrana'
});

module.exports = pool.promise();