const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');

module.exports = app => {
  // we just have to  make a reference to requireLogin for it to work in our billing
  // post request.
  app.post('/api/stripe', requireLogin, async (req, res) => {
    const charge = await stripe.charges.create({
      amount: 500,
      currency: 'usd',
      description: '$5 for five credits',
      source: req.body.id
    });
    req.user.credits += 5;
    // even though this looks like we're updating a constant variable ...
    // when ever we save a user model, we are making a reference of the user model
    // that we just got back from the database
    // These are seperate models, even though they represent the same thing
    const user = await req.user.save();

    res.send(user);
  });
};
