//Creating Web Server with Express
//Use local host: http://localhost:8080/

const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine","ejs");
const morgan = require('morgan');
app.use(morgan("dev"));
const { restart } = require('nodemon');


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};    


const generateRandomString = () => {
  const shortURl = Math.random().toString(36).substring(2,8);
  return shortURl;
};    


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


app.post("/u/:shortURL", (req, res) => {  //URL Edit on ShortURL page & Update Database
  const newLongURL = req.body.newLongURL;
  // /urlDatabase[shortURL];
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = newLongURL;
  const templateVars = { urls: urlDatabase };
  res.render("urls_index",templateVars);
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
  
