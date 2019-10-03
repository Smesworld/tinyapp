const PORT = 8080; // default port 8080

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { generateRandomString, getUserByEmail, doesUserExist, urlsForUser } = require('./helpers');

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

// app.use('/error', function(req, res) {
//   res.status(400);
//   res.render('error', {status: 404, msg: 'File Not Found', user: users[req.session.user_id]});
// });

app.get("/", (req, res) => {
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.render('login');
  }
});

app.post("/login", (req, res) => {
  const userID = getUserByEmail(users, req.body.email);
  const inputPassword = req.body.password;

  if (userID && bcrypt.compareSync(inputPassword, users[userID].password)) {
    req.session.user_id = userID;
    res.redirect('back');
  } else {
    res.render('login', { status: 403, msg: "Invalid email/password"});
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    req.session = null;
    res.render('register');
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (email === "" || password === "") {
    res.status(400).render('register', { status: 400, msg: "Enter non-empty email/password"});
  } else if (getUserByEmail(users, email)) {
    res.status(400).render('register', { status: 400, msg: "That email is already in use"});
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
    req.session = null;
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    let templateVars = {
      user: users[loggedInUser],
      urls: urlsForUser(urlDatabase, loggedInUser)
    };

    res.render("urls_index", templateVars);
  } else {
    res.status(401).render('login', { status: 401, msg: "You must be logged in to view that"});
  }
});

app.post("/urls", (req, res) => {

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
  const urlKey = req.params.shortURL;
  
  if (!urlDatabase[urlKey]) {
    res.render('error', {status: 404, msg: 'File not found', user: users[req.session.user_id]});
  } else {
    const loggedInUser = doesUserExist(users, req.session.user_id);

    if (!loggedInUser) {
      req.session = null;      
      res.render('login', { status: 401, msg: "Access not authorized"});
    }
    const usersUrls = urlsForUser(urlDatabase, loggedInUser);
    if (!Object.keys(usersUrls).includes(urlKey)) {
      res.render('error', {status: 403, msg: 'Access not permitted', user: users[req.session.user_id]});
    } else {
      let templateVars = {
        user: users[loggedInUser],
        shortURL: urlKey,
        longURL: urlDatabase[urlKey].longURL
      };

      res.render("urls_show", templateVars);
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  const urlKey = req.params.shortURL;
  if (urlDatabase[urlKey]) {
    const longURL = urlDatabase[urlKey].longURL;
    res.redirect(longURL);
  } else {
    res.render('error', {status: 404, msg: 'File Not Found', user: users[req.session.user_id]});
  }
});

app.use(function(req, res) {
  res.status(404);
  res.render('error', {status: 404, msg: 'File Not Found', user: users[req.session.user_id]});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


