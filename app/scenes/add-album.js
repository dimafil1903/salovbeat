const {WizardScene, Scene} = require("telegraf/scenes");
const {reviewsHelper} = require("../helpers");
const {getAlbumKeyboard} = require("../keyboard/albumKeyboard");
const {startCommand} = require("../handlers/start");


function validateTextInput(ctx) {
    let msg = "Please enter a valid Text";
    if (!ctx.message || !ctx.message.text) {
        ctx.reply(msg);
        return false;
    }
    return true;
}

// Create a new WizardScene
const albumScene = new WizardScene(
    'add-album-wizard',
    async (ctx) => {
        await ctx.reply('Назва альбому');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate arrangement input
        if (!validateTextInput(ctx)) {
            return;
        }
        ctx.session.album_title = ctx.message.text;

        // save the arrangement to the session
        const newAlbum = {
            title: ctx.session.album_title,
        };
        const id = await reviewsHelper.saveAlbum(newAlbum);
        await ctx.reply('Альбом успішно додано');
        reviewsHelper.getReviewById(id, (err, album) => {
            if (err) {
                console.error(err);
                return ctx.reply('An error occurred while retrieving the review');
            }
            const details = reviewsHelper.formatAlbum(album);
            return ctx.replyWithHTML(details, getAlbumKeyboard(id));
        });

        return ctx.scene.leave();
    },
);
albumScene.hears('/start', async (ctx) => {
    // Stop the scene and return to the main menu
    ctx.scene.leave().then(r => console.log(r));
    ctx.reply('Вперед до головного меню');
    await startCommand(ctx);

});

// Export the helloWizardScene as a single object
module.exports = albumScene;
