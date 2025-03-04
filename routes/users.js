// requiring packages
const express = require("express");
const passport = require("passport");
// Express Router
const router = express.Router({});
const { saveRedirectURLtoLocals } = require("../utils/middleware.js");
const userController = require("../controllers/users.js");
const multer = require("multer");
const { usersStorage } = require("../cloudConfig.js");
const upload = multer({ storage: usersStorage });

// sign-up
router
  .route("/signup")
  .get(userController.renderSignupForm) // GET : sign-up
  .post(upload.single("profilePicture"), userController.signupNewUser); // POST : sign-up

// login
router
  .route("/login")
  .get(userController.renderLoginForm) // GET : login
  .post(
    saveRedirectURLtoLocals,
    passport.authenticate("local", {
      failureRedirect: "/users/login",
      failureFlash: true,
    }),
    userController.loginUser
  ); // POST : login

// GET : logout
router.get("/logout", userController.logoutUser);

module.exports = router;
