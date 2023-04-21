const {Markup} = require('telegraf');
const {reviewsHelper} = require("../helpers");
const {getMainKeyboard} = require("../keyboard/mainKeyboard");
const PAGE_SIZE = 10;
const PAGE_SIZE_ALBUM = 5;

// Define a function to handle the "Show Tracks" button
const handleShowTracks = async (ctx) => {
    // Get the current page number and calculate the offset

    let data = ctx.callbackQuery.data;
    const parts = data.split(' ');
    let page;
    if (parts.length === 1) {
        page = 1
    } else {
        page = parseInt(parts[1]);
    }

    const offset = (page - 1) * PAGE_SIZE;
// Fetch the tracks from the database
    reviewsHelper.getAllReviews(PAGE_SIZE, offset, (reviews) => {
        // Check if there are any tracks to show
        if (reviews.length === 0) {
            ctx.reply('Ще нема сингів');
            return;
        }

        // Build the message with the track details
        let message = '<b>Сингли:</b>\n\n';
        for (const review of reviews) {
            const details = reviewsHelper.formatReviewsSmall(review);
            message += `${details}\n`;
        }

        // Get the total number of reviews
        reviewsHelper.getTotalReviewsCount(async (err, count) => {

            // Calculate the pagination parameters
            const maxPage = Math.ceil(count / PAGE_SIZE);

            let buttons = [];
            if (page > 1) {
                buttons.push(Markup.button.callback('⬅️', `show_tracks ${page - 1}`));
            }
            if (page < maxPage) {
                buttons.push(Markup.button.callback("➡️", `show_tracks ${page + 1}`));
            }

            buttons = [buttons, [Markup.button.callback("Вихід", `back`)]];

            // Construct the markup for the pagination buttons
            let markup = Markup.inlineKeyboard(buttons, {columns: 2});

            console.log(ctx.chat.id, ctx.callbackQuery.message.message_id,);

            if (ctx.callbackQuery.message.reply_markup) {
                await ctx.editMessageText(message, {parse_mode: 'HTML', disable_web_page_preview: true});
                await ctx.editMessageReplyMarkup({inline_keyboard: markup.reply_markup.inline_keyboard});
            } else {
                await ctx.replyWithHTML(message, markup).then((sentMessage) => {
                    ctx.session.messageId = sentMessage.message_id;
                });
            }
        });
    });

}

const handleShowAlbums = async (ctx) => {
    // Get the current page number and calculate the offset

    let data = ctx.callbackQuery.data;
    const parts = data.split(' ');
    let page;
    if (parts.length === 1) {
        page = 1
    } else {
        page = parseInt(parts[1]);
    }

    const offset = (page - 1) * PAGE_SIZE_ALBUM;
// Fetch the tracks from the database
    reviewsHelper.getAllAlbums(PAGE_SIZE_ALBUM, offset, (albums) => {
        // Check if there are any tracks to show
        if (albums.length === 0) {
            ctx.reply('Ще нема альбомів');
            return;
        }

        // Build the message with the track details
        let message = '<b>Альбоми:</b>\n\n';
        for (const album of albums) {
            reviewsHelper.getReviewsByAlbum(album.id, (error,reviews) => {
                const details = reviewsHelper.formatAlbumSmallDetails(album, reviews);
                message += `${details}\n`;
            });
        }


        // Get the total number of reviews
        reviewsHelper.getTotalAlbumReviewsCount(async (err, count) => {

            // Calculate the pagination parameters
            const maxPage = Math.ceil(count / PAGE_SIZE);

            let buttons = [];
            if (page > 1) {
                buttons.push(Markup.button.callback('⬅️', `show_albums ${page - 1}`));
            }
            if (page < maxPage) {
                buttons.push(Markup.button.callback("➡️", `show_albums ${page + 1}`));
            }

            buttons = [buttons, [Markup.button.callback("Вихід", `back`)]];

            // Construct the markup for the pagination buttons
            let markup = Markup.inlineKeyboard(buttons, {columns: 2});

            console.log(ctx.chat.id, ctx.callbackQuery.message.message_id,);

            if (ctx.callbackQuery.message.reply_markup) {
                await ctx.editMessageText(message, {parse_mode: 'HTML', disable_web_page_preview: true});
                await ctx.editMessageReplyMarkup({inline_keyboard: markup.reply_markup.inline_keyboard});
            } else {
                await ctx.replyWithHTML(message, markup).then((sentMessage) => {
                    ctx.session.messageId = sentMessage.message_id;
                });
            }
        });
    });

}
const back = async (ctx) => {
    let admin;
    try {
        const ADMIN_IDS = process.env.ADMIN_IDS.split(',').map((id) => parseInt(id));

        ADMIN_IDS.includes(ctx.callbackQuery.message.chat.id) ? admin = true : admin = false;

        await ctx.editMessageText("Шо ти", {parse_mode: 'HTML', disable_web_page_preview: true});

        await ctx.editMessageReplyMarkup({inline_keyboard: getMainKeyboard(admin).reply_markup.inline_keyboard});
    } catch (error) {
        console.error('Error in /start command:', error);
    }
}

