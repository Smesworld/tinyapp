const emailLookup = function(database, email) {
  const keys = Object.keys(database);

  return keys.find((key) => {
    return database[key].email === email;
  });
};

module.exports = { emailLookup };