const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendFollowUpSMS(toNumber, pickup, dropoff) {
  const message = `Hi! You started a booking with ME CABS from ${pickup} to ${dropoff} but didn't finish. Reply YES to confirm now and get 5% off!`;
  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
  } catch (e) {
    console.error('Failed to send follow-up SMS:', e.message);
  }
}

module.exports = { sendFollowUpSMS };