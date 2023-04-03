/* jshint node: true */
require('dotenv').config();
const {Telegraf, session} = require('telegraf');
const {startCommand} = require("./app/handlers/start");
const {handleShowTracks, back, handleShowTracksForAdmin, handleShowAlbums, handleShowAlbumsForAdmin} = require("./app/handlers/showReviews");
const express = require('express');
const {Stage} = require("telegraf/scenes");
const app = express();
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

let addTrackWizard = require('./app/scenes/add-track');
let editTrackWizard = require('./app/scenes/edit-track');
let linkScene = require('./app/scenes/link');
let albumScene = require('./app/scenes/add-album');
const {deleteReview} = require("./app/helpers/reviewsHelper");

const ADMIN_IDS = process.env.ADMIN_IDS.split(',').map((id) => parseInt(id));

// Create a new bot instance
const bot = new Telegraf(token);
bot.use(session());
const stage = new Stage([addTrackWizard, editTrackWizard, linkScene, albumScene]);
bot.use(stage.middleware());
// Listener for the /start command
bot.start(startCommand);

bot.action('add_track', async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        ctx.session.albumID = null;

        await ctx.scene.enter('add-track-wizard');
    } else {
        await ctx.reply('You are not authorized to add tracks');
    }
});

bot.action(/^add_track_to_album (\d+)$/, async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        ctx.session.albumID = parseInt(ctx.callbackQuery.data.split(' ')[1]);
        await ctx.scene.enter('add-track-wizard');
    } else {
        await ctx.reply('You are not authorized to add tracks');
    }
});
bot.action('add_album', async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        //   ctx.session.albumID = parseInt(ctx.callbackQuery.data.split(' ')[1]);
        await ctx.scene.enter('add-album-wizard');
    } else {
        await ctx.reply('You are not authorized to add tracks');
    }
});

bot.action('back', back);

bot.action(/^show_tracks (\d+)$/, handleShowTracks);
bot.action(/^show_tracks_admin (\d+)$/, handleShowTracksForAdmin);
bot.action(/^show_albums (\d+)$/, handleShowAlbums);
bot.action(/^show_albums_admin (\d+)$/, handleShowAlbumsForAdmin);

bot.command(/^edit_(\d+)$/, async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        console.log(ctx.message.text.split('_'));
        ctx.session.trackId = parseInt(ctx.message.text.split('_')[1]);
        await ctx.scene.enter('edit-track-wizard');
    } else {
        await ctx.reply('You are not authorized to edit tracks');
    }
});

bot.command(/^link_(\d+)$/, async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        ctx.session.trackId = parseInt(ctx.message.text.split('_')[1]);
        await ctx.scene.enter('link');

    } else {
        await ctx.reply('You are not authorized to edit tracks');
    }
});
bot.command(/^delete_(\d+)$/, async (ctx) => {
    if (ctx.from && ctx.from.id && ADMIN_IDS.includes(ctx.from.id)) {
        ctx.session.trackId = parseInt(ctx.message.text.split('_')[1]);
        await deleteReview(ctx.session.trackId);
        await ctx.reply('Добре, видалив');
    } else {
        await ctx.reply('You are not authorized to edit tracks');
    }
});

bot.command('mylink', (ctx) => {
    const myLink = 'https://example.com';

    ctx.replyWithHTML(`<b><a href="${myLink}">Click here to visit my link</a></b>
<b><a href="${myLink}">Click here to visit my link</a></b>
<b><a href="${myLink}">Click here to visit my link</a></b>
<b><a href="${myLink}">Click here to visit my link</a></b><b><a href="${myLink}">Click here to visit my link</a></b>

`);
});


// Launch the bot
const PORT = process.env.PORT || 3000;

app.use(bot.webhookCallback('/webhook'));

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await bot.telegram.deleteWebhook();
    try {
        bot.telegram.setWebhook(webhookUrl).then(r => console.log(r));
        console.log(`Webhook set to: ${webhookUrl}`);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
});


