// Attendee Router

const express = require('express');
const router = express.Router();

// --------- Attende Page ---------

// Show all published events + site info
router.get('/', (req, res, next) => {
  const siteQuery = `SELECT * FROM sites WHERE site_id = 1`;
  const eventsQuery = `
    SELECT * FROM events
    WHERE published_date IS NOT NULL
    ORDER BY event_date ASC
  `;
  global.db.get(siteQuery, [], (err, site) => {
    if (err) return next(err);
    global.db.all(eventsQuery, [], (err2, events) => {
      if (err2) return next(err2);
      res.render('attendee', { site, events });
    });
  });
});

// --------- Event Details & Booking ---------

// Show individual event page with tickets
router.get('/:id', (req, res, next) => {
  const eventId = req.params.id;
  const siteQuery = `SELECT * FROM sites WHERE site_id = 1`;
  const eventQuery = `SELECT * FROM events WHERE event_id = ?`;
  const ticketsQuery = `SELECT * FROM tickets WHERE event_id = ?`;

  global.db.get(siteQuery, [], (err, site) => {
    if (err) return next(err);
    global.db.get(eventQuery, [eventId], (err2, event) => {
      if (err2) return next(err2);
      if (!event) return res.status(404).send("Event not found.");
      global.db.all(ticketsQuery, [eventId], (err3, tickets) => {
        if (err3) return next(err3);
        res.render('attendee-event', {
          site,
          event,
          tickets,
          query: req.query
        });
      });
    });
  });
});

// Handle ticket booking form POST
router.post('/:id/book', (req, res, next) => {
  const eventId = req.params.id;
  const { ticket_id, quantity, attendee_name } = req.body;
  // Check if requested ticket exists and has enough left
  global.db.get(
    `SELECT * FROM tickets WHERE ticket_id = ? AND event_id = ?`,
    [ticket_id, eventId],
    (err, ticket) => {
      if (err) return next(err);
      if (!ticket) return res.redirect(`/attendee/${eventId}?error=invalid`);
      const available = ticket.ticket_quantity_total - (ticket.ticket_quantity_sold || 0);
      if (quantity > available) {
        // Redirect with error for JS popup
        return res.redirect(`/attendee/${eventId}?error=overbook`);
      }
      // Add to bookings table, increment sold count
      global.db.run(
        `INSERT INTO bookings (event_id, ticket_id, attendee_name, booking_quantity)
         VALUES (?, ?, ?, ?)`,
        [eventId, ticket_id, attendee_name, quantity],
        function(err2) {
          if (err2) return next(err2);
          // Update sold count
          global.db.run(
            `UPDATE tickets SET ticket_quantity_sold = ticket_quantity_sold + ?
             WHERE ticket_id = ?`,
            [quantity, ticket_id],
            function(err3) {
              if (err3) return next(err3);
              res.redirect(`/attendee/${eventId}`);
            }
          );
        }
      );
    }
  );
});

module.exports = router;
