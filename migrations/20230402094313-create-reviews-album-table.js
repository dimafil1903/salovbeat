'use strict';

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};
const tableName = 'reviews';

exports.up = (db, callback) => {
    db.createTable(
        tableName,
        {
            id: {type: 'int', primaryKey: true, autoIncrement: true},
            release_name: {type: 'string', notNull: true},
            parent_id: {type: 'int', notNull: false},
            personal_impressions: {type: 'real', notNull: false},
            trendiness: {type: 'real', notNull: false},
            text_and_lyrics_structure: {type: 'real', notNull: false},
            melody_and_performance: {type: 'real', notNull: false},
            arrangement: {type: 'real', notNull: false},
            link: {type: 'string', notNull: false},
            type: {type: 'string', notNull: false},
            created_at: {type: 'timestamp', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP')},
        },
        callback
    );
};

exports.down = function (db, callback) {
    db.dropTable(tableName, callback);
};

exports._meta = {
    "version": 1
};
