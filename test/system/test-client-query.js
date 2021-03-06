require('../common');
var Client = require('mysql').Client,
    client = Client(TEST_CONFIG),
    gently = new Gently();

// our test db might not exist yet, so don't try to connect to it
client.database = '';

client.connect();

client.query(
  'CREATE DATABASE '+TEST_CONFIG.database,
  gently.expect(function createDbCb(err) {
    if (err && err.errorNumber != Client.ERROR_DB_CREATE_EXISTS) {
      throw err;
    }
  })
);

client.query(
  'USE '+TEST_CONFIG.database,
  gently.expect(function useDbCb(err) {
    if (err) {
      throw err;
    }
  })
);

client.query(
  'CREATE TEMPORARY TABLE '+TEST_TABLE+
  '(id INT(11) AUTO_INCREMENT, title VARCHAR(255), text TEXT, created DATETIME, PRIMARY KEY (id));',
  gently.expect(function createTableCb(err) {
    if (err) {
      throw err;
    }
  })
);

client.query(
  'INSERT INTO '+TEST_TABLE+' '+
  'SET title = ?, text = ?, created = ?',
  ['super cool', 'this is a nice long text', '2010-08-16 10:00:23'],
  gently.expect(function insertCb(err) {
    if (err) {
      throw err;
    }
  })
);

var query = client.query(
  'INSERT INTO '+TEST_TABLE+' '+
  'SET title = ?, text = ?, created = ?',
  ['another entry', 'because 2 entries make a better test', '2010-08-16 12:42:15']
);

query.on('end', gently.expect(function insertOkCb(packet) {
}));

var query = client.query(
  'SELECT * FROM '+TEST_TABLE,
  gently.expect(function selectCb(err, results, fields) {
    if (err) {
      throw err;
    }

    console.log(results);
    console.log(fields);
    client.end();
  })
);
