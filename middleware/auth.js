const passport = require('passport');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const CircularJSON = require('circular-json');

module.exports = {
  ensureAuth: function (req, res, next) {
    // console.log("res.query: " + CircularJSON.stringify(res, null, 2));
    // console.log("req.query:", req.query); 
    console.log("Cookie: connect.sid=" + req.cookies['connect.sid']); //cookie-parser in index.js prevents Google crash
    // console.log("Authorization: " + req.headers['authorization']); //works only for GitHub
    console.log("Authorization: Bearer " + req.accessToken);
    // console.log("res.locals:", res.locals); 
    // Check if `req.user` exists before accessing `id`
    if (req.user) {
      console.log(`Authenticated user: ${req.user.id} |-> ${req.user.displayName}`);
    } else {
      console.log("User not found in session");
    }  
    if (req.isAuthenticated()) {     
      return next();
    } else {
      console.log("AUTHENTICATION FAILED in ensureAuth function & redirected to 401 Unauthorized Page");
      res.status(401).render('login', { 
        accessDenied: true,
        layout: 'login'  // Specifies the layout to use
       });     
    }
  },

  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.status(200).redirect('/dashboard');
    }
  },
};