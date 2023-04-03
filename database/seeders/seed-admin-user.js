require('dotenv').config();
const db = require('../database');

const ADMIN_IDS = process.env.ADMIN_IDS.split(',').map((id) => parseInt(id));

const seedAdminUser = async () => {
    try {
        for (const adminId of ADMIN_IDS) {
            const result = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM users WHERE telegram_id = ?', [adminId], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!result) {
                await new Promise((resolve, reject) => {
                    db.run(
                        `
                            INSERT INTO users (telegram_id, is_admin)
                            VALUES (?, ?)
                        `,
                        [adminId, true],
                        (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log('Seeded admin user with Telegram ID:', adminId);
                                resolve();
                            }
                        }
                    );
                });
            }
        }
    } catch (error) {
        console.error('Error seeding admin users:', error);
    }
};

module.exports = seedAdminUser;
