const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { sendBookingConfirmation } = require("../utils/mailer.js");

// POST /listings/:id/book
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body;

  console.log("BOOKING ATTEMPT — checkIn:", checkIn, "checkOut:", checkOut, "user:", req.user && req.user.email);

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Parse as local date strings (YYYY-MM-DD) without timezone conversion
  const [ciY, ciM, ciD] = checkIn.split("-").map(Number);
  const [coY, coM, coD] = checkOut.split("-").map(Number);
  const checkInDate  = new Date(ciY, ciM - 1, ciD);
  const checkOutDate = new Date(coY, coM - 1, coD);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("BOOKING — parsed checkIn:", checkInDate, "checkOut:", checkOutDate, "today:", today);

  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    req.flash("error", "Invalid dates. Please try again.");
    return res.redirect(`/listings/${id}`);
  }
  if (checkInDate < today) {
    req.flash("error", "Check-in date cannot be in the past.");
    return res.redirect(`/listings/${id}`);
  }
  if (checkOutDate <= checkInDate) {
    req.flash("error", "Check-out must be after check-in.");
    return res.redirect(`/listings/${id}`);
  }

  // Check for overlapping bookings
  const conflict = await Booking.findOne({
    listing: listing._id,
    $or: [
      { checkIn:  { $lt: checkOutDate }, checkOut: { $gt: checkInDate } },
    ],
  });
  if (conflict) {
    req.flash("error", "Sorry, those dates are already booked. Please choose different dates.");
    return res.redirect(`/listings/${id}`);
  }

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const nights     = Math.round((checkOutDate - checkInDate) / MS_PER_DAY);
  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listing:    listing._id,
    user:       req.user._id,
    checkIn:    checkInDate,
    checkOut:   checkOutDate,
    nights,
    totalPrice,
  });
  await booking.save();
  console.log("BOOKING SAVED:", booking._id);

  // Redirect immediately — send email in background so it never blocks the response
  req.flash("success", `Booking confirmed! A confirmation email has been sent to ${req.user.email}.`);
  res.redirect("/my-bookings");

  // Fire-and-forget email (runs after response is sent)
  sendBookingConfirmation({
    toEmail:    req.user.email,
    username:   req.user.username,
    title:      listing.title,
    location:   listing.location,
    country:    listing.country,
    imageUrl:   listing.image ? listing.image.url : "",
    checkIn:    checkInDate,
    checkOut:   checkOutDate,
    nights,
    totalPrice,
    listingId:  listing._id.toString(),
  }).then(() => {
    console.log("EMAIL SENT to:", req.user.email);
  }).catch((mailErr) => {
    console.error("EMAIL FAILED:", mailErr.message, mailErr.code || "");
    console.error("  toEmail:", req.user.email);
    console.error("  BREVO_LOGIN:", process.env.BREVO_LOGIN);
    console.error("  BREVO_SMTP_KEY set:", !!process.env.BREVO_SMTP_KEY);
  });
};

// GET /my-bookings
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ checkIn: 1 });

  res.render("bookings/index.ejs", { bookings });
};

// DELETE /my-bookings/:bookingId
module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });

  if (!booking) {
    req.flash("error", "Booking not found or you are not authorised.");
    return res.redirect("/my-bookings");
  }

  if (new Date(booking.checkIn) <= new Date()) {
    req.flash("error", "Cannot cancel a booking whose check-in date has already passed.");
    return res.redirect("/my-bookings");
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/my-bookings");
};
