if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
// requiring packages
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js");
const { userProfile } = require("./controllers/users.js");

// session
const session = require("express-session");
app.use(
  session({
    secret: "mySuperSecredKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);
app.use(flash());

// passport configuration
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// flash-local middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  console.log("success Array :-", res.locals.success);
  console.log("error Array :-", res.locals.error);
  next();
});

// Express Router
const listingsMiniApp = require("./routes/listings.js");
const reviewsMiniApp = require("./routes/reviews.js");
const usersMiniApp = require("./routes/users.js");

// use ejs-locals for all ejs templates:
app.engine("ejs", engine);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views/"));

app.use(express.static(path.join(__dirname, "public/css/")));
app.use(express.static(path.join(__dirname, "public/js/")));
app.use(express.static(path.join(__dirname, "public/assets/")));

const DB_url = process.env.ATLASDB_URL;
// setup database
async function main() {
  try {
    await mongoose.connect(DB_url);
    console.log("Connection is successfully established with DB");
  } catch (error) {
    console.error(error);
  }
}
mongoose.set("strictQuery", true);
main();

// listings routes
app.use("/listings", listingsMiniApp);

// reviews routes
app.use("/listings/:id/review", reviewsMiniApp);

// users routes
app.use("/users", usersMiniApp);

// // user profile
app.get("/profile", userProfile);

// if above request is donest match to any route it will match to this route
// creating custom Error
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error-handling-middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Route" } = err;
  res.status(statusCode).render("error.ejs", { message });
  console.log(`status code : ${statusCode}, Message : ${message}`);
});

app.listen(8080, () => {
  console.log("server is running at port 8080");
});
