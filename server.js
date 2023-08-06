require('dotenv').config();  // Load environment variables first

// External Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const Sequelize = require('sequelize');

// Internal Dependencies
const { withAuth } = require('./utils/auth');
const User = require('./models/User');
const homeRoutes = require('./controllers/homeRoutes');
const userRoutes = require('./controllers/api/userRoutes');

// Configuration and Constants
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const PORT = process.env.PORT || 3001;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql'
});

// Express and Middleware Initialization
const app = express();

// Handlebars setup
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    extend(name, context) {
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

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
const sess = {
  secret: process.env.SESSION_SECRET,  
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({ db: sequelize })
};

app.use(session(sess));
app.use((req, res, next) => {
  res.locals.isAuthenticated = !!req.session.userId; 
  next();
});

// Routes
app.use('/', homeRoutes);
app.use('/api/users', userRoutes);
app.get('/post', (req, res) => {
  res.render('post', { title: 'Upload Your Pet Photo' });
});
app.get('/dashboard', withAuth, /* ... rest of the handler ... */);
app.get('/login', /* ... handler ... */);
app.get('/signup', /* ... handler ... */);
app.get('/account-settings', withAuth, /* ... handler ... */);

if (process.env.DEBUG) {
  require('debug').enable('app:*');
}

// Starting the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  sequelize.sync({ force: false }); 
});
