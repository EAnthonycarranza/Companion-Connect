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
const sequelize = require('./config/connection');  // Make sure to provide the correct path to connection.js.
const PetPhoto = require('./models/PetPhoto');
const multer = require('multer');
const uuid = require('uuid');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create a unique filename using the original extension
    const ext = path.extname(file.originalname);
    const filename = `${uuid.v4()}${ext}`;
    cb(null, filename)
  }
});

const upload = multer({ storage: storage });
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/post', userRoutes);

// Specific route for the /post page to render the 'Upload Your Pet Photo' 
app.get('/post', (req, res) => {
  res.render('post', { title: 'Upload Your Pet Photo' });
});

// Route handler for the dashboard page
app.get('/dashboard', withAuth, async (req, res) => {
  try {
    // Retrieve the user's information from the database using the user ID stored in the session
    const user = await User.findByPk(req.session.userId);

    // Fetch the pet photos associated with this user
    const petPhotos = await PetPhoto.findAll({ where: { user_id: req.session.userId } });

    // Pass the user's information, pet photos, and signupComplete flag to the template
    res.render('dashboard', { title: 'Dashboard', username: user.username, petPhotos });

    // Reset the signupComplete flag for subsequent visits
    req.session.signupComplete = false;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/upload', upload.single('petPhoto'), async (req, res, next) => {
  try {
    await PetPhoto.create({
      image_url: `/uploads/${req.file.filename}`,
      user_id: req.session.userId
    });
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}, (error, req, res, next) => {
  // This is error handling middleware specific to this route
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    // When a Multer error occurs due to file size limit
    res.status(400).send({ error: 'File size should be less than 1MB' });
  } else if (error) {
    res.status(400).send({ error: error.message });
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
