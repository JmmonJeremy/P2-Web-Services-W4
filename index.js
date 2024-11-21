const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); // Generated by swagger-autogen
// const dotenv = require('dotenv'); // This is necessary to use the config.env file instead of .env file
const morgan = require('morgan'); // google auth 
// const exphbs = require('express-handlebars'); // google auth (for versions below v6)
// const path = require('path'); // google auth 
const passport = require('passport'); // google auth 
const session = require('express-session'); // google auth
const { engine } = require('express-handlebars'); // google auth (for versions v6 on) 
const MongoStore = require('connect-mongo'); // google auth 
const methodOverride = require('method-override'); // google auth 
const cookieParser = require('cookie-parser'); // to get REQUIRED cookie for routes.rest requiests
const connectDB = require('./config/db'); // google auth database add-on


const app = express();

// Set trust proxy
app.set('trust proxy', 1); // Trust the first proxy (required for Render's setup)

// Log the X-Forwarded-Proto header and protocol
// app.use((req, res, next) => {
//   console.log('X-Forwarded-Proto:', req.headers['x-forwarded-proto']);
//   console.log('Protocol:', req.protocol); // Should output 'https' if correctly forwarded
//   next();
// });

const options = {
  swaggerOptions: {
    operationsSorter: (a, b) => {
      // Get the path and method
      const pathA = a.get('path');
      const pathB = b.get('path');
      const methodA = a.get('method');
      const methodB = b.get('method');
    
      // Extract the first segment after the '/'
      const groupA = pathA.split('/')[1]?.toLowerCase() || ''; // Default to '' if no segment
      const groupB = pathB.split('/')[1]?.toLowerCase() || ''; // Default to '' if no segment
    
      // Prioritize 'ap' above everything else
      if (groupA.startsWith('ap') && !groupB.startsWith('ap')) return -1;
      if (!groupA.startsWith('ap') && groupB.startsWith('ap')) return 1;
    
      // Prioritize 'd' above 'c' group
      if (groupA.startsWith('d') && !groupB.startsWith('d') && groupB.startsWith('c')) return -1;
      if (!groupA.startsWith('d') && groupB.startsWith('d') && groupA.startsWith('c')) return 1;
    
      // Default sorting by group
      if (groupA < groupB) return -1;
      if (groupA > groupB) return 1;
    
      // Prioritize creationGoal paths that contain 'user', 'search', 'edit', or 'add'
      const creationGoalsKeywords = ['user', 'search', 'edit', 'add'];
      const isCreationGoalsA = pathA.includes('/creationGoals') && creationGoalsKeywords.some(keyword => pathA.includes(keyword));
      const isCreationGoalsB = pathB.includes('/creationGoals') && creationGoalsKeywords.some(keyword => pathB.includes(keyword));
    
      // Prioritize 'search' routes to the top of the /creationGoals GET collection
      if (pathA.includes('/creationGoals/search') && !pathB.includes('/creationGoals/search')) return -1;
      if (!pathA.includes('/creationGoals/search') && pathB.includes('/creationGoals/search')) return 1;
    
      // If one of the paths has a 'user', 'edit', or 'add', prioritize it over the default creationGoal route
      if (isCreationGoalsA && !isCreationGoalsB) return -1;
      if (!isCreationGoalsA && isCreationGoalsB) return 1;
    
      // Sort by method order (GET, POST, PUT, DELETE)
      const methodOrder = ['get', 'post', 'put', 'delete'];
      return methodOrder.indexOf(methodA) - methodOrder.indexOf(methodB);
    } 
  },
};

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser());

// Enforce HTTPS in production
// if (process.env.NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect(`https://${req.headers.host}${req.url}`);
//     }
//     next();
//   });
// }

// Method override from: https://www.npmjs.com/package/method-override
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    let method = req.body._method
    delete req.body._method
    return method
  }
}))

// google auth 
// Load config ***This is necessary to use the config.env file instead of .env file
// dotenv.config({path: './config/config.env'});
// Passport config - passport at end is passed to config/passport.js function
require('./config/passport')(passport)
connectDB(); // google auth database add-on database connection

// google auth   (Order #1)(OLD ORDER #8) *Session Middleware (Before Authentication)
// Changing order of Sessions & Passport middleware up to top here fixed not being found
// Sessions middleware code from: https://www.npmjs.com/package/express-session 
// Sessions middleware
// console.log('Initializing session middleware...');
app.use(session({
  secret: 'victory-planner',
  resave: false,
  saveUninitialized: false,
  // from https://www.npmjs.com/package/connect-mongo
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {   
    secure: process.env.NODE_ENV === 'production', // Ensure cookies are only sent over HTTPS in production
    httpOnly: true,  // Prevents access to the cookie via JavaScript (XSS protection)
    // sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000 // 1 day (adjust if needed)
  } 
}));

// google auth   (Order #2)(OLD ORDER #9) *Passport Middleware (After Session Middleware)
// Passport middleware
// console.log('Initializing Passport middleware...');
app.use(passport.initialize());
app.use(passport.session());
console.log("INDEX-Session: "+ req.session);
// Middleware to save accessToken to session
app.use((req, res, next) => {
  if (req.user) {
    req.accessToken = req.user.accessToken;
    req.user = req.user.user; // redefine req.user to only contain the user object
    console.log("INDEX-Session: "+ req.session);
  }
  next();
});

// google auth
// Logging       (Order #3)(OLD ORDER #6)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// google auth
// Set global variable
app.use(function(req, res, next) {  
  res.locals.user = req.user || null; //used for editIcon function
  res.locals.req = req; // Make `req` accessible in all Handlebars templates
  next();
})

// google auth
// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select, getMonth, getDay, getYear, goBack, log } = require('./helpers/hbs');

// google auth
// Handlebars    (Order #4)(OLD ORDER #7)
// app.engine('.hbs', exphbs({defaultLayout: 'main', extname: '.hbs'})); // google auth (for versions below v6)
app.engine('.hbs', engine({ helpers: { formatDate, stripTags, truncate, editIcon, select, getMonth, getDay, getYear, goBack, log }, defaultLayout: 'main', extname: '.hbs' }));  // google auth (for versions v6 on)
app.set('view engine', '.hbs');

// CORS setup    (Order #5)(OLD ORDER #2)
app.use(cors({
  origin: 'https://p2-web-services-w4.onrender.com', 
  credentials: true // Allow cookies to be sent
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger setup (Order #6)(OLD ORDER #1)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options, ));

// Define your routes         (Order #7)(OLD ORDER #3)
app.use('/', require('./routes'));  // google auth - uses ./routes/index
// .use('/auth', require('./routes/auth'));  // google auth - did this in the routes/index.js file

// Global error handler
app.use((err, req, res, next) => {
  console.error("Passport authentication error:", err);

  // Redirect to the custom 401 error page
  res.render('error/401');
});

// Catch uncaught exceptions  (Order #8)(OLD ORDER #4)
process.on('uncaughtException', (err, origin) => {
  console.log(`Caught exception: ${err}\nException origin: ${origin}`);
});

// Orignal connection to mongoose database (Not Included, but I put at Order #9)(OLD ORDER #5)
const db = require('./models');
db.mongoose
  .connect(db.url, {
    // useNewUrlParser: true, (deprecated option - no longer needed)
    // useUnifiedTopology: true, (deprecated option - no longer needed)
  })
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

app.use((req, res, next) => {
  console.log("NODE_ENV:" +process.env.NODE_ENV);
  console.log("LOGGING SESSION FROM INDEX.JS:", req.session);
  next();
});

// Start the server (Order #10)(OLD ORDER #10)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}.`);
});
