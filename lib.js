// lib.js
// Small helper functions. They know nothing about the restaurant,
// so any page can reuse them.

// ----- Saving and loading (localStorage) -----

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const text = localStorage.getItem(key);
  if (text === null) {
    return [];
  }
  return JSON.parse(text);
}

// ----- Dates -----
// Dates are written like "2026-11-20", so we can compare them as text.

function dateToText(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function todayAsText() {
  return dateToText(new Date());
}

// The date from some days ago, for example daysAgoAsText(6)
function daysAgoAsText(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dateToText(date);
}

// The time right now, written like "19:30"
function nowAsText() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return hours + ":" + minutes;
}

function isAfterToday(dateText) {
  return dateText > todayAsText();
}

function isBeforeToday(dateText) {
  return dateText < todayAsText();
}

// True when the date is today or in the last (days - 1) days before it
function isInLastDays(dateText, days) {
  return dateText >= daysAgoAsText(days - 1) && dateText <= todayAsText();
}

function formatDate(dateText) {
  const parts = dateText.split("-");
  return parts[2] + "." + parts[1] + "." + parts[0];
}

// ----- Safe text for HTML -----
// Stops a user from typing HTML tags into the page.

function safeText(text) {
  const box = document.createElement("div");
  box.textContent = text;
  return box.innerHTML;
}

// ----- Form checks -----
// Each function returns an error message, or "" when the value is fine.

function checkRequired(value, message) {
  if (value.trim() === "") {
    return message;
  }
  return "";
}

function checkMinLength(value, minimum, message) {
  if (value.trim().length < minimum) {
    return message;
  }
  return "";
}

function checkMaxLength(value, maximum, message) {
  if (value.trim().length > maximum) {
    return message;
  }
  return "";
}

// An email needs some text, an @, some text, a dot and some text
function checkEmail(value, message) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (pattern.test(value.trim()) === false) {
    return message;
  }
  return "";
}

// A number between a minimum and a maximum (decimals are fine, like 22.5)
function checkNumberBetween(value, minimum, maximum, message) {
  const number = Number(value);
  if (value.trim() === "" || isNaN(number) || number < minimum || number > maximum) {
    return message;
  }
  return "";
}

// A whole number between a minimum and a maximum (no decimals)
function checkWholeNumber(value, minimum, maximum, message) {
  const number = Number(value);
  if (value.trim() === "" || Number.isInteger(number) === false || number < minimum || number > maximum) {
    return message;
  }
  return "";
}

// Show an error under one input. Pass "" to clear it.
// The input has an id like "title" and its message has an id like "title-error".
function showError(fieldId, message) {
  document.getElementById(fieldId + "-error").textContent = message;
  const input = document.getElementById(fieldId);
  if (message === "") {
    input.classList.remove("input-bad");
  } else {
    input.classList.add("input-bad");
  }
}
