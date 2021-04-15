const { assert } = require('chai');

const { findUserByEmail, findUserById } = require('../helpers/helpers.js');

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

describe('findUserByEmail', function() {
  it('should return a user with valid id when passing in an email', function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });


  it('should return false when passing in an invalid email', function() {
    const user = findUserByEmail("user1122@example.com", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });

});



describe('findUserById', function() {
  it('should return an user object when passing in an user id', function () {
    const user = findUserById("userRandomID", testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.equal(expectedOutput, user);
  });


  it('should return false when passing in an invalid Id', function() {
    const user = findUserById("user1122Id", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });

});