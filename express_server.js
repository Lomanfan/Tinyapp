const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// app.use(morgan("dev"));

const cookieParser = require("cookie-parser");
app.use(cookieParser());


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
    password: 'Meh-meh',     //password has been encrypted
  },
  '2cc688': {
    id: '2cc688',
    name: 'GrumpyCat',
    email: 'goodmorning.nosuchthing@fish.ca',
    password: 'whereismycoffee',  //password has been encrypted
  }
};

const generateRandomString = () => {
  const shortURL = Math.random().toString(36).substring(2,8);
  return shortURL;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/register",(req,res) => {
  res.render("urls_register");
});


app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];                         //added cookie info for rendering account home page
  const user = users[userId];
  const templateVars = {                     
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];                         //added cookie info for rendering account home page
  const user = users[userId];
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];                         //added cookie info for rendering account home page
  const user = users[userId];

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.post("/register",(req, res) => {
  const name = req.body.username;
  const {email, password} = req.body;
  const userId = generateRandomString();

  users[userId] = {                            //add new user
    id: userId,
    name,
    email,
    password
  };

  console.log(users);

  res.cookie("user_id", userId);              //user_id cookie with new generated ID

//check user_id cookie

res.redirect("/urls");

});



app.post("/urls", (req, res) => {                //create newURL on page /urls/new
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);                   //check if new data is saved in server
  res.redirect(`/urls/${shortURL}`);
});
        
app.post("/urls/:shortURL/delete", (req, res) => {   //delete URL from home page
  const shortURL = req.params.shortURL;
  console.log(req.params);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


app.post("/urls/:shortURL", (req, res) => {          //edit URL
  const newLongURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = newLongURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {

  const username = req.body.username;
  res.cookie("username", username);                //set cookie to username when press login button (no login page yet)
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");                      //clear cookie when logout
  res.redirect("urls");
});



app.listen(PORT, (err) => {
  if(err) {
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
        //the HTML content that the /hello path responds with: <html><body>Hello <b>World</b></body></html>