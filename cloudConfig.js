const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET, 
});

const listingsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Airbnb_Listings",
    allowedFormat: ["png", "jpg", "jpeg"],
  },
});
const usersStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Airbnb_users",
    allowedFormat: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  cloudinary,
  listingsStorage,
  usersStorage,
};
