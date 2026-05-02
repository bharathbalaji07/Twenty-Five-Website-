const { makeFileStore } = require('./fileStore');
const { makeMongoStore } = require('./mongoStore');

async function createStore() {
  if (process.env.MONGODB_URI) {
    return makeMongoStore(process.env.MONGODB_URI);
  }
  return makeFileStore();
}

module.exports = { createStore };
