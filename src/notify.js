const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const toNumber = process.env.ALERT_MOBILE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendBookingSMS(booking) {
  if (!toNumber) return; // No alert number set

  const message = `
New ME CABS Booking:
Pickup: ${booking.pickup}
Dropoff: ${booking.dropoff}
Time: ${booking.time}
Call SID: ${booking.callSid || booking.callSID || ""}
  `.trim();

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });
  } catch (e) {
    console.error('Failed to send booking SMS:', e.message);
  }
}

module.exports = { sendBookingSMS };