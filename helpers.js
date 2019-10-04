const crypto = require("crypto");

//Generate random string of numbers and letters
const generateRandomString = function() {
  return crypto.randomBytes(3).toString('hex');
};

/**
 * errorResponse - formats response callback depending on the error
 * @param {*} response - response callback function
 * @param {*} statusCode - error code thrown
 * @param {*} renderPage - page to render as a result of the error
 * return: returns the formated callback
 */
const errorResponse = function(response, statusCode, renderPage) {
  let errorMessage = "";

  //Set Error message based on status code sent
  switch (statusCode) {
  case 400:
    errorMessage = "Invalid Email/Password";
    break;
  case 401:
    errorMessage = "You must be logged in to view that";
    break;
  case 403:
    errorMessage = "Access not permitted";
    break;
  case 404:
    errorMessage = "File not found";
    break;
  default:
    errorMessage = "Internal server error";
  }

  return response.status(statusCode).render(renderPage, {status: statusCode, msg: errorMessage});
};

/**
 * getUserByEmail - checks if a given email exists in the database and returns the user ID if it does
 * @param {*} userDatabase - user database
 * @param {*} email - email provided to look for
 * return: returns the userID if found otherwise returns undefined
 */
const getUserByEmail = function(userDatabase, email) {
  const keys = Object.keys(userDatabase);

  return keys.find((key) => {
    return userDatabase[key].email === email;
  });
};

/**
 * urlsForUser - builds an object containing url objects that belong to the given userID
 * @param {*} urlDatabase - url database
 * @param {*} userID - provided user id
 * return: object of url objects owned by userID
 */
const urlsForUser = function(urlDatabase, userID) {
  const urls = {};

  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = {
        longURL: urlDatabase[key].longURL,
        date: urlDatabase[key].date
      };
    }
  }

  return urls;
};

/**
 * doesUrlBelongToUser - checks if a given url (shortURL) belongs to a given user
 * @param {*} urlDatabase - url database
 * @param {*} url - provided url
 * @param {*} userID - provided user id
 * return: true or false based on if the user is the owner of a given url
 */
const doesUrlBelongToUser = function(urlDatabase, url, userID) {
  const usersUrls = urlsForUser(urlDatabase, userID);
  const urlBelongsToUser = Object.keys(usersUrls).includes(url);

  return urlBelongsToUser;
};
/**
 * formatUrl - takes a url and ensures it begins with http:// or https://
 * @param {*} url - provided url
 * return: a properly formatted url
 */
const formatUrl = function(url) {
  const head = 'http';
  const heads = 'https';
  const web = 'www';

  if (!url.includes(head) && !url.includes(heads)) {

    if (!url.includes(web)) {
      url = `${head}://${web}.${url}`;
    } else {
      url = `${head}://${url}`;
    }
  } else {
    if (!url.includes(web)) {
      url.replace('//', '//www.');
    }
  }

  return url;
};


module.exports = { generateRandomString, errorResponse, getUserByEmail, urlsForUser, doesUrlBelongToUser, formatUrl };
