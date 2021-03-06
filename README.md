# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). The app tracks the date links were created/edited, as well as the number of times a link has been used and the number of unique viewers have visited it with a list of all visits on the show-ulr page. There is a coppy button to copy the short url links into the clipboard in addiition to the edit and delete options. If a client clicks on short urls and then signs up for an account they will not count as new unique clicks for links they have previously visited.

## Final Product

!["Screenshot of URLs page"](https://github.com/Smesworld/tinyapp/blob/master/docs/urls-page.png)
!["Screenshot of URLs show page"](https://github.com/Smesworld/tinyapp/blob/master/docs/urls-show-page.png)
!["Screenshot of login error page"](https://github.com/Smesworld/tinyapp/blob/master/docs/error-login-page.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
