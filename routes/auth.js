// google auth
const express = require('express');
const passport = require('passport');
const routes = express.Router();
const auth = require ('../controllers/auth.js')
const CircularJSON = require('circular-json');

// Custom route for handling authentication failureRedirect
routes.get('/error/401', (req, res) => {
  /* #swagger.security = [{ "bearerAuth": [] }] */
  /* #swagger.summary = "GETS the 401 page for denial of ---(OAUTH AUTHORIZATION)---" */ 
  /* #swagger.description = 'Special page created for UNAUTHORIZED error events to redirect users to.' */ 
  // Render the error page on authentication failure
  res.status(401).render('error/401');
});

routes.post(
  '/login',
  (req, res, next) => {
    console.log('Request body:', req.body);
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
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });

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
    // (req, res, next) => {
    //   console.log('Request body:', req.body);   
    //   next(); // Pass control to the next middleware
    // },
    (req, res, next) => {
      // console.log('FROM GOOGLE CB- Authenticated user:', req.user);  // Check if the user is authenticated
      // console.log('FROM GOOGLE CB- Session set after OAuth:', req.session); // Check if the session is properly set here
      // console.log('FROM GOOGLE CB- Set-Cookie header:', res.get('Set-Cookie')); // Check if the session cookie is in the response headers
      passport.authenticate('google', 
        (err, user, info) => {
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
            return res.redirect('/dashboard');
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
    // (req, res, next) => {
    //   console.log('Request body:', req.body);   
    //   next(); // Pass control to the next middleware
    // },
    (req, res, next) => {
    // res.setHeader('Set-Cookie', 'Cookie: connect.sid=s:QYwC5fTkJrq_m3rVFtc5cysImTWlqq0D.+VaqJWa9whZNxMNyUa1KyrreUnyArTQxVmay01hDfO4; Max-Age=24 * 60 * 60 * 1000; path=/; secure=true;');
    // console.log('FROM GITHUB CB- Authenticated user:', req.user);  // Check if the user is authenticated
    // console.log('FROM GITHUB CB- Session set after OAuth:', req.session); // Check if the session is properly set here
    // console.log('FROM GITHUB CB- Set-Cookie header:', res.get('Set-Cookie')); // Check if the session cookie is in the response headers
    passport.authenticate('github',  
      (err, user, info) => {
        if (err) {
          console.error('Error during authentication:', err);
          return next(err);
        }
        if (!user) {
          // Redirect or render login page with an error message
          return res.redirect('/?error=Invalid credentials');
        }
        // Log in the user
        // req.logIn(user, (loginErr) => {
        //   if (loginErr) {
        //     console.error('Error during login:', loginErr);
        //     return next(loginErr);
        //   }
          console.log('User successfully logged in:', user);
          // Redirect to the desired page after successful login
          return res.redirect('/dashboard');
        });
      })(req, res, next);
    // });
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
