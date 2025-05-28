# ME CABS – Premium Taxi Service

A Node.js backend for ME CABS, the premium taxi service providing instant quotes and bookings via phone and SMS, powered by Twilio, OpenAI, Google Maps, and ElevenLabs.

## Features

- Polite, premium AI agent for customer bookings
- Accurate fare quoting using Google Maps
- Voice and SMS bookings with Twilio
- Text-to-speech for high-quality voice responses
- Admin SMS alerts for new bookings

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables:**  
   Copy `.env.example` to `.env` and fill in your credentials:
   ```
   OPENAI_API_KEY=...
   TWILIO_ACCOUNT_SID=...
   (etc)
   ```

3. **Run the app:**
   ```sh
   npm start
   ```

## Directory Structure

```
src/
  booking.js
  conversation.js
  maps.js
  notify.js
  tts.js
  twilioWebhook.js
  whisper.js
.env
package.json
README.md
```

## Endpoints

- `POST /twilio/voice` – Main webhook for Twilio calls

## License

MIT