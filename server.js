require('dotenv').config();  // Load environment variables first

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const routes = require('./controllers');
const path = require('path');
const { withAuth } = require('./utils/auth');
const User = require('./models/User');
const app = express();
const PORT = process.env.PORT || 3001;
const Sequelize = require('sequelize');
const mysql = require('mysql2');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

sequelize.options.logging = console.log;

// Set up handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    extend: function (name, context) {
      const partial = hbs.getPartials()[name];
      if (!partial) return '';
      return new hbs.SafeString(partial(context));
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware with SequelizeStore
const sess = {
  secret: process.env.SESSION_SECRET,  // Secure your session secret
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId; 
  next();
});

// Routes
const homeRoutes = require('./controllers/homeRoutes');
const userRoutes = require('./controllers/api/userRoutes');

app.use('/', homeRoutes);
app.use('/api/users', userRoutes);

// Specific route for the /post page to render the 'Upload Your Pet Photo' 
app.get('/post', (req, res) => {
  res.render('post', { title: 'Upload Your Pet Photo' });
});

// Use userRoutes for /post route
app.use('/post', userRoutes);

// Route handler for the dashboard page
app.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Retrieve the user's information from the database using the user ID stored in the session
    const user = await User.findByPk(req.session.userId);

    // Pass the user's information and signupComplete flag to the template
    res.render('dashboard', { title: 'Dashboard', username: user.username });

    // Reset the signupComplete flag for subsequent visits
    req.session.signupComplete = false;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route handler for the login page
app.get('/login', (req, res) => {
  // Assuming you have a 'login' view in your views folder
  res.render('login', { title: 'Login' });
});

// Route handler for the login page
app.get('/signup', (req, res) => {
  // Assuming you have a 'login' view in your views folder
  res.render('signup', { title: 'Sign-Up' });
});

// Route handler for rendering the account settings page
app.get('/account-settings', withAuth, async (req, res) => {
  try {
    // Retrieve the user's information from the database using the user ID stored in the session
    const user = await User.findByPk(req.session.userId);

    // Render the account settings view with the user's information
    res.render('account-settings', { title: 'Account Settings', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

if (process.env.DEBUG) {
  require('debug').enable('app:*');
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
  });
});
