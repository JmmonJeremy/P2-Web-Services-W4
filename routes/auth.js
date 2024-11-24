// google auth
const express = require('express');
const passport = require('passport');
const routes = express.Router();
const auth = require ('../controllers/auth.js')
const CircularJSON = require('circular-json');

// Custom route for handling authentication failureRedirect
routes.get('/error/401', (req, res) => {
    /* #swagger.summary = "GETS the 401 page for denial of ---(OAUTH AUTHORIZATION DENIAL PAGE)---" */ 
    /* #swagger.description = 'Special page created for UNAUTHORIZED error events to redirect users to.' */ 
    // Render the error page on authentication failure

  res.status(401).render('error/401');
});

// START **************************** EMAIL & PASSWORD SIGN IN *********************************** START//
routes.post(
  '/login',
    /* #swagger.summary = "Signs a user in ---(AUTH DOORWAY FOR PASSWORD SIGN IN)---" */ 
    /* #swagger.description = 'Special route created for posting the sign-in of new users through a password sign-in.' */ 
    /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Fields to update',
      required: true,
      '@schema': {
        "type": "object",
        "properties": {         
          "email": {
            "type": "string",
            "example": "email@email.com"
          },
          "password": {
            "type": "string",
            "format": "password",
            "example": "password123"
          },
          "repeatPassword": {
            "type": "string",
            "example": "password123"
          }              
        },
        "required": ["email"]
        }
      }
    */
  (req, res, next) => {
    console.log('Email Sign-in Request body:', req.body);
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send('Missing credentials');
    }
    next(); // Pass control to the next middleware
  }, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Error during authentication:', err);
        return next(err);
      }
      if (!user) {
        // Redirect or render login page with an error message
        return res.redirect('/?error=Invalid credentials');
      }
      // Log in the user
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Error during login:', loginErr);
          return next(loginErr);
        }
        // console.log('User successfully logged in:', user);
        // Redirect to the desired page after successful login
        return res.status(200).redirect('/dashboard');
      });
    })(req, res, next);
  });
// END **************************** EMAIL & PASSWORD SIGN IN *********************************** END//

// START ******************************** GOOGLE OAUTH *********************************** START//
// @desc    Auth with Google
// @route   GET /auth/google - from "Authenticate Requests" section
// in https://www.passportjs.org/packages/passport-google-oauth20/
routes.get(
  // #swagger.ignore = true
  // don't send to swagger docs it is not funtional by itself
  '/google', passport.authenticate('google', { scope: ['profile', 'email'] })); // added 'email'

// @desc    Google auth callback
// @route   GET /auth/google/callback
routes.get(
  // #swagger.ignore = true
  // don't send to swagger docs it is not funtional by itself
  '/google/callback', auth.checkGoogleCode, 
    // // show what is in the request body for authentication
    // (req, res, next) => {
    // console.log('Google Request body:', req.body);  // this is empty here
    //   next(); // Pass control to the next middleware
    // },
    (req, res, next) => {
      // console.log('FROM GOOGLE CB- Authenticated user:', req.user);  // Check if the user is authenticated
      // console.log('FROM GOOGLE CB- Session set after OAuth:', req.session); // Check if the session is properly set here
      // console.log('FROM GOOGLE CB- Set-Cookie header:', res.get('Set-Cookie')); // Check if the session cookie is in the response headers
      passport.authenticate('google', 
        (err, user, info) => {
          // console.log('Google Request body:', req.body);  // this is empty here
          if (err) {
            console.error('Error during authentication:', err);
            return next(err);
          }
          if (!user) {
            // Redirect or render login page with an error message
            return res.redirect('/?error=Invalid credentials');
          }
// !!!!!!!!!!!!!!!!!!!! Log in the user (This was the code fix for OAuth to work in production)
// req.logIn (or its alias req.login) is a Passport.js function. It is added to the req object by Passport.js middleware and is
// used to establish a login session for a user after successful authentication. It is typically used in custom authentication flows 
// where you handle authentication manually instead of relying entirely on Passport's built-in passport.authenticate middleware.
// This allows you to be able to handle login errors in a more controlled way instead of letting Passport handle them automatically.          
          req.logIn(user, (loginErr) => {
            if (loginErr) {
              console.error('Error during login:', loginErr);
              return next(loginErr);
            }
            // console.log('Google Request body:', req.body);   // this is empty here
            // console.log('User successfully logged in:', user);
            // Redirect to the desired page after successful login
            return res.status(200).redirect('/dashboard');
          });
        })(req, res, next);
      });
