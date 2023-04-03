const db = require('../../database/database');

const registerUser = (user, isAdmin = false) => {
    const {id: telegram_id, username, first_name, last_name} = user;

    db.run(
        `
            INSERT
            OR IGNORE INTO users (telegram_id, username, first_name, last_name, is_admin)
    VALUES (?, ?, ?, ?, ?)
        `,
        [telegram_id, username, first_name, last_name, isAdmin],
        (err) => {
            if (err) {
                console.error('Error inserting user into database:', err);
            } else {
                db.run(
                    `
                        UPDATE users
                        SET username = ?,
                            first_name = ?,
                            last_name = ?
                        WHERE telegram_id = ?
                    `,
                    [username, first_name, last_name, telegram_id],
                    (err) => {
                        if (err) {
                            console.error('Error updating user in database:', err);
                        }
                    }
                );
            }
        }
    );
};

module.exports = {
    registerUser,
};
