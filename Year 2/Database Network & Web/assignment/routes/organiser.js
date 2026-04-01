// Organiser Router

const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Multer setup for event poster image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'event-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Only allow access to organiser routes if logged in
function requireLogin(req, res, next) {
  if (!req.session.organiserId && req.path !== '/login') {
    return res.redirect('/organiser/login');
  }
  next();
}
router.use(requireLogin);

// ========== LOGIN & LOGOUT ==========

// Show organiser login form
router.get('/login', (req, res) => {
  res.render('organiser-login', { error: null });
});

// Check username and password
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  global.db.get('SELECT * FROM organisers WHERE username = ?', [username], (err, user) => {
    if (err) return res.render('organiser-login', { error: "Database error." });
    if (!user) return res.render('organiser-login', { error: "Invalid username or password." });

    bcrypt.compare(password, user.password_hash, (err, valid) => {
      if (valid) {
        req.session.organiserId = user.organiser_id;
        res.redirect('/organiser');
      } else {
        res.render('organiser-login', { error: "Invalid username or password." });
      }
    });
  });
});

// Handle organiser logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ========== EVENTS MANAGEMENT ==========

// Organiser dashboard: list all events
router.get("/", (req, res, next) => {
  const siteQuery = `SELECT * FROM sites WHERE site_id = 1`;
  const eventsQuery = `SELECT * FROM events ORDER BY event_created_date DESC`;
  const ticketsQuery = `SELECT * FROM tickets`;

  global.db.get(siteQuery, function(err, site) {
    if (err) return next(err);
    global.db.all(eventsQuery, function(err, events) {
      if (err) return next(err);
      global.db.all(ticketsQuery, function(err, tickets) {
        if (err) return next(err);
        events.forEach(event => {
          event.tickets = tickets.filter(ticket => Number(ticket.event_id) === Number(event.event_id));
        });
        res.render("organiser", { site, allEvents: events });
      });
    });
  });
});

// Publish an event
router.post("/events/action/publish", (req, res, next) => {
  const eventId = req.body.selectedEvent;
  if (!eventId) return res.redirect("/organiser");
  const query = `UPDATE events SET published_date = CURRENT_TIMESTAMP WHERE event_id = ?`;
  global.db.run(query, [eventId], function(err) {
    if (err) return next(err);
    res.redirect("/organiser");
  });
});

// Delete an event
router.post("/events/action/delete", (req, res, next) => {
  const eventId = req.body.selectedEvent;
  if (!eventId) return res.redirect("/organiser");
  global.db.run(`DELETE FROM tickets WHERE event_id = ?`, [eventId], function(err) {
    if (err) return next(err);
    global.db.run(`DELETE FROM events WHERE event_id = ?`, [eventId], function(err2) {
      if (err2) return next(err2);
      res.redirect("/organiser");
    });
  });
});

// Go to event edit settings page
router.get("/events/action/edit", (req, res) => {
  const eventId = req.query.selectedEvent;
  if (!eventId) return res.redirect("/organiser");
  res.redirect(`/organiser/events/${eventId}/event-settings`);
});

// Show form to create a new event
router.get('/events/new', (req, res) => {
  res.render('event-new');
});

// Handle creation of a new event with ticket types and poster upload
router.post('/events/new', upload.single('event_poster'), (req, res, next) => {
  const { event_title, event_description, event_date } = req.body;
  let ticket_types = req.body.ticket_type;
  let ticket_prices = req.body.ticket_price_cents;
  let ticket_quantities = req.body.ticket_quantity_total;
  let posterFile = req.file ? req.file.filename : null;

  // Ensure all ticket values are arrays
  if (typeof ticket_types === "string") ticket_types = [ticket_types];
  if (typeof ticket_prices === "string") ticket_prices = [ticket_prices];
  if (typeof ticket_quantities === "string") ticket_quantities = [ticket_quantities];

  const eventQuery = `
      INSERT INTO events (event_title, event_description, event_date, event_poster_url)
      VALUES (?, ?, ?, ?)
  `;
  const eventParams = [event_title, event_description, event_date, posterFile];

  global.db.run(eventQuery, eventParams, function(err) {
    if (err) return next(err);
    const eventId = this.lastID;
    // Insert tickets
    if (ticket_types && ticket_types.length > 0 && ticket_types[0].trim() !== "") {
      const ticketQuery = `
          INSERT INTO tickets (event_id, ticket_type, ticket_price_cents, ticket_quantity_total)
          VALUES (?, ?, ?, ?)
      `;
      const ticketInserts = ticket_types.map((type, i) => {
        return new Promise((resolve, reject) => {
          global.db.run(ticketQuery, [
            eventId,
            type,
            ticket_prices[i],
            ticket_quantities[i]
          ], function(ticketErr) {
            if (ticketErr) reject(ticketErr);
            else resolve();
          });
        });
      });
      Promise.all(ticketInserts)
        .then(() => res.redirect('/organiser'))
        .catch(next);
    } else {
      res.redirect('/organiser');
    }
  });
});

