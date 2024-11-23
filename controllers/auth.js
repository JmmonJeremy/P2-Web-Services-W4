const CircularJSON = require('circular-json');
// METHODS ASSOCIATED WITH OAUTH

// check google code - success leading to dashboard
exports.checkGoogleCode = (req, res, next) => { //haven't tested error code on Google
  // console.log("req.query: " + JSON.stringify(req.query, null, 2));
  // req.query.code = 'invalidated_code';
  // console.log("req.query changed to: " + JSON.stringify(req.query, null, 2));
  const authorizationCode = req.query.code;
  // console.log("Auth-Session: ", req.session);
  if (authorizationCode) {
    // console.log("REQ Object: " + CircularJSON.stringify(req))
    // console.log("Google conCB- Cookie: connect.sid=" + req.cookies['connect.sid']);
    console.log("Google (controller/auth)- Authorization Code:", authorizationCode);
    // You could save this to the session or use it to fetch the access token
  } else {
    console.log("No authorization code found.");
  }
  next();
};

// check github code - success leading to dashboard
exports.checkGithubCode = (req, res, next) => { 
  // console.log("req.query: " + JSON.stringify(req.query, null, 2));
  // req.query.code = 'invalidated_code';
  // console.log("req.query changed to: " + JSON.stringify(req.query, null, 2));
  const authorizationCode = req.query.code;
  
  if (authorizationCode) {
    // console.log("REQ Object: " + CircularJSON.stringify(req))
    // console.log("GitHub conCB- A Cookie: connect.sid=" + req.cookies['connect.sid']);
    console.log("GitHub (controller/auth)- Authorization Code:", authorizationCode);
    // You could save this to the session or use it to fetch the access token
  } else {
    console.log("No authorization code found.");
  }
  next();
};

// logout & destroy session records - leading to login page
exports.logOut = (req, res, next) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.summary = "DELETES ---(OAUTH AUTHORIZATION)--- for the user" */ 
  /* #swagger.description = 'After DELETING AUTHORIZATION of the user it returns a success code and redirects the user to the LOGIN PAGE.' */
  // #swagger.responses[200] = { description: 'SUCCESS, the OAUTH AUTORIZATION was DELETED' } 
  req.logout((error) => { //clears the session on your app’s side
    if (error) { return next(error); }
    req.session.destroy((err) => { //completely remove the session data
      if (err) { return next(err); }
      res.status(200).redirect('/');
    });
  });
};