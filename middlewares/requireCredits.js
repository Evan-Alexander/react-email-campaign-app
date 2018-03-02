module.exports = (req, res, next) => {
  if (req.user.credits < 1) {
    return res.status(403).send({ error: 'Not enough credits.' });
  }
  // next() sends the request to the next middleware, if any.
  next();
};
