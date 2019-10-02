const { assert } = require('chai');

const { emailLookup } = require('../helpers.js');

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