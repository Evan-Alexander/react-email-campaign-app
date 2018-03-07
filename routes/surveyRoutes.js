const _ = require('lodash');
const Path = require('path-parser');
const { URL } = require('url');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

const Survey = mongoose.model('surveys');

module.exports = app => {

  app.get('/api/surveys/:surveyId/:choice', (req, res) => {
    res.send('Thanks for voting!');
  });

  app.post('/api/surveys/webhooks', (req, res) => {
    const p = new Path('/api/surveys/:surveyId/:choice');
    // Using lodash library _.chain helper method
    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return { email, surveyId: match.surveyId, choice: match.choice };
        }
      })
      // Remove any items that have been returned as undefined
      .compact()
      // Remove duplicate items that have been returned
      .uniqBy('email', 'surveyId')
      .each(({ surveyId, email, choice }) => {
        // Find a record that matches this criteria - all done completely in mongo, NOT in our express server
        Survey.updateOne(
          {
            // In the mongoDB world we have to use '_id' instead of 'id'.
            _id: surveyId,
            // recipients is a subdocument model, hence the nested object
            recipients: {
              $elemMatch: { email: email, responded: false}
            }
          },
          {
            // $inc is a mongo operator
            // [choice] is an es6 key interpolator - if the key is 'yes' or no, either way, it'll increment the value by one
            // Choice and 'if responded' to be updated
            $inc: { [choice]: 1},
            // $set is a mongo operator for 'set' or 'update'
            // recipients is a subdocument layer '$' is the specific matched element and then update the 'responded' property to 'true'
            $set: { 'recipients.$.responded': true },
            lastResponded: new Date()
          }
        ).exec();
      })
      .value();

    res.send({});
  });

  app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;

    const survey = new Survey({
      title,
      subject,
      body,
      // Take the list of emails, comma seperate them, then return an email with the key of email and value of the email itself.
      recipients: recipients.split(',').map(email => ({ email: email.trim() })),
      _user: req.user.id,
      dateSent: Date.now()
    });
    // Sends the email.
    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();
      res.send(user);
    } catch (err){
      res.status(422).send(err);
    }

  });
};
