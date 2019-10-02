const crypto = require("crypto");

const generateRandomString = function() {
  return crypto.randomBytes(3).toString('hex');
};

const emailLookup = function(database, email) {
  const keys = Object.keys(database);

  return keys.find((key) => {
    return database[key].email === email;
  });
};

const urlsForUser = function(database, id) {
  const urls = {};
  const keys = Object.keys(database);

  for (const key in database) {
    if (database[key].userID === id) {
      urls[key] = database[key].longURL;
    }
  }

  return urls;
};

module.exports = { generateRandomString, emailLookup, urlsForUser };
