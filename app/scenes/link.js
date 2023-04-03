const {WizardScene, Scene} = require("telegraf/scenes");
const {reviewsHelper} = require("../helpers");


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
        ctx.session.link = parseFloat(ctx.message.text);

        // save the arrangement to the session
        const updateTrack = {
            id: ctx.session.trackId,
            link: ctx.session.link,
        };
        const id = await reviewsHelper.updateReview(updateTrack);
        await ctx.reply('Track updated successfully');
        reviewsHelper.getReviewById(updateTrack.id, (err, review) => {
            if (err) {
                console.error(err);
                return ctx.reply('An error occurred while retrieving the review');
            }
            const details = reviewsHelper.formatReviewsDetails(review);
            return ctx.replyWithHTML(details);
        });

        return ctx.scene.leave();
    },
);

// Export the helloWizardScene as a single object
module.exports = linkScene;
