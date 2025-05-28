const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// ElevenLabs TTS API
async function textToSpeechUrl(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  try {
    const response = await axios({
      url,
      method: "POST",
      responseType: "arraybuffer",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      data: {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }
    });

    // Save the file locally (public/audio/)
    const filename = `${uuidv4()}.mp3`;
    const audioDir = path.join(__dirname, "..", "public", "audio");
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    const filePath = path.join(audioDir, filename);
    fs.writeFileSync(filePath, response.data);

    // Serve from /audio (handled by Express static in app.js)
    return `${process.env.PUBLIC_URL || ""}/audio/${filename}`;
  } catch (err) {
    return null;
  }
}

module.exports = { textToSpeechUrl };