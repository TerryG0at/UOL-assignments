PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Site
CREATE TABLE IF NOT EXISTS sites (
  site_id INTEGER PRIMARY KEY CHECK (site_id = 1),
  site_name TEXT NOT NULL,
  site_description TEXT NOT NULL
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_title TEXT NOT NULL,
  event_description TEXT NOT NULL,
  event_date TEXT NOT NULL,                       
  event_created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_date TEXT,
  event_poster_url TEXT                              
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  ticket_type TEXT NOT NULL,                      
  ticket_price_cents INTEGER NOT NULL,            
  ticket_quantity_total INTEGER NOT NULL,
  ticket_quantity_sold INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

-- Bookings/Attendee interaction
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  ticket_id INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  booking_quantity INTEGER NOT NULL CHECK (booking_quantity > 0),
  booked_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id)  REFERENCES events(event_id)  ON DELETE CASCADE,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE RESTRICT
);

-- Organiser account/ Authentication
CREATE TABLE IF NOT EXISTS organisers (
  organiser_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT
);

-- Dummy Site Setting
INSERT INTO sites (site_id, site_name, site_description) VALUES (1, "Terry's event management", 'Write your Description');

-- Password
INSERT INTO organisers (username, password_hash) VALUES ('admin', '$2b$10$gxmPdRja0pXGAWIGuu4gh.d1zttC6sl7OyUueMwK4xnc5ioeHJRqe');

COMMIT;

