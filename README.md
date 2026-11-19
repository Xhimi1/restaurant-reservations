# Olive Table - Restaurant Reservations

A small restaurant reservation website made with plain HTML, CSS and JavaScript.
It is the midterm project for CEN 311 Web Technologies and Programming.

## Pages

- `index.html` - home page with a hero and a photo
- `reserve.html` - the form to book a table, three numbers and the list of reservations

## Features

- Booking form with validation and a clear message under every field:
  full name, email, date, time, number of guests, seating area and special requests
- The date cannot be in the past, and a time today cannot already be gone
- The restaurant has 40 seats for each date and time, so a full time slot is refused
- Statuses: Confirmed, Past and Cancelled
- Cancel and Delete buttons
- Numbers at the top: upcoming reservations, reservations today and guests today
- Reservations are saved in the browser with localStorage

## Files

- `styles.css` - all the styles
- `lib.js` - small helper functions (saving, dates, form checks)
- `app.js` - the code of the reservation page

## Run it

Open `index.html` in a browser. No install is needed.

Photo by Klara Kulikova on Unsplash.
