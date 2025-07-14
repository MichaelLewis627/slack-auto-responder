const { App } = require('@slack/bolt');

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Keywords that trigger the auto-response
const triggerWords = ['approve', 'approval', 'request', 'reaching out'];
const coupaURL = 'https://amazon.coupahost.com';

// Your custom response message
const autoResponse = `Hello and thanks for reaching out! If this is an emergency (SEV1/SEV2), please submit your request via form our Coupa escalation intake form by clicking the "Start Workflow" button and filling out the form: https://slack.com/shortcuts/Ft0927KG58K1/f0171c184f3c213d8cd262a53003a519

Otherwise, please note that SLA for finance to review Purchase Order requests in Coupa is 48 business hours, beginning at the time of the prior approval in the approval chain. Non-emergent PO requests will be reviewed on a FIFO basis.`;

// Listen for messages containing trigger words
app.message(async ({ message, say }) => {
  const messageText = message.text?.toLowerCase() || '';
  const hasTriggerWord = triggerWords.some(word => messageText.includes(word));
  const hasCoupaURL = messageText.includes(coupaURL);

  if (hasTriggerWord || hasCoupaURL) {
    await say(autoResponse);
  }
});

// Handle /amazon slash command
app.command('/amazon', async ({ command, ack, say }) => {
  await ack();
  await say(autoResponse);
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
