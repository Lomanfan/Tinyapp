

const findUserById = (users, id) => {
  for (let userId in users) {
    if (users[userId].id === id) {
      return users[userId].id;
    }
  }
  return false;
};

const findUserByEmail = (email, users) => {           //Find user account for login or register
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};

const generateRandomString = () => {   //Create for shortern URL & Random ID
  const shortURl = Math.random().toString(36).substring(2, 8);
  return shortURl;
};


const urlsForUser = (cookieId, urlDatabase) => {
  const userUrls = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === cookieId) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
};



module.exports = { urlsForUser, findUserById, findUserByEmail, generateRandomString };