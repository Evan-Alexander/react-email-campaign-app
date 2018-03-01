module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ error: ' You must be logged in. '});
  }
  // next() sends the request to the next middleware, if any.
  next();
};
