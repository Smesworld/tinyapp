const PORT = 8080; // default port 8080

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

const { generateRandomString, errorResponse, getUserByEmail, urlsForUser, doesUrlBelongToUser, formatUrl } = require('./helpers');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["sEkrtKye"],

  maxAge: 24 * 60 * 60 * 1000,
  expires: new Date('2020')
}));

//Databases:
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
  "b2xVn2": { date: new Date(), longURL: "http://www.lighthouselabs.ca", userID: "usrid", visits: [], uniqueVisits: 0 },
  "9sm5xK": { date: new Date(), longURL: "http://www.google.com", userID: "usrid", visits: [], uniqueVisits: 0 }
};

//Root:
app.get("/", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post("/login", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    const userIDExists = getUserByEmail(users, req.body.email);

    if (!userIDExists || req.body.password === "") {
      errorResponse(res, 400, 'login');
    } else {
      const passwordsMatch = bcrypt.compareSync(req.body.password, users[userIDExists].password);

      if (userIDExists && passwordsMatch) {
        req.session.userID = userIDExists;
        req.session.visited = false;
        res.redirect('back');
      } else {
        errorResponse(res, 403, 'login');
      }
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    res.redirect('/urls');
  } else {
    res.render('register');
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID;

  if (email === "" || password === "" || getUserByEmail(users, email)) {
    errorResponse(res, 400, 'register');
  } else {
    if (req.session.visited) {
      userID = req.session.visited;
    } else {
      userID = generateRandomString();
    }

    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    req.session.userID = userID;
    res.redirect('/urls');
  }
});

app.get("/urls/new", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    const user = users[loggedInUser];

    res.render("urls_new", { user });
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    let templateVars = {
      user: users[loggedInUser],
      urls: urlsForUser(urlDatabase, loggedInUser)
    };

    res.render("urls_index", templateVars);
  } else {
    errorResponse(res, 401, 'login');
  }
});

app.post("/urls", (req, res) => {
  const loggedInUser = req.session.userID;

  if (loggedInUser) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      date: new Date(),
      longURL: formatUrl(req.body.longURL),
      userID: loggedInUser,
      visits: [],
      uniqueVisits: 0
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    errorResponse(res, 401, 'login');
  }
});

app.delete("/urls/:shortURL", (req, res) => {
  const loggedInUser = req.session.userID;

  if (!loggedInUser) {
    errorResponse(res, 401, 'login');
  } else {
    const urlBelongsToUser = doesUrlBelongToUser(urlDatabase, req.params.shortURL, loggedInUser);

    if (!urlBelongsToUser) {
      errorResponse(res, 403, 'error');
    } else {
      delete urlDatabase[req.params.shortURL];
      res.redirect(`/urls`);
    }
  }
});

app.put("/urls/:shortURL", (req, res) => {
  const loggedInUser = req.session.userID;

  if (!loggedInUser) {
    errorResponse(res, 401, 'login');
  } else {
    const urlBelongsToUser = doesUrlBelongToUser(urlDatabase, req.params.shortURL, loggedInUser);

    if (!urlBelongsToUser) {
      errorResponse(res, 403, 'error');
    } else {
      urlDatabase[req.params.shortURL].date = new Date(),
      urlDatabase[req.params.shortURL].longURL = formatUrl(req.body.longURL);
      urlDatabase[req.params.shortURL].visits = [];
      urlDatabase[req.params.shortURL].uniqueVisits = 0;
      res.redirect(`/urls`);
    }
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const urlKey = req.params.shortURL;

  if (!urlDatabase[urlKey]) {
    errorResponse(res, 404, 'error');
  } else {
    const loggedInUser = req.session.userID;

    if (!loggedInUser) {
      errorResponse(res, 401, 'login');
    } else {
      const urlBelongsToUser = doesUrlBelongToUser(urlDatabase, urlKey, loggedInUser);

      if (!urlBelongsToUser) {
        errorResponse(res, 403, 'error');
      } else {
        let templateVars = {
          user: users[loggedInUser],
          shortURL: urlKey,
          date: urlDatabase[urlKey].date,
          longURL: urlDatabase[urlKey].longURL,
          visits: urlDatabase[urlKey].visits,
          uniqueVisits: urlDatabase[urlKey].uniqueVisits
        };

        res.render("urls_show", templateVars);
      }
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  const urlKey = req.params.shortURL;

  if (urlDatabase[urlKey]) {
    const longURL = urlDatabase[urlKey].longURL;
    console.log(req.session.visited);

    if (!req.session.visited) {
      if (req.session.userID) {
        req.session.visited = req.session.userID;
      } else {
        req.session.visited = generateRandomString();
      }
      urlDatabase[urlKey].uniqueVisits += 1;
    }
    console.log(req.session.visited);
    urlDatabase[urlKey].visits.push({ date: new Date(), visitorID: req.session.visited });

    res.redirect(longURL);
  } else {
    errorResponse(res, 404, 'error');
  }
});

//Catch all paths not matches by other routes and render 404 error
app.use(function(req, res) {
  errorResponse(res, 404, 'error');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
