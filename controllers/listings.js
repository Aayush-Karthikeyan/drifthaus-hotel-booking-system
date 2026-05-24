const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const axios = require("axios");

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function geocode(location, country) {
  const query = encodeURIComponent(`${location}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  const res = await axios.get(url, {
    headers: { "User-Agent": "DrifthausApp/1.0" },
  });
  if (res.data && res.data.length > 0) {
    const { lon, lat } = res.data[0];
    return { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] };
  }
  return { type: "Point", coordinates: [0, 0] };
}

const VALID_CATEGORIES = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Mountains",
  "Castles",
  "Amazing Pools",
  "Camping",
  "Farms",
  "Arctic",
  "Domes",
  "Boats",
];

module.exports.index = async (req, res) => {
  const searchQuery = (req.query.search || "").trim();
  const categoryQuery = req.query.category || "";
  const activeCategory = VALID_CATEGORIES.includes(categoryQuery) ? categoryQuery : "";

  const escapedSearch = escapeRegex(searchQuery);

  let query = {};
  if (searchQuery) {
    query.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { location: { $regex: escapedSearch, $options: "i" } },
      { country: { $regex: escapedSearch, $options: "i" } },
    ];
  }
  if (activeCategory) {
    query.category = activeCategory;
  }

  const allListings = await Listing.find(query);

  // Get booking counts for all listings
  const bookingCounts = await Booking.aggregate([
    { $group: { _id: "$listing", count: { $sum: 1 } } }
  ]);
  const countMap = {};
  bookingCounts.forEach(b => { countMap[b._id.toString()] = b.count; });

  res.render("listings/index.ejs", { allListings, searchQuery, activeCategory, countMap });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // Get all booked date ranges for this listing (to block on date picker)
  const bookings = await Booking.find({ listing: id }, "checkIn checkOut");
  const bookedRanges = bookings.map(b => ({
    checkIn:  b.checkIn.toISOString().split("T")[0],
    checkOut: b.checkOut.toISOString().split("T")[0],
  }));

  // Get total booking count
  const bookingCount = bookings.length;

  res.render("listings/show.ejs", { listing, bookedRanges, bookingCount });
};

module.exports.createListing = async (req, res, next) => {
  const { location, country } = req.body.listing;
  const geometry = await geocode(location, country);

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = geometry;
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
