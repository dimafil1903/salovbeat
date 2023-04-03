const {WizardScene, Scene} = require("telegraf/scenes");
const {reviewsHelper} = require("../helpers");
const {getAlbumKeyboard} = require("../keyboard/albumKeyboard");
const {startCommand} = require("../handlers/start");

function validateFloatInput(ctx) {
    let msg = "Я приймаю дробові значення між 0 та 1";
    if (!ctx.message || !ctx.message.text) {
        ctx.reply(msg);
        console.log('no message');
        return false;
    }
    const floatValue = parseFloat(ctx.message.text);
    if (isNaN(floatValue) || floatValue < 0 || floatValue > 1) {
        ctx.reply(msg);
        console.log('not a number', floatValue);
        return false;
    }
    return true;
}

function validateTextInput(ctx) {
    let msg = "Введи нормальний текст, будь людиною";
    if (!ctx.message || !ctx.message.text) {
        ctx.reply(msg);
        return false;
    }
    return true;
}

// Create a new WizardScene
const addTrackWizard = new WizardScene(
    'add-track-wizard',
    async (ctx) => {
        if (ctx.session.albumID) {
            await ctx.reply('Назва треку з альбому:');
        } else {
            await ctx.reply('Назва синглу:');
        }
        return ctx.wizard.next();
    },
    async (ctx) => {
        // save the title to the session
        if (!validateTextInput(ctx)) {
            return;
        }
        ctx.session.trackTitle = ctx.message.text;
        await ctx.reply('Оцінка особистих вражень (0-1)');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate personal impressions input
        if (!validateFloatInput(ctx)) {
            ctx.wizard.selectStep(1);
        }
        // save the personal impressions to the session
        ctx.session.personalImpressions = parseFloat(ctx.message.text);
        await ctx.reply('Оцінка трендовості (0-1)');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate trendiness input
        if (!validateFloatInput(ctx, ctx.message.text)) {
            ctx.wizard.selectStep(2);
        }
        // save the trendiness to the session
        ctx.session.trendiness = parseFloat(ctx.message.text);
        await ctx.reply('Оцінка структури тексту та пісні (0-1)');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate structure input
        if (!validateFloatInput(ctx)) {
            ctx.wizard.selectStep(3);
        }
        // save the structure to the session
        ctx.session.structure = parseFloat(ctx.message.text);
        await ctx.reply('Оцінка мелодійністі та виконання (0-1)');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate melodic performance input
        if (!validateFloatInput(ctx)) {
            ctx.wizard.selectStep(4);
        }
        // save the melodic performance to the session
        ctx.session.melodicPerformance = parseFloat(ctx.message.text);
        await ctx.reply('Оцінка аранжування (0-1)');
        return ctx.wizard.next();
    },
    async (ctx) => {
        // validate arrangement input
        if (!validateFloatInput(ctx)) {
            ctx.wizard.selectStep(5);
        }
        ctx.session.arrangement = parseFloat(ctx.message.text);

        // save the arrangement to the session
        const newTrack = {
            title: ctx.session.trackTitle,
            personalImpressions: ctx.session.personalImpressions,
            trendiness: ctx.session.trendiness,
            structure: ctx.session.structure,
            melodicPerformance: ctx.session.melodicPerformance,
            arrangement: ctx.session.arrangement,
            type: 'single'

        };
        if (ctx.session.albumID) {
            newTrack.parentId = ctx.session.albumID;
            newTrack.type = 'album';
        }
        const id = await reviewsHelper.saveReview(newTrack);

        if (ctx.session.albumID) {
            await ctx.reply('трек додано до альбому');
        } else {
            await ctx.reply('Трек додано');
        }
        if (ctx.session.albumID) {
            reviewsHelper.getReviewById(ctx.session.albumID, async (err, album) => {
                if (err) {
                    console.error(err);
                    return ctx.reply('An error occurred while retrieving the review');
                }
                reviewsHelper.getReviewsByAlbum(album.id, (error, reviews) => {
                    let details = reviewsHelper.formatAlbumDetails(album, reviews);
                    return ctx.replyWithHTML(details, getAlbumKeyboard(album.id));
                });
            });
        } else {
            reviewsHelper.getReviewById(id, (err, review) => {

                if (err) {
                    console.error(err);
                    return ctx.reply('An error occurred while retrieving the review');
                }
                let details = '';
                details = reviewsHelper.formatReviewsDetails(review);

                return ctx.replyWithHTML(details);
            });
        }
        return ctx.scene.leave();
    });
addTrackWizard.hears('/start', async (ctx) => {
    // Stop the scene and return to the main menu
    ctx.scene.leave().then(r => console.log(r));
    ctx.reply('Вперед до головного меню');
    await startCommand(ctx);

});
// Export the helloWizardScene as a single object
module.exports = addTrackWizard;
