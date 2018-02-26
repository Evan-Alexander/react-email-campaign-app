// NODE_ENV is a given environment variable provided by Heroku
if (process.env.NODE_ENV === 'production') {
  // in prod mode - return prod keys
  module.exports = require('./prod');
} else {
  // in development mode - returns dev keys
  module.exports = require('./dev');
}
