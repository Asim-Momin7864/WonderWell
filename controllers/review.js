// requiring packages
const Listing = require("../model/listingSchema.js");
const Review = require("../model/reviewSchema.js");

module.exports.addNewReview = async (req, res) => {
  let { id } = req.params;
  let { content, star } = req.body;
  let review = new Review({
    star: star,
    content: content,
    author: res.locals.currUser._id,
  });

  let newReview = await review.save();
  let listing = await Listing.findById(id);
  listing.reviews.push(newReview);
  let updatedListing = await listing.save();
  req.flash("success", "New Review is Created!");
  res.redirect(`/listings/${id}/details`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, review_id } = req.params;
  await Listing.findByIdAndUpdate(
    id,
    { $pull: { reviews: review_id } },
    { new: true, runValidators: true }
  );
  let result = await Review.findOneAndDelete({ _id: review_id });
  req.flash("success", "Review is Deleted!");
  res.redirect(`/listings/${id}/details`);
};
