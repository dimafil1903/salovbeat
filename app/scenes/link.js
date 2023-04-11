const {WizardScene, Scene} = require("telegraf/scenes");
const {reviewsHelper} = require("../helpers");
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
const linkScene = new WizardScene(
    'link',
    async (ctx) => {
        await ctx.reply('Enter the link of the review');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate arrangement input
        if (!validateTextInput(ctx)) {
            return;
        }
        ctx.session.link = ctx.message.text;

        // save the arrangement to the session
        const updateTrack = {
            id: ctx.session.trackId,
            link: ctx.session.link,
        };
        const id = await reviewsHelper.updateReviewLink(updateTrack);
        await ctx.reply('я додав лінку, не дякуй');
        reviewsHelper.getReviewById(updateTrack.id, (err, review) => {
            if (err) {
                console.error(err);
                return ctx.reply('An error occurred while retrieving the review');
            }
            const details = reviewsHelper.formatReviewsDetails(review);
            console.log(details);
            return ctx.replyWithHTML(details);
        });

        return ctx.scene.leave();
    },
);
linkScene.hears('/start', async (ctx) => {
    // Stop the scene and return to the main menu
    ctx.scene.leave().then(r => console.log(r));
    ctx.reply('Вперед до головного меню');
    await startCommand(ctx);

});
// Export the helloWizardScene as a single object
module.exports = linkScene;
