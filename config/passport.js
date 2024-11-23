// google auth 
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { comparePassword } = require('../middleware/password');
const db = require('../models');
const User = db.User;

// Each Passport.js strategy constructor (like LocalStrategy, GoogleStrategy, etc.) has a default name associated with it:
// LocalStrategy → 'local' // GoogleStrategy → 'google' // GitHubStrategy → 'github'
// When you call passport.use, you register a strategy with a specific name. By default, the name 
// of the strategy is inferred from the constructor you are using (LocalStrategy in this case).
module.exports = function (passport) {
  console.log('Initializing Passport LocalStrategy...');

  // Define Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email', // Specify email field for authentication
        passwordField: 'password', // Specify password field
      },
      async (email, password, done) => {
        console.log('LocalStrategy triggered with email:', email);
        try {
          // Find the user by email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
          }

          // Check if the password matches
          const isPasswordValid = await comparePassword(password, user.password);
          if (!isPasswordValid) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          console.log('Authentication successful for user:', user);
          // If authentication is successful, pass the user object
          const wrappedUser = { user }; // Wrap user and accessToken together
          return done(null, wrappedUser);           // Pass wrappedUser to done
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  console.log('LocalStrategy registered.');

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