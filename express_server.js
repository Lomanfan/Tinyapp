const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 8080;
const { restart } = require('nodemon');
const { response } = require("express");
const bcrypt = require('bcryptjs');
const methodOverride = require("method-override");
const { urlsForUser, findUserById, findUserByEmail, generateRandomString } = require("./helpers/helpers");
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session', keys: ['happyFace', 'grumpyCat']
}));
app.use(methodOverride("_method"));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "https://http.cat", userID: "2cc688" },
  b2xXXX: { longURL: "https://goofygoat.ca", userID: "2cc688" },
};


const users = {
  '2cc689': {
    id: '2cc689',
    name: 'GoofyGoat',
    email: 'smilie001@sillygoof.com',
    password: 'Meh-meh'          //password has been encrypted
  },
  '2cc688': {
    id: '2cc688',
    name: 'GrumpyCat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee'  //password has been encrypted
  }
};


//GET ROUTES:
app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    res.redirect("/login");                              //If not login, redirect to login page
    return;
  }
  res.redirect("/urls");
});


app.get("/urls", (req, res) => {
  const id = req.session["user_id"];                     //My URL Account Page
  const userUrls = urlsForUser(id, urlDatabase);
  const user = findUserById(id, users);

  if (!id || !user) {
    res.send("Please sign or register for access.");
    return;
  }
  if (user) {
    const templateVars = {
      urls: userUrls,
      user
    };
    res.render("urls_index", templateVars);
  }
});


app.get("/register", (req, res) => {
  const id = req.session["user_id"];
  const user = findUserById(id, users);
  
  if (user) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register");
});


app.get("/login", (req, res) => {                    //If user is logged in, direct to main page; else return to login page   
  const id = req.session["user_id"];
  const user = findUserById(id, users);

  if (user) {
    res.redirect("/urls");
    return;
  }

  const templateVars = { user: null };
  res.render('urls_login', templateVars);
})


app.get("/urls/new", (req, res) => {                   //Create new TinyURL Page
  const id = req.session["user_id"];
  const user = findUserById(id, users);

  if (!id || !user) {                                  //If user is not logged in, redirect to login page
    res.redirect("/urls");
    return;
  }
  if (user) {
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const id = req.session["user_id"];
  const user = findUserById(id, users);
  const userUrls = urlsForUser(id, urlDatabase);
  const shortURL = req.params.shortURL;
  const longURL = userUrls[shortURL] && userUrls[shortURL].longURL;

  if (!id || !user) {
    res.status(401).send("Please register or login to access information.");
    return;
  }

  if (!longURL) {     //If user makes a get request with an URL that is not in their account, response with an error message.
    res.send(`There's no record of this shortURL: ${shortURL} in your account.`)
    return;
  }

  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {   //If URL of given ID exists redirect to longURL, or response with error message.
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;   //Locate corresponding longURL in account

  if (longURL) {
    res.redirect(longURL);
    return;
  }
  res.send("No record found for this short url.");
});



//POST ROUTES:
app.post("/register", (req, res) => {
  const name = req.body.username;
  const { email, password } = req.body;
  const user = findUserByEmail(email, users);

  if (!name || !email || !password) {
    res.status(400).send("Please complete registration form to proceed.");
  }

  if (!user) {
    if (name, email, password) {
      const userId = generateRandomString();
      const hashPassword = bcrypt.hashSync(password, 10);
      users[userId] = {
        id: userId,
        name,
        email,
        password: hashPassword
      };

      req.session["user_id"] = users[userId].id;
      res.redirect("/urls");    //Redirect to "/urls" after registration, per project requirements (bypassed "/login");
      return;
    }
  }

  if (user) {
    res.status(400).send("If you are a current user, please return to login page.");
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userId = findUserByEmail(email, users);

  if (!userId) {
    res.status(403).send("Not an user yet? Return to previous page & Sign up today~!");
    return;
  }

  bcrypt.compare(password,users[userId].password)
    .then((result) => {
      if (result) {
        console.log("check login password",password);
        console.log("from login/users[userId].password",users[userId].password);

        req.session["user_id"] = userId;
        res.redirect("/urls");
      } else {
      res.status(403).send("Hi there~ Please enter valid username and password. Not an user yet? Return to previous page & Sign up today~!")
      }
  });
});


app.post("/urls/new", (req, res) => {                //Create short URL and add to database
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const id = req.session["user_id"];

  if (!longURL.startsWith("http://") && !longURL.startsWith("https://")) {    //Added per message from Gary on checking http:// and https://.
      res.send("Please include 'http:// or https://' when entering long url. Return to previous page and try again~!");
      return;
    // };
  }

  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect("/urls");
});


app.delete("/urls/:shortURL", (req, res) => {   //Delete, only logged in user that owns the URL can delete the URL.
  const shortURL = req.params.shortURL;
  const id = req.session["user_id"];
  const user = findUserById(id, users);
  const userUrls = urlsForUser(id, urlDatabase);

  if (user && userUrls[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.send("No record found of this shortURL.");
});


app.put("/urls/:shortURL", (req, res) => {           //Edit longURL in account
  const id = req.session.user_id;
  const user = findUserById(id, users);
  const newLongURL = req.body.newLongURL;

  if (!id || !user) {                                 //Added because error message prompts after server timeout and disconnection. 
    res.status(500).send("Server disconnected. Please register and try again.");
    return;
  }

  if (!newLongURL.startsWith("http://") && !newLongURL.startsWith("https://")) {    //Added per message from Gary on checking http:// and https://.
    res.send("Please include 'http:// or https://' when entering long url. Return to previous page and try again~!");
    return;
  };

  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {                 //Logout and delete cookie, redirect to /urls per requirement instead of /login page.
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Example app listening on port ${PORT}!`);
  }
});