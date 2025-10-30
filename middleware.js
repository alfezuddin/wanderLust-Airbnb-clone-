// ✅ middleware.js
const Listing = require("./models/listing");

// ✅ 1️⃣ Check if user is logged in
function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    // Save redirect URL to return after login
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to perform this action!");
    return res.redirect("/login");
  }
  next();
}

// ✅ 2️⃣ Save redirect URL after login (used in routes/login success)
function saveRedirectUrl(req, res, next) {
  if (req.session && req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

// ✅ 3️⃣ Only owner can edit or delete listings
async function isOwner(req, res, next) {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    // ❌ Listing not found
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // ❌ User not logged in (extra safety)
    if (!req.user) {
      req.flash("error", "You must be logged in to perform this action!");
      return res.redirect("/login");
    }

    // ❌ User is not the owner
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You don't have permission to edit or delete this listing!");
      return res.redirect(`/listings/${id}`);
    }

    // ✅ All good — move ahead
    next();
  } catch (err) {
    console.error("Error in isOwner middleware:", err);
    req.flash("error", "Something went wrong! Please try again.");
    return res.redirect("/listings");
  }
}

// ✅ Export all middlewares
module.exports = {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
};
