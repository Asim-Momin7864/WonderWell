// requiring packages
const express = require("express");
const router = express.Router({ mergeParams: true });
const listingController = require("../controllers/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  isLoggedIn,
  isOwner,
  validateListing,
  geoCoder,
} = require("../utils/middleware.js");

const multer = require("multer");
const { listingsStorage } = require("../cloudConfig.js");
const upload = multer({ storage: listingsStorage });

//GET : listings
router.get("/", wrapAsync(listingController.index));

// # New Listing
router
  .route("/listings/new")
  .get(isLoggedIn, listingController.renderNewListingForm) // GET : New listings
  .post(
    isLoggedIn,
    upload.single("image"),
    geoCoder,
    validateListing,
    wrapAsync(listingController.addNewListing)
  ); // POST : New lisitngs

// # Edit
router
  .route("/listings/:id/edit")
  .get(isLoggedIn, isOwner, wrapAsync(listingController.renderEditListingForm)) // GET : Edit Page
  .patch(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    geoCoder,
    validateListing,
    wrapAsync(listingController.editListing)
  ); //PATCH : edit

//DELETE : delete listing
router.delete(
  "/listings/:id/delete",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.deleteListing)
);

// GET : details
router.get("/listings/:id/details", wrapAsync(listingController.showListing));

module.exports = router;
