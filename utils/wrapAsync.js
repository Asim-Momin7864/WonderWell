// warpAsync taking function as parameter
function wrapAsync(fn) {
  return function (req, res, next) {
    if (typeof fn !== "function") {
      throw new TypeError("wrapAsync expects a function, but got " + typeof fn);
    }
    fn(req, res, next).catch((err) => next(err));
  };
}

module.exports = wrapAsync;
