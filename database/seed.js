const seedAdminUser = require('./seeders/seed-admin-user');

const seed = async () => {
    await seedAdminUser();
    console.log('seeding completed.');
};

seed().catch((error) => {
    console.error('Error running seeding:', error);
});
