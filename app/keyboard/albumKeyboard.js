const {Markup} = require('telegraf');

function getAlbumKeyboard(albumId) {
    let inlineKeyboard;

    // If the user is not an admin, create an inline keyboard with only one button: show list of tracks
    inlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('Додати трек до альому', 'add_track_to_album ' + albumId)],
        [Markup.button.callback('Назад', 'back')]
    ]);

    return inlineKeyboard;
}

module.exports = {
    getAlbumKeyboard,
}
