const findUserById = (id, users) => {
  if (users[id]) {
    return users[id];
  }
  return false;
};


const findUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};


const generateRandomString = () => {
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


