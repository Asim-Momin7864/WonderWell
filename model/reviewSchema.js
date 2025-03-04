const { required } = require("joi");
const mongoose = require("mongoose");

// review schema

const reviewSchema = new mongoose.Schema({
  star: {
    type: Number,
    min: 0,
    max: 5,
  },
  content: String,
  created_at: {
    type: Date,
    default: Date.now(),
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
