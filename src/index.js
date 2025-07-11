const express = require('express');
const { WebClient } = require('@slack/web-api');
const app = express();

// Initialize Slack Web Client
const slack = new WebClient(process.env.nv.SLACK_BOT_TOKEN);

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Keywords that trigger the auto-response
const triggerWords = ['approve', 'approval', 'request', 'reaching out'];
const coupaURL = 'https://amazon.coupahost.com';

// Your custom response message
const autoResponse = `Hello and thanks for reaching out! If this is an emergency (SEV1/SEV2), please submit your request via form our Coupa escalation intake form by clicking the "Start Workflow" button and filling out the form: https://slack.com/shortcuts/Ft0927KG58K1/f0171c184f3c213d8cd262a53003a519

Otherwise, please note that SLA for finance to review Purchase Order requests in Coupa is 48 business hours, beginning at the time of the prior approval in the approval chain. Non-emergent PO requests will be reviewed on a FIFO basis.`;

// Root route
app.get('/', (req, res) => {
  res.send('Slack Auto Responder is running!');
});

// Handle Slack events
app.post('/slack/events', async (req, res) => {
  console.log('Received Slack event:', JSON.stringify(req.body, null, 2));

  // URL Verification
  if (req.body && req.body.type === 'url_verification') {
    console.log('Handling URL verification');
    console.log('Challenge received:', req.body.challenge);
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // Handle message events
  if (req.body.type === 'event_callback' && req.body.event.type === 'message') {
    const event = req.body.event;
    
    // Don't respond to bot messages (prevents loops)
    if (event.bot_id || event.subtype) {
      return res.sendStatus(200);
    }

    // Check for trigger words or Coupa URL
    const messageText = event.text.toLowerCase();
    const hasTriggerWord = triggerWords.some(word => messageText.includes(word));
    const hasCoupaURL = messageText.includes(coupaURL);

    if (hasTriggerWord || hasCoupaURL) {
      try {
        await sl slack.chat.postMessage({
          channel: event.channel,
          text: autoResponse
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  // Acknowledge the event
  res.status(200).send('Event received');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Root URL: http://localhost:${PORT}/`);
  console.log(`Slack events URL: http://localhost:${PORT}/slack/events`);
});
