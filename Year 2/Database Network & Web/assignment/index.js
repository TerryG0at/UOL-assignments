// ==========================
// CM2040 Event App - Main Server
// ==========================

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Create or open database
global.db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Database connected');
});

// Initialize schema if DB file was just created
if (!fs.existsSync('./database.db')) {
  const schema = fs.readFileSync('./db_schema.sql', 'utf8');
  global.db.exec(schema, (err) => {
    if (err) console.error('Error creating tables:', err.message);
    else console.log('Database schema initialized');
  });
}

// Set up session for organiser authentication
app.use(session({
  secret: 'iamgood',
  resave: false,
  saveUninitialized: false
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Organiser routes
const organiserRouter = require('./routes/organiser');
app.use('/organiser', organiserRouter);

// Attendee routes
const attendeeRouter = require('./routes/attendee');
app.use('/attendee', attendeeRouter);

// Index page
app.get('/', (req, res) => {
  res.render('index');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err);
  res.status(500).render('error', { error: err });
});

// Init
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
