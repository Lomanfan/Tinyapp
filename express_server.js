const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 8080;
const { restart } = require('nodemon');
const { response } = require("express");
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session', keys: ['happyFace', 'grumpyCat']
}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "https://http.cat", userID: "2cc688" },
  b2xXXX: { longURL: "https://goofygoat.ca", userID: "2cc689" },
};


const users = {
  '2cc689': {
    id: '2cc689',
    name: 'GoofyGoat',
    email: 'smilie001@sillygoof.com',
    password: 'Meh-meh',         //password has been encrypted
  },
  '2cc688': {
    id: '2cc688',
    name: 'GrumpyCat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee',  //password has been encrypted
  }
};


const generateRandomString = () => {
  const shortURL = Math.random().toString(36).substring(2, 8);
  return shortURL;
};


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


const urlsForUser = (cookieId, urlDatabase) => {
  const userUrls = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === cookieId) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
};


//GET ROUTES:
app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
    res.redirect("/login");                             //If not login, redirect to login page
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
      bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        users[userId] = {
          id: userId,
          name,
          email,
          password: hash
        };
        console.log("user",users[userId]);
        console.log("hashed pw",password);

        req.session["user_id"] = users[userId].id;
        res.redirect("/urls");    //Redirect to "/urls" after registration, per project requirements (bypassed "/login");
        return;
      });
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

  if (longURL.slice(0, 4) !== "http") {               //Added per message from Gary.
    res.send("Please include 'http://' when entering long url. Return to previous page and try again~!");
    return;
  };

  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect("/urls");
});



app.post("/urls/:shortURL/delete", (req, res) => {   //Delete, only logged in user that owns the URL can delete the URL.
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


app.post("/urls/:shortURL", (req, res) => {          //Edit longURL in account
  const id = req.session.user_id;
  const user = findUserById(id, users);
  const newLongURL = req.body.newLongURL;

  if (!id || !user) {                                 //Added because error message prompts after server timeout and disconnection. 
    res.status(500).send("Session has been ended by server. Please register and try again.");
    return;
  }

  if (newLongURL.slice(0, 4) !== "http") {             //Added per message from Gary.
    res.send("Please include 'http://' when entering long url. Return to previous page and try again~!");
    return;
  };

  urlDatabase[req.params.shortURL].longURL = newLongURL;
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {                 //Logout and delete cookie
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


        // app.get("/urls.json", (req, res) => {
        //   res.json(urlDatabase);           //response with urlDatabase with JSON string;
        // });

        // app.get("/hello", (req, res) => {
        //   res.send("<html><body>Hello <b>World</b></body></html>\n");
        // });

        // app.get("/set", (req, res) => {
        //   const a = 1;
        //   res.send(`a = ${a}`);
        // });

        // app.get("/fetch", (req, res) => {
        //   res.send(`a = ${a}`);
        // });

        // app.post("/urls", (req, res) => {
        //   console.log(req.body);  // Log the POST request body to the console
        //   res.send("Ok");         // Respond with 'Ok' (we will replace this)
        // });

        //curl -i http://localhost:8080/hello
        //curl -i http://localhost:8080/u/b2xVn2
        //curl -L http://localhost:8080/u/b2xVn2
        //curl -X POST "http://localhost:8080/urls/9sm5xK/delete" //delete from curl
        //curl -X POST http://example.com/api/endpoint // make a post request
        //curl -X POST -i localhost:8080/urls/sgq3y6/delete // update route so that only logged user can delete urls, use this curl command for testing
        //the HTML content that the /hello path responds with: <html><body>Hello <b>World</b></body></html>