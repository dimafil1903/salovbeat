const {registerUser} = require('../helpers/usersHelper');
const {getMainKeyboard} = require("../keyboard/mainKeyboard");

const startCommand = async (ctx) => {
    let admin;
    try {
     //   ctx.session = null;

        const ADMIN_IDS = process.env.ADMIN_IDS.split(',').map((id) => parseInt(id));

        ADMIN_IDS.includes(ctx.message.from.id) ? admin = true : admin = false;
        // Register the user and set the admin role for the first user who starts the bot
        registerUser(ctx.message.from, admin);
        await ctx.reply('Вітання!', getMainKeyboard(admin));
    } catch (error) {
        console.error('Error in /start command:', error);
    }
};

module.exports = {
    startCommand,
};
