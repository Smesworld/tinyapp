const PORT = 8080; // default port 8080

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { generateRandomString, emailLookup, urlsForUser } = require('./helpers');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["sEkrtKye"],

  maxAge: 24 * 60 * 60 * 1000
}));

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "usrid": {
    id: "usrid",
    email: "user2@example.com",
    password: bcrypt.hashSync("the", 10)
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "usrid" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "usrid" }
};

app.get("/", (req, res) => {
  const loggedInUser = req.session.user_id

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  const loggedInUser = req.session.user_id

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post("/login", (req, res) => {
  const userID = emailLookup(users, req.body.email);

  if (userID && bcrypt.compareSync(req.body.password, users[userID].password)) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.render('login', { status: 403, msg: "Invalid email/password"});
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
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
  } else if (emailLookup(users, email)) {
    res.render('register', { status: 400, msg: "That email is already in use"});
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

app.get("/urls/new", (req, res) => {
  const loggedInUser = req.session.user_id;

  if (loggedInUser) {
    const user = users[loggedInUser];

    res.render("urls_new",  { user });
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const loggedInUser = req.session.user_id

  if (loggedInUser) {
    let templateVars = {
      user: users[loggedInUser],
      urls: urlsForUser(urlDatabase, loggedInUser)
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect('/register');
  }
});

app.post("/urls/", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const loggedInUser = req.session.user_id;
  const urlKey = req.params.shortURL
  const urlOwner = urlDatabase[urlKey].userID;

  if (loggedInUser === urlOwner) {
    let templateVars = {
      user: users[loggedInUser],
      shortURL: urlKey,
      longURL: urlDatabase[urlKey].longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const urlKey = req.params.shortURL;
  const longURL = urlDatabase[urlKey].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
