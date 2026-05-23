const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const { sendBookingConfirmation } = require("../utils/mailer.js");
const ExpressError = require("../utils/ExpressError.js");

// POST /listings/:id/book
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.body;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today        = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Send confirmation email (non-blocking — don't crash on mail failure)
  try {
    await sendBookingConfirmation({
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
    });
  } catch (mailErr) {
    console.error("Booking email failed:", mailErr.message);
  }

  req.flash("success", `Booking confirmed! A confirmation email has been sent to ${req.user.email}.`);
  res.redirect("/my-bookings");
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

  // Allow cancel only if check-in is in the future
  if (new Date(booking.checkIn) <= new Date()) {
    req.flash("error", "Cannot cancel a booking whose check-in date has already passed.");
    return res.redirect("/my-bookings");
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancelled successfully.");
  res.redirect("/my-bookings");
};
