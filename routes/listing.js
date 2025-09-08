const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn } = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage });


const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// index route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
// const search = await allListing.title;
    res.render("listings/index.ejs", { allListings });
  })
);

// new route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

// show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // id = id.trim();
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  })
);

// create route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(async (req, res) => {

    let url = req.file.path;
    let filename = req.file.filename;

    console.log(url, "...", filename);
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(400, result.error);
    }
    const newListing = new Listing(req.body.listing);

    newListing.image = {url, filename};
    
    console.log("Current User:", req.user);
    await newListing.save();
    req.flash("success", "Listing Created Successfully!");
    res.redirect("/listings");
  })
);

// router.post(upload.single("listing[image]"), (req,res) => {
//   res.send(req.file);
// })


// edit route

router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    console.log("edit route");
    res.render("listings/edit.ejs", { listing });
  })
);

// update Route
router.put(
  "/:id",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){

      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
      await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

// DELETE ROUTE
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
);

module.exports = router;
