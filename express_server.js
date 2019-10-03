const PORT = 8080; // default port 8080

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const { generateRandomString, errorResponse, getUserByEmail, doesUserExist, urlsForUser } = require('./helpers');

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
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    const userID = getUserByEmail(users, req.body.email);
    const inputPassword = req.body.password;

    if (userID && bcrypt.compareSync(inputPassword, users[userID].password)) {
      req.session.user_id = userID;
      res.redirect('back');
    } else {
      errorResponse(res, 403, 'login');
    }
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

  if (email === "" || password === "" || getUserByEmail(users, email)) {
    errorResponse(res, 400, 'register');
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
    req.session = null;
    errorResponse(res, 401, 'login');
  }
});

app.post("/urls", (req, res) => {
  const loggedInUser = doesUserExist(users, req.session.user_id);

  if (loggedInUser) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    errorResponse(res, 401, 'login');
  }
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
    errorResponse(res, 404, 'error');
  } else {
    const loggedInUser = doesUserExist(users, req.session.user_id);

    if (!loggedInUser) {
      req.session = null;      
      errorResponse(res, 401, 'login');
    }
    const usersUrls = urlsForUser(urlDatabase, loggedInUser);
    if (!Object.keys(usersUrls).includes(urlKey)) {
      errorResponse(res, 403, 'error');
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
    errorResponse(res, 404, 'error');
  }
});

app.use(function(req, res) {
  errorResponse(res, 404, 'error');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


