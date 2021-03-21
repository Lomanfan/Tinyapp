const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 8080;
const { restart } = require('nodemon');
const { response } = require("express");
const bcrypt = require('bcryptjs');
const { urlsForUser, findUserById, findUserByEmail, generateRandomString } = require("./helpers");
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

//GET Routes:

app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
  res.redirect("/login");  //If not login, redirect to login page. 
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


app.get("/urls/new", (req, res) => {   //Create new TinyURL Page
  const id = req.session.user_id
  const user = findUserById(users, id);

  if (!id || !user) {
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


app.get("/login", (req, res) => {
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


app.get("/urls/:shortURL", (req, res) => {    ///NOT WORKING
  const id = req.session.user_id;
  const user = findUserById(users, id);
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(id, urlDatabase);
  const longURL = userUrls[shortURL] && userUrls[shortURL].longURL;

  if (!id || !user) {
      res.status(401).send("Please register or login to access short URL.");
      return;
    }

  if (!longURL) {
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


app.get("/u/:shortURL", (req, res) => {
const shortURL = req.params.shortURL;
const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
console.log({shortURL, longURL, urlDatabase});
 if (longURL) {
    res.redirect(longURL);
    return;
  }
  res.send("No record of this url.");
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


//Use cURL to inspect the response from the new route
//Terminal Testing with: curl -X POST -i localhost:8080/login -d "username=vanillaice"
//The -d flag is used to send form data in the same way a browser would when submitting our login form.


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


app.post("/logout", (req, res) => {           //Logout
  const id = req.session.user_id;
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/delete", (req, res) => {       //Delete
  const shortURL = req.body.shortURL;
  // console.log("params",req.params);
  // console.log("body", req.body);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/new", (req, res) => {     //Create short URL & Add to account
  const id = req.session.user_id;
  const userUrls = urlsForUser(id, urlDatabase);
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = { longURL: longURL, userID: id };

  res.redirect("/urls");
  return;
});


app.get("/urls/:id", (req, res) => {  //URL Edit on ShortURL page & Update Database
  const editURL = req.params.id;
  console.log("editURL", editURL);

  const templateVars = {
    urls: urlDatabase,
    longURL: urlDatabase[editURL],
    shortURL: editURL
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/editURL", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const id = req.body.id;
  urlDatabase[id].longURL = newLongURL;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


