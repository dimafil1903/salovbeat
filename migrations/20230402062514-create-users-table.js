'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const tableName = 'users';

exports.up = (db, callback) => {
  db.createTable(
      tableName,
      {
        id: { type: 'int', primaryKey: true, autoIncrement: true },
        telegram_id: { type: 'int', notNull: true, unique: true },
        username: { type: 'string', length: 255 },
        first_name: { type: 'string', length: 255 },
        last_name: { type: 'string', length: 255 },
        is_admin: { type: 'boolean', notNull: true, defaultValue: false },
        created_at: { type: 'datetime', notNull: true, defaultValue: new String('CURRENT_TIMESTAMP') },
      },
      callback
  );
};

exports.down = (db, callback) => {
  db.dropTable(tableName, callback);
};

exports._meta = {
  "version": 1
};
