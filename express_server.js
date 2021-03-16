//Creating Web Server with Express
//Use local host: http://localhost:8080/

const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {   //Notice the line of code that registers a handler on the root path, "/".??
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {          // add additional endpoints - 
  res.json(urlDatabase);
});

//Add the following route:
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});


