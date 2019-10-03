const crypto = require("crypto");

const generateRandomString = function() {
  return crypto.randomBytes(3).toString('hex');
};

const errorResponse = function(response, statusCode, renderPage) {
  let errorMessage = "";

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
      errorMessage = "Internal server error"
  }

  return response.status(statusCode).render(renderPage, {status: statusCode, msg: errorMessage});
}

const getUserByEmail = function(database, email) {
  const keys = Object.keys(database);

  return keys.find((key) => {
    return database[key].email === email;
  });
};

const doesUserExist = function(database, userID) {
  const keys = Object.keys(database);

  if (keys.includes(userID)) {
    console.log("dun wana be here");
    return userID;
  }
  
  return false;
};

const urlsForUser = function(database, id) {
  const urls = {};
  const keys = Object.keys(database);

  console.log('urls');
  for (const key in database) {
    console.log(key);
    console.log(database[key].userID, id);
    if (database[key].userID === id) {
      urls[key] = database[key].longURL;
    }
  }

  return urls;
};

module.exports = { generateRandomString, errorResponse, getUserByEmail, doesUserExist, urlsForUser };
