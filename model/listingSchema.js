const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviewSchema");
const ExpressError = require("../utils/ExpressError");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Icons",
      "Beachfront",
      "Lakefront",
      "Mansions",
      "Amazing Pools",
      "Farms",
      "Castles",
      "Rooms",
      "Treehouse",
      "Luxury",
      "Cabins",
      "Tiny homes",
      "Islands",
      "Countrysides",
      "Historical Homes",
      "Design",
      "Artic",
      "Top Cities",
      "Camping",
      "Boats",
    ],
  },
});

// mongoose post middleware
listingSchema.post("findOneAndDelete", async function (deletedListing) {
  if (
    deletedListing &&
    deletedListing.reviews &&
    deletedListing.reviews.length > 0
  ) {
    try {
      let result = await Review.deleteMany({
        _id: { $in: deletedListing.reviews },
      });
      console.log("deleted reviews", result);
    } catch (error) {
      throw new ExpressError(400, error);
    }
  } else {
    console.log("This Listing is Deleted, It does not contain any reviews");
  }
});

// model
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
