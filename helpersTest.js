const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

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
  it('should return a user with valid id when passing in an email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });
});

// const findUserByEmail = (email, users) => {           //Find user account for login or register
//   for(const userId in users) {
//     if(users[userId].email === email) {
//       return users[userId].id;
//       }
//     }
//     return false;
//   };