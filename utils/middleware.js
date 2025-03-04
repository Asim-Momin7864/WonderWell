//joi
const { listingSchemaJoi, reviewSchemaJoi } = require("../joi_Schema.js");
const Listing = require("../model/listingSchema.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../model/reviewSchema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You Must be Logged In First!");
    return res.redirect("/users/login");
  }
  next();
};

// isOwner --> is to stop non-owner users to do delete & update
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(req.user._id)) {
    req.flash(
      "error",
      "You are not Owner of this Listing, So You Dont have permissions to Change"
    );
    let redirectURL = req.get("referer") || "/";
    return res.redirect(redirectURL);
  }
  next();
};

module.exports.saveRedirectURLtoLocals = (req, res, next) => {
  if (req.session.redirectURL) {
    res.locals.redirectURL = req.session.redirectURL;
  }
  next();
};

// joi server side validation function for listings
module.exports.validateListing = (req, res, next) => {
  let result = listingSchemaJoi.validate(req.body);
  let { error } = result;
  if (error) {
    return next(new ExpressError(400, error));
  } else {
    next();
  }
};

// joi server side validation function for review
module.exports.validateReview = (req, res, next) => {
  let result = reviewSchemaJoi.validate(req.body);
  let { error } = result;
  if (error) {
    return next(new ExpressError(400, error));
  } else {
    next();
  }
};

// isReviewOwner --> is to stop non-owner users to do delete & update reviews
module.exports.isReviewOwner = async (req, res, next) => {
  let { review_id } = req.params;
  let review = await Review.findById(review_id);
  if (!review.author._id.equals(req.user._id)) {
    req.flash("error", "You are not the Author of this Review");
    let redirectURL = req.get("referer") || "/";
    return res.redirect(redirectURL);
  }
  next();
};

// geoCoder
module.exports.geoCoder = async (req, res, next) => {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${req.body.location}`
  );
  let data = await response.json();
  if (data.length > 0) {
    let lon = parseFloat(data[0].lon);
    let lat = parseFloat(data[0].lat);
    req.body.coordinates = [lat, lon];
  } else {
    return next(new ExpressError(400, "Location does not found"));
  }
  next();
};
