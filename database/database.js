const sqlite3 = require('sqlite3').verbose();

// Use the SQLite3 database file instead of an in-memory database
const db = new sqlite3.Database('./database/my_database.sqlite3', (err) => {
    if (err) {
        console.error('Error initializing SQLite3 database:', err);
    } else {
        console.log('Connected to the SQLite3 database.');
    }
});

module.exports = db;
