const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// POST /listings/:id/book  → create a new booking
router.post(
  "/listings/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.createBooking)
);

// GET /my-bookings  → show all bookings for current user
router.get(
  "/my-bookings",
  isLoggedIn,
  wrapAsync(bookingController.myBookings)
);

// DELETE /my-bookings/:bookingId  → cancel a booking
router.delete(
  "/my-bookings/:bookingId",
  isLoggedIn,
  wrapAsync(bookingController.cancelBooking)
);

module.exports = router;
