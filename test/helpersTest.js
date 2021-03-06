const { assert } = require('chai');

const { generateRandomString, emailLookup, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "usrid" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "usrid" },
  "open99": { longURL: "http://www.hotmail.com", userID: "ausr"}
};

describe('generateRandomString', function() {
  it('should return a string of length 6', function() {
    const randomString = generateRandomString();

    assert.strictEqual(randomString.length, 6);
  });

  it('should return differnt strings when called', function() {
    const randomString1 = generateRandomString();
    const randomString2 = generateRandomString();

    assert.notEqual(randomString1, randomString2);
  });
});

describe('emailLookup', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";

    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined with invalid email', function() {
    const user = emailLookup(testUsers, "notauser@example.com")
    const expectedOutput = undefined;

    assert.strictEqual(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return an empty object for a user with no urls', function() {
    const urls = urlsForUser(urlDatabase, "notusr")
    const expectedOutput = {};

    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an object containing all urls with a matching user id', function() {
    const urls = urlsForUser(urlDatabase, "usrid")
    const expectedOutput = {
      "b2xVn2": "http://www.lighthouselabs.ca",
      "9sm5xK": "http://www.google.com"
    };

    assert.deepEqual(urls, expectedOutput);
  });
});
