const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080;


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const generateRandomString = () => {
  const shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
        
        
app.post("/urls", (req, res) => {                //create newURL on page /urls/new
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);                   //check if new data is saved in server
  res.redirect(`/urls/${shortURL}`);
});
        
        
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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
        //the HTML content that the /hello path responds with: <html><body>Hello <b>World</b></body></html>