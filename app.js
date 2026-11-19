// app.js
// The restaurant reservation page. It uses the helper functions from lib.js.
//
// A reservation is saved like this:
// { id, name, email, date, time, guests, notes, cancelled }
// "cancelled" is true when the guest cancelled the table.

// The restaurant has this many seats at the same date and time
const TOTAL_SEATS = 40;

// All reservations live in this list. We load it from the browser when the page opens.
let reservations = loadData("restaurant-reservations");

// Elements we use more than once
const form = document.getElementById("reservation-form");
const list = document.getElementById("reservation-list");
const dateInput = document.getElementById("date");
const upcomingCount = document.getElementById("upcoming-count");
const todayCount = document.getElementById("today-count");
const guestsCount = document.getElementById("guests-count");
const emptyMessage = document.getElementById("empty-message");
const successMessage = document.getElementById("success-message");

// Small icons (SVG drawings) for the buttons
const cancelIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M18 6 6 18M6 6l12 12'/></svg>";
const trashIcon = "<svg class='icon' viewBox='0 0 24 24'><path d='M3 6h18'/><path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>";

// ----- Status of a reservation -----
// Cancelled: the guest cancelled it.
// Past: the date is before today.
// Confirmed: everything else.

function getStatus(reservation) {
  if (reservation.cancelled) {
    return "Cancelled";
  }
  if (isBeforeToday(reservation.date)) {
    return "Past";
  }
  return "Confirmed";
}

// How many seats are already taken at one date and time
function seatsTaken(date, time) {
  let taken = 0;
  for (const reservation of reservations) {
    if (reservation.date === date && reservation.time === time && reservation.cancelled === false) {
      taken += reservation.guests;
    }
  }
  return taken;
}

// ----- Showing the reservations -----

function showReservations() {
  // Upcoming reservations first (soonest on top), then the past ones
  reservations.sort(function (a, b) {
    const first = a.date + a.time;
    const second = b.date + b.time;
    const aIsPast = isBeforeToday(a.date);
    const bIsPast = isBeforeToday(b.date);
    if (aIsPast !== bIsPast) {
      return aIsPast ? 1 : -1;
    }
    return first.localeCompare(second);
  });

  let rows = "";
  for (const reservation of reservations) {
    const status = getStatus(reservation);
    let statusClass = "";
    if (status === "Cancelled") {
      statusClass = "red";
    }

    // Email and special requests are shown in small text under the name
    let guestCell = safeText(reservation.name);
    guestCell += "<span class='small'>" + safeText(reservation.email) + "</span>";
    if (reservation.notes !== "") {
      guestCell += "<span class='small'>" + safeText(reservation.notes) + "</span>";
    }

    rows += "<tr>";
    rows += "<td>" + guestCell + "</td>";
    rows += "<td>" + formatDate(reservation.date) + "</td>";
    rows += "<td>" + reservation.time + "</td>";
    rows += "<td>" + reservation.guests + "</td>";
    rows += "<td class='" + statusClass + "'>" + status + "</td>";
    rows += "<td>";
    // Only a confirmed reservation can be cancelled
    if (status === "Confirmed") {
      rows += "<button class='button button-small' data-action='cancel' data-id='" + reservation.id + "'>" + cancelIcon + " Cancel</button> ";
    }
    rows += "<button class='button button-small' data-action='delete' data-id='" + reservation.id + "'>" + trashIcon + " Delete</button>";
    rows += "</td>";
    rows += "</tr>";
  }
  list.innerHTML = rows;

  // Message when there are no reservations
  if (reservations.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  // The three numbers at the top
  let upcoming = 0;
  let today = 0;
  let guestsToday = 0;
  for (const reservation of reservations) {
    if (getStatus(reservation) !== "Confirmed") {
      continue;
    }
    upcoming++;
    if (reservation.date === todayAsText()) {
      today++;
      guestsToday += reservation.guests;
    }
  }
  upcomingCount.textContent = upcoming;
  todayCount.textContent = today;
  guestsCount.textContent = guestsToday;
}

function saveAndShow() {
  saveData("restaurant-reservations", reservations);
  showReservations();
}

// The date field starts as today, so you only change it for another day
function setDateToToday() {
  dateInput.value = todayAsText();
}

// ----- Checking the form -----

function checkForm() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = dateInput.value;
  const time = document.getElementById("time").value;
  const guests = document.getElementById("guests").value;
  const notes = document.getElementById("notes").value;

  // The date cannot be in the past, and a time today cannot already be gone
  let dateError = checkRequired(date, "Please choose a date.");
  if (dateError === "" && isBeforeToday(date)) {
    dateError = "The date cannot be in the past.";
  }

  let timeError = checkRequired(time, "Please choose a time.");
  if (timeError === "" && date === todayAsText() && time <= nowAsText()) {
    timeError = "This time has already passed today.";
  }

  // The guests must be a number from 1 to 12, and there must be enough free seats
  let guestsError = checkWholeNumber(guests, 1, 12, "Guests must be a whole number from 1 to 12.");
  if (guestsError === "" && date !== "" && time !== "") {
    const free = TOTAL_SEATS - seatsTaken(date, time);
    if (Number(guests) > free) {
      guestsError = "Only " + free + " seats are left at this time.";
    }
  }

  const errors = {
    name:
      checkRequired(name, "Please write your full name.") ||
      checkMinLength(name, 3, "The name needs at least 3 letters."),
    email:
      checkRequired(email, "Please write your email.") ||
      checkEmail(email, "Please write a real email, like ana@email.com."),
    date: dateError,
    time: timeError,
    guests: guestsError,
    notes: checkMaxLength(notes, 200, "Special requests can have 200 letters at most.")
  };

  // Show every message (an empty message clears the old one)
  showError("name", errors.name);
  showError("email", errors.email);
  showError("date", errors.date);
  showError("time", errors.time);
  showError("guests", errors.guests);
  showError("notes", errors.notes);

  // The form is fine when all messages are empty
  return (
    errors.name === "" &&
    errors.email === "" &&
    errors.date === "" &&
    errors.time === "" &&
    errors.guests === "" &&
    errors.notes === ""
  );
}

// ----- Adding a reservation -----

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  successMessage.classList.add("hidden");

  if (checkForm() === false) {
    return;
  }

  const newReservation = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    date: dateInput.value,
    time: document.getElementById("time").value,
    guests: Number(document.getElementById("guests").value),
    notes: document.getElementById("notes").value.trim(),
    cancelled: false
  };

  reservations.push(newReservation);
  form.reset();
  setDateToToday();
  saveAndShow();

  // Tell the guest that the table is booked
  const firstName = newReservation.name.split(" ")[0];
  successMessage.textContent =
    "Thank you, " + firstName + ". Your table for " + newReservation.guests +
    " is booked for " + formatDate(newReservation.date) + " at " + newReservation.time + ".";
  successMessage.classList.remove("hidden");
});

// ----- Cancel and Delete buttons -----

list.addEventListener("click", function (event) {
  // The click may land on the icon inside the button, so find the button
  const button = event.target.closest("button");
  if (button === null) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === "cancel") {
    for (const reservation of reservations) {
      if (reservation.id === id) {
        reservation.cancelled = true;
      }
    }
  }

  if (action === "delete") {
    reservations = reservations.filter(function (reservation) {
      return reservation.id !== id;
    });
  }

  saveAndShow();
});

// When the page opens: fill in today's date and show the saved reservations
setDateToToday();
showReservations();
