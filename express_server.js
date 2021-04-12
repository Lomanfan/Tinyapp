const express = require("express");
const app = express();
const PORT = 8080; 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/",(req,res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);           //response with urlDatabase with JSON string;
});


app.get("/hello",(req,res) => {
res.send("<html><body>Hello <b>World</b></body></html>\n");

});

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
});



//curl -i http://localhost:8080/hello   
//the HTML content that the /hello path responds with: <html><body>Hello <b>World</b></body></html>