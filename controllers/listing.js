// requiring packages
const Listing = require("../model/listingSchema.js");
const ExpressError = require("../utils/ExpressError.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

module.exports.index = async (req, res, next) => {
  let { type, search } = req.query;
  console.log(req.query);
  let listings = [];
  if (type) {
    listings = await Listing.find({ category: type }).populate("owner");
  } else if (search) {
    if (isNaN(search)) {
      listings = await Listing.find(
        {
          $text: {
            $search: search,
          },
        },
        {
          score: { $meta: "textScore" },
        }
      )
        .sort({
          score: { $meta: "textScore" },
        })
        .populate("owner");
      console.log(listings);
    } else {
      let Price = Number(search);
      let greaterPrice = Price + 1000;
      let lessPrice = Price - 1000;
      listings = await Listing.find({
        price: { $gte: lessPrice, $lte: greaterPrice },
      })
        .sort({ price: -1 })
        .populate("owner");
    }
  } else {
    listings = await Listing.find().populate("owner");
  }
  console.log("listings from index controller -->", listings);
  listings = await Promise.allSettled(
    listings.map(async (listing) => {
      // rating avg by mongoDB pipling
      let ratingAvg = await Listing.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(listing._id) } },
        {
          $lookup: {
            from: "reviews",
            localField: "reviews",
            foreignField: "_id",
            as: "reviewsData",
          },
        },
        { $unwind: { path: "$reviewsData", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$_id",
            avgCount: { $avg: "$reviewsData.star" },
          },
        },
        {
          $project: {
            _id: 1,
            avgCount: { $round: ["$avgCount", 2] },
          },
        },
      ]);
      listing = listing.toObject();
      listing.ratingAvg = ratingAvg?.[0]?.avgCount ?? 0;
      return listing;
    })
  );

  // extracting value from promise result
  listings = listings.map((result) => {
    return result.value;
  });

  console.log(listings);
  res.render("./listings/index.ejs", { listings });
};

module.exports.renderNewListingForm = (req, res, next) => {
  try {
    res.render("./listings/new.ejs");
  } catch (err) {
    next(err);
  }
};

module.exports.addNewListing = async (req, res, next) => {
  let { title, description, price, location, coordinates, category } = req.body;
  let { path, filename } = req.file;

  let listing = new Listing({
    title: title,
    description: description,
    image: {
      url: path,
      filename: filename,
    },
    category: category,
    price: price,
    location: location,
    owner: req.user._id,
    geometry: {
      coordinates: coordinates,
    },
  });
  let newlisting = await listing.save();
  console.log("New Listing *Test :- ", newlisting);
  req.flash("success", "New Listing is Created!");
  res.redirect("/listings");
};

module.exports.renderEditListingForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The listing you want is Deleted");
    return res.redirect("/listings");
  }

  let previewImage = listing.image.url;
  previewImage = previewImage.replace(
    "/upload",
    "/upload/w_250,c_fill,q_auto,f_auto"
  );

  res.render("./listings/edit.ejs", { listing, previewImage });
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let { coordinates, ...updatedData } = req.body;
  let updatedListing = await Listing.findByIdAndUpdate(
    id,
    {
      ...updatedData,
      geometry: {
        type: "Point",
        coordinates: req.body.coordinates,
      },
    },
    { runValidators: true, new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { url, filename };
    await updatedListing.save();
  }
  console.log("updated Listing :-", updatedListing);
  req.flash("success", "Listing is Updated!");
  res.redirect(`/listings/${id}/details`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findOneAndDelete(
    { _id: id },
    {
      runValidators: true,
    }
  );
  console.log("Deleted Listing *Test :- ", deletedListing);
  req.flash("success", "Listing is Deleted!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let detailListing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "_id username email picture",
      },
    });
  let totalReviews = detailListing.reviews.length;
  console.log("totalReview - ", totalReviews);
  detailListing.totalReviews = totalReviews;
  let ratingAvg = await Listing.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "reviews",
        localField: "reviews",
        foreignField: "_id",
        as: "reviewsData",
      },
    },
    { $unwind: { path: "$reviewsData", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        avgCount: { $avg: "$reviewsData.star" },
      },
    },
    {
      $project: {
        _id: 1,
        avgCount: { $round: ["$avgCount", 2] },
      },
    },
  ]);

  console.log("rating average of reviews --->", ratingAvg);
  ratingAvg = ratingAvg?.[0]?.avgCount ?? 0;
  detailListing.ratingAvg = ratingAvg;

  if (!detailListing) {
    req.flash("error", "The listing you want is Deleted");
    return res.redirect("/listings");
  }
  console.log("detailListing.reviews", detailListing.reviews);
  res.render("./listings/details.ejs", { detailListing });
};
