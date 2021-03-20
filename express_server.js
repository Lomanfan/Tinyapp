
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 8080;
const { restart } = require('nodemon');
const { response } = require("express");
app.set("view engine","ejs");
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};    


const users = {
  '2cc689': {     //random id 8 digits
    id: '2cc689',
    name: 'HappyFace',
    email: 'smilie001@happyface.com',
    password: 'keepsmiling',
  },
  '2cc688': {
    id: '2cc688',
    name: 'GrumpyCat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee',
  }
};

const generateRandomString = () => {   //Create for shortern URL & Random ID
  const shortURl = Math.random().toString(36).substring(2,8);
  return shortURl;
};

const findUser = (email) => {           //Find user account for login or register
for(const userId in users) {
  if(users[userId].email === email) {
    return users[userId];
    }
  }
  return false;
};

const loginAuth = (email, password) => {
  const user = findUser(email);
  if (user && user.password === password) {
    return user.id;
  }
  return false;
};

app.get("/login", (req, res) => {            //Navigate to login page
  const templateVars = { username: null };
  res.render('urls_login', templateVars);
});


app.post("/login", (req,res) => {       //Login
  console.log(req.body.email, req.body.password);
  const email = req.body.email;
  const password = req.body.password;
  const userId = loginAuth(email, password);
  if (userId) {
    res.cookie("user_id", userId);
    res.redirect("/urls");
  } else {
    res.status(401).send("Hi there~ Please enter valid username or password. Not an user yet? Return to previous page & Sign up today~!")
  }
});


//Use cURL to inspect the response from the new route
//Terminal Testing with: curl -X POST -i localhost:8080/login -d "username=vanillaice"
//The -d flag is used to send form data in the same way a browser would when submitting our login form.


app.get("/register", (req,res) => {       //Navigate to Register Page
  const username = req.body.username;
  const templateVars = {
    username: username
  };
  res.render("urls_register", templateVars);
});

const addNewUser = (name, email, password) => {
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    name,
    email,
    password,
  };
  users[userId] = newUser;

  return userId;
};

app.post("/register", (req, res) => {      //New User Register
  const name = req.body.username;
  const email =req.body.email;
  const password = req.body.password;
  const user = findUser(email);            //For-loop to check if email exit

  if(!user) {
    const userId = addNewUser(name, email, password);  //Callback addNewUser(generate id, add user) & set cookie
    res.cookie('user_id', userId);
    res.redirect('/login');
  } else {
    res.status(403).send("This email already exits.")
  }
});


app.get("/", (req, res) => {
  res.send("Hello!");
});  

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get("/urls",(req, res) => {             //Render: My URL account info
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies.username 
  };
  res.render("urls_index",templateVars);
});

app.post("/logout", (req,res) => {           //Logout -- Logout ok, but still showing account info
const username = req.body.username;
res.clearCookie('username', username);
  // clear the cookie
res.redirect("/urls");  
});

app.post("/urls/delete", (req, res) => {       //Delete
  const shortURL = req.body.shortURL;
  // console.log("params",req.params);
  // console.log("body", req.body);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {   //Read Create TinyURL page
  const templateVars = { 
    username: req.cookies.username 
  };
  res.render("urls_new", templateVars);
});  

//Shortening URL & Update Database
app.post("/urls/new", (req, res) => {    //Creat - short URL from Long & Edit Submint Page
  // console.log(req.body.longURL); //and the body will contain one URL-encoded name-value pair with the name longURL.
  // console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;  
  const shortURL = generateRandomString();
  // console.log(longURL, shortURL);
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  // res.render("urls_new"); 
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL], 
    username: req.cookies.username 
  };
  res.render("urls_show", templateVars);
});  


app.get("/u/:shortURL", (req, res) => {   //Shorten URL Result & Click & Redirect to Long URL Website
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});  


app.post("/urls/:editURL", (req, res) => {  //URL Edit on ShortURL page & Update Database
  const editURL = req.body.editURL;
  // // /urlDatabase[shortURL];
  // urlDatabase[editURL] = newLongURL;
  // // console.log("shortURL", shortURL);
  const templateVars = { 
    urls: urlDatabase, 
    longURL: urlDatabase[editURL], 
    shortURL: editURL
  };
  res.render("urls_show",templateVars);
});

app.post("/urls/:id/editURL", (req,res) => {
const newLongURL = req.body.newLongURL;
const id = req.body.id;
// console.log(urlDatabase[id]);
urlDatabase[id] = newLongURL;
// console.log(urlDatabase[id]);
res.redirect("/urls");
});

// app.get("/hello", (req, res) => {
  //   res.send("<html><body>Hello <b>World</b></body></html>\n");    
  // });
  
  app.get("/hello/", (req,res) => {
    const templateVars = { 
      greeting: 'Hello World!'
    };
    res.render("hello_world", templateVars);
  });    
  
  
  app.listen(PORT,() => {
    console.log(`Example app listening on port ${PORT}!`);
  });
  
