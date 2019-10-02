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
};

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
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const userID = emailLookup(req.body.email);

  if (userID && users[userID].password === req.body.password) {
    res.cookie("user_id", userID);
    res.redirect('/urls');
  } else {
    res.render('login', { status: 403, msg: "Invalid email/password"});
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
    res.render('register', { status: 400, msg: "Enter non-empty email/password"});
  } else if (emailLookup(email)) {
    res.render('register', { status: 400, msg: "That email is already in use"});
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };

    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    const user = users[req.cookies['user_id']];
    res.render("urls_new",  { user });
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/register');
  }
});

app.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
