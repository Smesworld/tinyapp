const PORT = 8080; // default port 8080

const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cookieParser = require('cookie-parser');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  return crypto.randomBytes(3).toString('hex');
};

const emailLookup = function(email) {
  const keys = Object.keys(users);

  return keys.find((key) => {
    return users[key].email === email;
  });
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  // const userName = req.body.username;
  res.cookie("username", req.body.username);
  // console.log(req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (email === "" || password === "") {
    console.log("Put something in!");
    res.status(400);
    res.send("Invalid email/password");
  }

  if (emailLookup(email)) {
    console.log("No dupes");
  }
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  console.log(users);

  res.cookie("user_id", userID);
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies['username']
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  // console.log(req.body, shortURL);  // Log the POST request body to the console
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("DELETE", req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
