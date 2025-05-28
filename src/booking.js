const fs = require("fs");
const path = require("path");

const BOOKINGS_FILE = path.join(__dirname, "..", "data", "bookings.json");

function saveBooking(booking) {
  let bookings = [];
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, "utf8"));
    }
  } catch (e) {
    bookings = [];
  }
  bookings.push({
    ...booking,
    id: bookings.length + 1,
    created: new Date().toISOString()
  });
  fs.mkdirSync(path.dirname(BOOKINGS_FILE), { recursive: true });
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  return true;
}

module.exports = { saveBooking };