const handleShowTracksForAdmin = async (ctx) => {
    let data = ctx.callbackQuery.data;
    const parts = data.split(' ');
    let page;
    if (parts.length === 1) {
        page = 1
    } else {
        page = parseInt(parts[1]);
    }

    const offset = (page - 1) * PAGE_SIZE;
    reviewsHelper.getAllReviews(PAGE_SIZE, offset, (reviews) => {
        // Check if there are any tracks to show
        if (reviews.length === 0) {
            ctx.reply('Ще нема синглів, ти ж адмін)) додай, бро');
            return;
        }

        // Build the message with the track details
        let message = '<b>Сингли:</b>\n\n';
        for (const review of reviews) {
            const details = reviewsHelper.formatReviewsDetails(review);
            message +=
                `${details}` +
                `/edit_${review.id} \n` +
                `/link_${review.id}\n` +
                `/delete_${review.id}\n\n`;

        }

        // Get the total number of reviews
        reviewsHelper.getTotalReviewsCount(async (err, count) => {

            // Calculate the pagination parameters
            const maxPage = Math.ceil(count / PAGE_SIZE);

            let buttons = [];
            if (page > 1) {
                buttons.push(Markup.button.callback('⬅️', `show_tracks_admin ${page - 1}`));
            }
            if (page < maxPage) {
                buttons.push(Markup.button.callback("➡️", `show_tracks_admin ${page + 1}`));
            }

            buttons = [buttons, [Markup.button.callback("Вихід", `back`)]];

            // Construct the markup for the pagination buttons
            let markup = Markup.inlineKeyboard(buttons, {columns: 2});

            console.log(ctx.chat.id, ctx.callbackQuery.message.message_id,);

            if (ctx.callbackQuery.message.reply_markup) {
                await ctx.editMessageText(message, {parse_mode: 'HTML', disable_web_page_preview: true});
                await ctx.editMessageReplyMarkup({inline_keyboard: markup.reply_markup.inline_keyboard});
            } else {
                await ctx.replyWithHTML(message, markup).then((sentMessage) => {
                    ctx.session.messageId = sentMessage.message_id;
                });
            }
        });
    });
}

const handleShowAlbumsForAdmin = async (ctx) => {
    // Get the current page number and calculate the offset

    let data = ctx.callbackQuery.data;
    const parts = data.split(' ');
    let page;
    if (parts.length === 1) {
        page = 1
    } else {
        page = parseInt(parts[1]);
    }

    const offset = (page - 1) * PAGE_SIZE_ALBUM;
// Fetch the tracks from the database
    reviewsHelper.getAllAlbums(PAGE_SIZE_ALBUM, offset, (albums) => {
        // Check if there are any tracks to show
        if (albums.length === 0) {
            ctx.reply('Ще нема альбомів, ти ж адмін))) додай, бро');
            return;
        }

        // Build the message with the track details
        let message = '<b>Альбоми:</b>\n\n';
        for (const album of albums) {
            reviewsHelper.getReviewsByAlbum(album.id, (err,reviews) => {
                const details = reviewsHelper.formatAlbumDetails(album, reviews);
                message += `${details}\n` +
                    `/link_${album.id}\n` +
                    `/delete_${album.id}\n\n`;
            });
        }


        // Get the total number of reviews
        reviewsHelper.getTotalAlbumReviewsCount(async (err, count) => {

            // Calculate the pagination parameters
            const maxPage = Math.ceil(count / PAGE_SIZE);

            let buttons = [];
            if (page > 1) {
                buttons.push(Markup.button.callback('⬅️', `show_albums_admin ${page - 1}`));
            }
            if (page < maxPage) {
                buttons.push(Markup.button.callback("➡️", `show_albums_admin ${page + 1}`));
            }

            buttons = [buttons, [Markup.button.callback("Вихід", `back`)]];

            // Construct the markup for the pagination buttons
            let markup = Markup.inlineKeyboard(buttons, {columns: 2});

            console.log(ctx.chat.id, ctx.callbackQuery.message.message_id,);

            if (ctx.callbackQuery.message.reply_markup) {
                await ctx.editMessageText(message, {parse_mode: 'HTML', disable_web_page_preview: true});
                await ctx.editMessageReplyMarkup({inline_keyboard: markup.reply_markup.inline_keyboard});
            } else {
                await ctx.replyWithHTML(message, markup).then((sentMessage) => {
                    ctx.session.messageId = sentMessage.message_id;
                });
            }
        });
    });

}

module.exports = {
    back,
    handleShowTracks,
    handleShowTracksForAdmin,
    handleShowAlbums,
    handleShowAlbumsForAdmin
}