// Show event settings and manage tickets
router.get("/events/:id/event-settings", (req, res, next) => {
  const eventQuery = `SELECT * FROM events WHERE event_id = ?`;
  const ticketsQuery = `SELECT * FROM tickets WHERE event_id = ?`;
  global.db.get(eventQuery, [req.params.id], function(err, event) {
    if (err) return next(err);
    global.db.all(ticketsQuery, [req.params.id], function(err, tickets) {
      if (err) return next(err);
      res.render("event-settings", { event, tickets });
    });
  });
});

// Handle editing event
router.post("/events/:id/edit", upload.single('event_poster'), (req, res, next) => {
  // Use uploaded file if present, otherwise keep the existing one
  let posterFile = req.file ? req.file.filename : req.body.existing_poster_url || null;
  const query = `
      UPDATE events
      SET event_title       = ?,
          event_description = ?,
          event_date        = ?,
          event_poster_url  = ?
      WHERE event_id = ?
  `;
  const params = [
    req.body.event_title,
    req.body.event_description,
    req.body.event_date,
    posterFile,
    req.params.id
  ];

  global.db.run(query, params, function(err) {
    if (err) return next(err);
    res.redirect("/organiser");
  });
});

// ========== TICKET MANAGEMENT ==========

// Add a new ticket type to an event
router.post("/events/:id/tickets/add", (req, res, next) => {
  const query = `
      INSERT INTO tickets (event_id, ticket_type, ticket_price_cents, ticket_quantity_total)
      VALUES (?, ?, ?, ?)
  `;
  const params = [
    req.params.id,
    req.body.ticket_type,
    req.body.ticket_price_cents,
    req.body.ticket_quantity_total
  ];
  global.db.run(query, params, function(err) {
    if (err) return next(err);
    res.redirect(`/organiser/events/${req.params.id}/event-settings`);
  });
});

// Delete a ticket type from an event
router.post("/events/:eventId/tickets/:ticketId/delete", (req, res, next) => {
  const query = `DELETE FROM tickets WHERE ticket_id = ?`;
  global.db.run(query, [req.params.ticketId], function(err) {
    if (err) return next(err);
    res.redirect(`/organiser/events/${req.params.eventId}/event-settings`);
  });
});

// Edit an existing ticket type
router.get("/events/:eventId/tickets/:ticketId/edit", (req, res, next) => {
  const eventQuery = `SELECT * FROM events WHERE event_id = ?`;
  const ticketQuery = `SELECT * FROM tickets WHERE ticket_id = ?`;
  global.db.get(eventQuery, [req.params.eventId], function(err, event) {
    if (err) return next(err);
    global.db.get(ticketQuery, [req.params.ticketId], function(err, ticket) {
      if (err) return next(err);
      res.render("ticket-edit", { event, ticket });
    });
  });
});

// Handle ticket edit form submission
router.post("/events/:eventId/tickets/:ticketId/edit", (req, res, next) => {
  const query = `
      UPDATE tickets
      SET ticket_type = ?,
          ticket_price_cents = ?,
          ticket_quantity_total = ?
      WHERE ticket_id = ?
  `;
  const params = [
    req.body.ticket_type,
    req.body.ticket_price_cents,
    req.body.ticket_quantity_total,
    req.params.ticketId
  ];
  global.db.run(query, params, function(err) {
    if (err) return next(err);
    res.redirect(`/organiser/events/${req.params.eventId}/event-settings`);
  });
});

// ========== SITE SETTINGS ==========

// Show site settings form
router.get("/settings", (req, res, next) => {
  const query = `SELECT * FROM sites WHERE site_id = 1`;
  global.db.get(query, function(err, site) {
    if (err) return next(err);
    res.render("site-settings", { site });
  });
});

// Save changes to site settings (name, description)
router.post("/settings", (req, res, next) => {
  const query = `
      UPDATE sites
      SET site_name = ?, site_description = ?
      WHERE site_id = 1
  `;
  const params = [req.body.site_name, req.body.site_description];
  global.db.run(query, params, function(err) {
    if (err) return next(err);
    res.redirect("/organiser");
  });
});

module.exports = router;
