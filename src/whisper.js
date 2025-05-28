const axios = require("axios");

// Download Twilio recording and send to Whisper for transcription
async function transcribeAudio(recordingUrl) {
  try {
    // Twilio recording URLs need ".wav" appended for raw audio
    const url = recordingUrl.endsWith(".wav")
      ? recordingUrl
      : recordingUrl + ".wav";
    const audio = await axios.get(url, {
      responseType: "arraybuffer",
    });

    // Send audio to OpenAI Whisper API
    const FormData = require("form-data");
    const form = new FormData();
    form.append("file", Buffer.from(audio.data), {
      filename: "audio.wav",
      contentType: "audio/wav",
    });
    form.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    return response.data.text;
  } catch (err) {
    console.error("Whisper transcription failed:", err.message);
    return "";
  }
}

module.exports = { transcribeAudio };