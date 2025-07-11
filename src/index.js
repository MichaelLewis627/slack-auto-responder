const express = require('express');
const { App } = require('@slack/bolt');

const app = express();
app.use(express.json());

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Handle URL verification challenge - exactly as per Slack docs
app.post('/slack/events', (req, res) => {
  // First, verify it's a url_verification request
  if (req.body.type === 'url_verification') {
    // Respond with the challenge token
    return res.status(200)
      .set('Content-Type', 'application/json')
      .json({
        challenge: req.body.challenge
      });
  }

  // Handle other event types
  if (req.body.type === 'event_callback') {
    const event = req.body.event;
    
    // Handle message events
    if (event.type === 'message') {
      const messageText = event.text.toLowerCase();
      const hasTriggerWord = triggerWords.some(word => messageText.includes(word));
      const hasCoupaURL = messageText.includes(coupaURL);

      if (hasTriggerWord || hasCoupaURL) {
        slackApp.client.chat.postMessage({
          channel: event.channel,
          text: autoResponse
        });
      }
    }
  }

  // Acknowledge receipt of the event
  res.status(200).send();
});

// Keywords that trigger the auto-response
const triggerWords = ['approve', 'approval', 'request', 'reaching out'];
const coupaURL = 'https://amazon.coupahost.com';

// Your custom response message
const autoResponse = `Hello and thanks for reaching out! If this is an emergency (SEV1/SEV2), please submit your request via form our Coupa escalation intake form by clicking the "Start Workflow" button and filling out the form: https://slack.com/shortcuts/Ft0927KG58K1/f0171c184f3c213d8cd262a53003a519

Otherwise, please note that SLA for finance to review Purchase Order requests in Coupa is 48 business hours, beginning at the time of the prior approval in the approval chain. Non-emergent PO requests will be reviewed on a FIFO basis.`;

// Basic health check endpoint
app.get('/', (req, res) => {
  res.send('Slack app is running!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
