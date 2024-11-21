// google auth 
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleTokenStrategy = require('passport-google-token').Strategy; // Import google-token
const mongoose = require('mongoose');
const db = require('../models');
const User = db.User;

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,             
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',      
        // passReqToCallback: true, // Allow req to be passed to the verify callback
        failureRedirect: '/dashboard?accessDenied=true', // Redirect with error flag
      },
      async (req, accessToken, refreshToken, profile, done) => {
        console.log("GOOGLE Access Token:", accessToken);

        // const absoluteCallbackURL = `${req.protocol}://${req.get('host')}/auth/google/callback`;
        // console.log("Absolute Callback URL for Google:", absoluteCallbackURL);        
        
        const email = profile.emails && profile.emails[0].value;
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          image: profile.photos[0].value,
          email,  //new for 2     
        }

        // old
        //   let user = await User.findOne({ googleId: profile.id })
        try {
          // Check if the user already exists
          let user = await User.findOne({ email });  //new for 2         
          if (user) {
            // Update existing user with new Google data if necessary
            // user = Object.assign(user, newUser);   //new for 2 
            Object.keys(newUser).forEach((key) => {  //new for 2  
              if (newUser[key]) user[key] = newUser[key];  //new for 2  
            });   //new for 2  
            await user.save();   //new for 2
            user = { user, accessToken };            
            done(null, user);
          } else {
            // Create a new user
            user = await User.create(newUser);
            user = { user, accessToken };          
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);  //new for 2  
        }
      }
    )
  );
  
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/auth/github/callback', // Default callback, to be overridden in the route      
        passReqToCallback: true, // Allow req to be passed to the verify callback
        failureRedirect: '/dashboard?accessDenied=true', // Redirect with error flag
      },      
      async (req, accessToken, refreshToken, profile, done) => {
        console.log("GITHUB Access Token:", accessToken);
        
        console.log("PASSPORT-Session: ", req.session);
         
       
        // const absoluteCallbackURL = `${req.protocol}://${req.get('host')}/auth/github/callback`;
        // console.log("Absolute Callback URL for GitHub:", absoluteCallbackURL);

        const email = profile.emails && profile.emails[0].value;

        // Split displayName into firstName and lastName based on the first space
        let firstName = profile.displayName;
        let lastName = '';

        if (profile.displayName && profile.displayName.includes(' ')) {
          [firstName, ...lastName] = profile.displayName.split(' ');
          lastName = lastName.join(' '); // Join any remaining words as last name
        }

        const newUser = {
          githubId: profile.id,
          displayName: profile.displayName,
          firstName: firstName,
          lastName: lastName || '', // Use an empty string if no last name is found
          image: profile.photos && profile.photos[0].value,
          email,
          bio: profile._json.bio,
          location: profile._json.location,
          company: profile._json.company,
          website: profile._json.blog, 
        }
    
        try {
          // Check if the user already exists
          let user = await User.findOne({ email });  //new for 2         
          if (user) {
            // Update existing user with new GitHub data if necessary
            
            Object.keys(newUser).forEach((key) => {  //new for 2  
              if (newUser[key]) user[key] = newUser[key];  //new for 2  
            });   //new for 2  
            await user.save();   //new for 2 
            user = { user, accessToken };  
            done(null, user);
          } else {
            // Create a new user
            user = await User.create(newUser);
            user = { user, accessToken }; 
            done(null, user);
          }
        } catch (err) {
          console.error(err);
          done(err, null);  //new for 2  
        }
      }
    )
  );

  // from https://www.passportjs.org/tutorials/google/session/ 
  // done was used to replace cb (short fro callback) in the code
 passport.serializeUser(async (wrappedUser, done) => {
    console.log("Deserializing user ID:", id);
    // Save only the user ID and accessToken   
    done(null, { id: wrappedUser.user._id, accessToken: wrappedUser.accessToken });   
  });

  passport.deserializeUser(async (sessionData, done) => {  
    try {
      const user = await User.findById(sessionData.id);
      if (!user) {
        return done(new Error("User not found"));
      }    
      done(null, { user, accessToken: sessionData.accessToken });
    } catch (err) {
      done(err, null);
    }
  });
}