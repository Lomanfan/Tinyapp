//Creating Web Server with Express
//Use local host: http://localhost:8080/

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
  '2cc689cc': {     //random id 8 digits
    id: '2cc689cc',
    name: 'Happy Face',
    email: 'really.dont.care@happyface.com',
    password: 'keeysmiling',
  },
  '2cc689cd': {
    id: '2cc689cd',
    name: 'Grumpy Cat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee',
  },
};


const generateRandomString = () => {
  const shortURl = Math.random().toString(36).substring(2,8);
  return shortURl;
};    

app.post("/login", (req,res) => {    //????added to header partial, any changes to make to page depandences?
  const username = req.body.username;
  res.cookie('username', username);     ///????cookies application grey out???
  res.redirect(`/urls`);                 //TO-DO:check cookie Name and the Value, make sure remain set, and no change for new user submition
});

//Use cURL to inspect the response from the new route
//Terminal Testing with: curl -X POST -i localhost:8080/login -d "username=vanillaice"
//The -d flag is used to send form data in the same way a browser would when submitting our login form.

app.get("/", (req, res) => {
  res.send("Hello!");
});  

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});  

app.get("/urls",(req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index",templateVars);
});  


app.post("/urls/delete", (req, res) => {
  const shortURL = req.body.shortURL;
  // console.log(shortURL);
  // console.log("params",req.params);
  // console.log("body", req.body);
  delete urlDatabase[shortURL];
  const templateVars = { urls: urlDatabase };
  res.render("urls_index",templateVars);
});  

app.get("/urls/new", (req, res) => {   //Read Create TinyURL page
  res.render("urls_new");
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  const templateVars = { urls: urlDatabase, longURL: urlDatabase[editURL], shortURL: editURL};
  res.render("urls_show",templateVars);
});

app.post("/urls/:id/editURL", (req,res) => {
const newLongURL = req.body.newLongURL;
const id = req.body.id;
console.log(urlDatabase[id]);
delete urlDatabase[id];
urlDatabase[id] = newLongURL;
console.log(urlDatabase[id]);
const templateVars = { urls: urlDatabase }
res.render("urls_index", templateVars);
});


// app.get("/hello", (req, res) => {
  //   res.send("<html><body>Hello <b>World</b></body></html>\n");    
  // });
  
  app.get("/hello/", (req,res) => {
    const templateVars = { greeting: 'Hello World!'};
    res.render("hello_world", templateVars);
  });    
  
  
  
  app.listen(PORT,() => {
    console.log(`Example app listening on port ${PORT}!`);
  });
  
