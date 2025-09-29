const express = require('express');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('./generated/prisma');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');

// Debug logging
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('EXTERNAL_DATABASE_URL:', process.env.EXTERNAL_DATABASE_URL ? 'SET' : 'NOT SET');

// Override DATABASE_URL if EXTERNAL_DATABASE_URL is provided
if (process.env.EXTERNAL_DATABASE_URL) {
  console.log('Overriding DATABASE_URL with external URL');
  process.env.DATABASE_URL = process.env.EXTERNAL_DATABASE_URL;
  console.log('Using external database URL');
} else {
  console.log('EXTERNAL_DATABASE_URL not found, using default DATABASE_URL');
}

// Check for required environment variables (after override)
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const app = express();
const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration with Prisma store
app.use(session({
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,  // Check for expired sessions every 2 minutes
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages middleware (must come after session)
app.use(flash());

// Configure passport strategies AFTER passport is initialized
require('./src/config/passport')(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

// Make user and flash messages available in all templates
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

// Routes
app.use('/', require('./src/routes/index'));
app.use('/auth', require('./src/routes/auth'));
app.use('/folders', require('./src/routes/folders'));
app.use('/files', require('./src/routes/files'));


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