//     { failureRedirect: '/' });
//     res.status(200).redirect('/dashboard');
//   }
// );
// END ********************************** GOOGLE OAUTH *********************************** END//

// START ******************************** GITHUB OAUTH *********************************** START//
// @desc    Auth with GitHub
// @route   GET /auth/github - from "Authenticate Requests" section
// in https://www.passportjs.org/packages/passport-github2/
routes.get(
  // #swagger.ignore = true
  // don't send to swagger docs it is not funtional by itself
  '/github', passport.authenticate('github', { scope: ['user:email'] }));

// @desc    GitHub auth callback
// @route   GET /auth/github/callback
routes.get(
  // #swagger.ignore = true
  // don't send to swagger docs it is not funtional by itself
  '/github/callback', auth.checkGithubCode, 
    // // show what is in the request body for authentication
    // (req, res, next) => {
    //   console.log('GitHub Request body:', req.body);  // this is empty here
    //   next(); // Pass control to the next middleware
    // },
    (req, res, next) => {
    // res.setHeader('Set-Cookie', 'Cookie: connect.sid=s:QYwC5fTkJrq_m3rVFtc5cysImTWlqq0D.+VaqJWa9whZNxMNyUa1KyrreUnyArTQxVmay01hDfO4; Max-Age=24 * 60 * 60 * 1000; path=/; secure=true;');
    // console.log('FROM GITHUB CB- Authenticated user:', req.user);  // Check if the user is authenticated
    // console.log('FROM GITHUB CB- Session set after OAuth:', req.session); // Check if the session is properly set here
    // console.log('FROM GITHUB CB- Set-Cookie header:', res.get('Set-Cookie')); // Check if the session cookie is in the response headers
    passport.authenticate('github',  
      (err, user, info) => {
        //   console.log('GitHub Request body:', req.body);  // this is empty here
        if (err) {
          console.error('Error during authentication:', err);
          return next(err);
        }
        if (!user) {
          // Redirect or render login page with an error message
          return res.redirect('/?error=Invalid credentials');
        }
// !!!!!!!!!!!!!!!!!!!! Log in the user (This was the code fix for OAuth to work in production)
// req.logIn (or its alias req.login) is a Passport.js function. It is added to the req object by Passport.js middleware and is
// used to establish a login session for a user after successful authentication. It is typically used in custom authentication flows 
// where you handle authentication manually instead of relying entirely on Passport's built-in passport.authenticate middleware.
// This allows you to be able to handle login errors in a more controlled way instead of letting Passport handle them automatically.
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error('Error during login:', loginErr);
            return next(loginErr);
          }
          // console.log('GitHub Request body:', req.body);  // this is empty here 
          // console.log('User successfully logged in:', user);
          // Redirect to the desired page after successful login
          return res.status(200).redirect('/dashboard');
        });
      })(req, res, next);
    });
//     { failureRedirect: '../error/401' }); 
//     // console.log("res.query: " + CircularJSON.stringify(res, null, 2));
//     res.status(200).redirect('/dashboard');
//   }
// );
// END ******************************** GITHUB OAUTH *********************************** END//

// @desc    Logout user
// @route   /auth/logout
routes.get('/logout', auth.logOut);

module.exports = routes
