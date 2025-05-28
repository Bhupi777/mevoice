const express = require("express");
const router = express.Router();
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const { processConversation } = require("./conversation");
const { textToSpeechUrl } = require("./tts");
const { saveBooking } = require("./booking");
const { sendBookingSMS } = require("./notify");

router.post("/", async (req, res) => {
  const twiml = new VoiceResponse();

  const callSid = req.body.CallSid;
  const recordingUrl = req.body.RecordingUrl || "";
  const speechResult = req.body.SpeechResult || "";
  const step = req.body.step || "start";
  let context = {};

  // Start or continue conversation
  if (!speechResult && !recordingUrl && step === "start") {
    twiml.say("ME CABS, how may I help you?");
    twiml.record({
      action: "/twilio/voice?step=pickup",
      method: "POST",
      maxLength: 10,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  // Handle pickup location with Whisper
  if ((req.query.step === "pickup" || step === "pickup") && recordingUrl) {
    const { transcribeAudio } = require("./whisper");
    const pickupText = await transcribeAudio(recordingUrl);
    context.pickup = pickupText;
    twiml.say("Thank you. Now please say your drop off location after the beep.");
    twiml.record({
      action: `/twilio/voice?step=dropoff&pickup=${encodeURIComponent(context.pickup)}`,
      method: "POST",
      maxLength: 10,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  // Handle dropoff location with Whisper
  if ((req.query.step === "dropoff" || step === "dropoff") && recordingUrl) {
    const { transcribeAudio } = require("./whisper");
    context.pickup = req.query.pickup;
    context.dropoff = await transcribeAudio(recordingUrl);
    twiml.say("When would you like to be picked up? Say 'now' or a specific time after the beep.");
    twiml.record({
      action: `/twilio/voice?step=time&pickup=${encodeURIComponent(
        context.pickup
      )}&dropoff=${encodeURIComponent(context.dropoff)}`,
      method: "POST",
      maxLength: 7,
      playBeep: true,
      trim: "trim-silence"
    });
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  // Handle pickup time, get quote & confirm booking with Whisper
  if ((req.query.step === "time" || step === "time") && recordingUrl) {
    const { transcribeAudio } = require("./whisper");
    context.pickup = req.query.pickup;
    context.dropoff = req.query.dropoff;
    context.time = await transcribeAudio(recordingUrl);

    // Compose and get response from ChatGPT
    const aiPrompt = `A customer wants a taxi from "${context.pickup}" to "${context.dropoff}" at "${context.time}". Please respond as a polite premium taxi service.`;
    const aiReply = await processConversation(aiPrompt, context);

    // TTS via ElevenLabs
    const audioUrl = await textToSpeechUrl(aiReply);

    // Save booking
    const booking = {
      callSid,
      pickup: context.pickup,
      dropoff: context.dropoff,
      time: context.time,
      status: "pending",
    };
    await saveBooking(booking);

    // Send SMS to alert mobile number
    await sendBookingSMS(booking);

    // Play TTS response
    if (audioUrl) {
      twiml.play(audioUrl);
    } else {
      twiml.say(aiReply);
    }
    twiml.say("Thank you for booking with ME CABS. Goodbye!");
    res.type("text/xml");
    return res.send(twiml.toString());
  }

  // Fallback
  twiml.say(
    "Sorry, I did not get that. Let's start over. ME CABS, how may I help you? Please tell me your pickup location after the beep."
  );
  twiml.record({
    action: "/twilio/voice?step=pickup",
    method: "POST",
    maxLength: 10,
    playBeep: true,
    trim: "trim-silence"
  });
  res.type("text/xml");
  res.send(twiml.toString());
});

module.exports = router;