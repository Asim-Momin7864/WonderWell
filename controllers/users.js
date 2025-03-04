// requiring packages
const ExpressError = require("../utils/ExpressError.js");
const User = require("../model/user.js");

module.exports.renderSignupForm = (req, res, next) => {
  try {
    res.render("./users/signup.ejs");
  } catch (error) {
    next(error);
  }
};

module.exports.signupNewUser = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    let { filename, path } = req.file;
    let transformedPath = path.replace(
      "/upload/",
      "/upload/ar_1:1,g_auto,w_500,c_auto,r_max/"
    );
    let newUser = new User({
      email: email,
      username: username,
      picture: {
        url: transformedPath,
        filename: filename,
      },
    });
    let registeredUser = await User.register(newUser, password);
    // Signup after direct loggged In user
    req.logIn(registeredUser, (err) => {
      if (err) {
        return next(err);
      } else {
        req.session.user = {
          username: req.user.username,
          url: req.user.picture.url,
          email: req.user.email,
        };
        req.flash("success", "Welcome to Airbnb");
        res.redirect("/");
      }
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/users/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  try {
    res.render("./users/login.ejs");
  } catch (error) {
    next(error);
  }
};

module.exports.loginUser = async (req, res) => {
  req.session.user = {
    username: req.user.username,
    url: req.user.picture.url,
    email: req.user.email,
  };
  req.flash("success", "Welcome back to Airbnb!");
  let redirectURL = res.locals.redirectURL || "/";
  res.redirect(redirectURL);
};

module.exports.userProfile = async (req, res) => {
  if (!req.session.user) {
    let user = {
      username: "Not-user",
      url: "https://res.cloudinary.com/dzlxpg7ru/image/upload/v1740991015/non-user_zev7dq.png",
      email: "No-email",
    };
    return res.json(user);
  }
  res.json(req.session.user);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(new ExpressError(400, "For Logout you must be first login"));
    }
    //session destruction
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
};
