const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 8080;
const { restart } = require('nodemon');
const { response } = require("express");
const bcrypt = require('bcryptjs');
const { urlsForUser, findUserById, findUserByEmail, generateRandomString } = require("./helpers/helpers");
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ name: 'session', keys: ['happyFace', 'grumpyCat']
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "https://http.cat", userID: "2cc688" },
  b2xXXX: { longURL: "https://happyface.ca", userID: "2cc689" },
};


const users = {
  '2cc689': {
    id: '2cc689',
    name: 'HappyFace',
    email: 'smilie001@happyface.com',
    password: 'keepsmiling',     //password has been encrypted
  },
  '2cc688': {
    id: '2cc688',
    name: 'GrumpyCat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee',  //password has been encrypted
  }
};


//GET ROUTES:
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
  res.redirect("/login");  //If not login, redirect to login page
  return;
  }
  res.redirect('urls'); 
});


app.get("/urls", (req, res) => {            //My URL Account Page
  const id = req.session.user_id;
  const userUrls = urlsForUser(id, urlDatabase);
  const user = findUserById(users, id);

  if (!id || !user) {
    res.send("Please sign in or register for access.");
    return;
  }
  if (user) {
    const templateVars = {
      urls: userUrls,
      username: users[id].email
    };
    res.render("urls_index", templateVars);
  }
});


app.get("/urls/new", (req, res) => {       //Create new TinyURL Page
  const id = req.session.user_id
  const user = findUserById(users, id);

  if (!id || !user) {                       //If user is not logged in, redirect to login page
    res.redirect("/login");
    return;
  }
  if (user) {
    const templateVars = {
      username: users[id].email
    };
    res.render("urls_new", templateVars);
  }
});


app.get("/login", (req, res) => {        //If user is logged in, direct to main page; else return to login page
  const id = req.session.user_id;
  const user = findUserById(users, id);
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { username: null };
  res.render('urls_login', templateVars);
});  


app.get("/register", (req, res) => {       //Register Page
  const username = req.body.username;
  const templateVars = {
    username: username
  };  
  res.render("urls_register", templateVars);
});  


app.get("/urls/:shortURL", (req, res) => {  //Logged in users can see the URLs created in their account.
  const id = req.session.user_id;
  const user = findUserById(users, id);
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(id, urlDatabase);
  const longURL = userUrls[shortURL] && userUrls[shortURL].longURL;

  if (!id || !user) {
      res.status(401).send("Please register or login to access short URL.");
      return;
    }

  if (!longURL) {     //If user makes a get request with an URL that is not in their account, response with an error message.
    res.send(`There's no record of this shortURL: ${shortURL} in your account.`)
    return;
    }

  if (user) {
  const templateVars = {
    username: users[id].email,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
 }
});


app.get("/u/:shortURL", (req, res) => {  //If URL of given ID exists redirect to longURL, or response with error message.
const shortURL = req.params.shortURL;
const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;   //Locate corresponding longURL in account

 if (longURL) {
    res.redirect(longURL);
    return;
  }
  res.send("No record of this url in account.");
});




//POST ROUTES:

app.post("/urls/:id/editURL", (req, res) => {      //Edit longURL in account
  const newLongURL = req.body.newLongURL;
  const id = req.body.id;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {       //Login Authorization
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserByEmail(email, users);
  if (!userId) {
    res.status(401).send("Not an user yet? Return to previous page & Sign up today~!")
    return;
  }
  bcrypt.compare(password, users[userId].password)
    .then((result) => {
      if (result) {
        req.session.user_id = userId;
        res.redirect('/urls');
      } else {
        res.status(401).send("Hi there~ Please enter valid username and password. Not an user yet? Return to previous page & Sign up today~!")
      }
    });
});


app.post("/register", (req, res) => {      //New User Register
  const name = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  if (!name || !email || !password) {
    res.send("Please complete registration form to proceed.")
  }

  if (!user) {
    if (name, email, password) {
    const userId = generateRandomString();
    bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        users[userId] = {
          id: userId,
          name: name,
          email: email,
          password: hash
        };
      req.session.user_id = users[userId].id;
      res.redirect('/urls');  //Redirect to "/urls" after registration, per project requirements (bypassed "/login");
      return;                     
    });
  }
  }
  if (user) {
    res.status(403).send("If you are a current user, please return to login page.")
  }
});


app.post("/logout", (req, res) => {           //Logout and delete cookie
  const id = req.session.user_id;
  req.session = null;
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {     //Delete, only logged in user that owns the URL can delete the URL.
  const id = req.session.user_id;
  const user = findUserById(users, id);
  const shortURL = req.body.shortURL;
  const userUrls = urlsForUser(id, urlDatabase);

  if (user && userUrls[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
    res.send("No record found of this shortURL.");
});


app.post("/urls/new", (req, res) => {     //Create short URL and add to database
  const id = req.session.user_id;
  const userUrls = urlsForUser(id, urlDatabase);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  
  if(longURL) {
  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect("/urls");
  return;
  }
  res.send("Please enter longURL.")
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


