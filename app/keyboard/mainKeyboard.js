const {Markup} = require('telegraf');

function getMainKeyboard(isAdmin) {
    let inlineKeyboard;

    if (isAdmin) {
        // If the user is an admin, create an inline keyboard with three buttons: show list of tracks, show list of tracks with admin overview, and add new track
        inlineKeyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('Сингли', 'show_tracks 1'),
                Markup.button.callback('Альбоми', 'show_albums 1')
            ],
            [
                Markup.button.callback('Сингли (Адмін)', 'show_tracks_admin 1'),
                Markup.button.callback('Альбоми (Адмін)', 'show_albums 1'),

            ],
            [
                Markup.button.callback('Додати сингл', 'add_track'),
                Markup.button.callback('Додати альбом', 'add_album')

            ]
        ]);
    } else {
        // If the user is not an admin, create an inline keyboard with only one button: show list of tracks
        inlineKeyboard = Markup.inlineKeyboard([
            Markup.button.callback('Сингли', 'show_tracks 1'),
            Markup.button.callback('Альбоми', 'show_albums 1')
        ]);
    }
    return inlineKeyboard;
}

module.exports = {
    getMainKeyboard,
}
