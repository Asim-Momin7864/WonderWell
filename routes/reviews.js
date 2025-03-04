// requiring packages
const express = require("express");
// for error handling
const wrapAsync = require("../utils/wrapAsync.js");
// Express Router
const router = express.Router({ mergeParams: true });
let {
  validateReview,
  isLoggedIn,
  isReviewOwner,
} = require("../utils/middleware.js");
const reviewController = require("../controllers/review.js");

// POST : Review
router.post(
  "/new",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.addNewReview)
);

// DELETE : delete review
router.delete(
  "/:review_id/delete",
  isLoggedIn,
  isReviewOwner,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
