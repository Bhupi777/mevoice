require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const twilioWebhook = require("./twilioWebhook");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve audio files publicly
app.use("/audio", express.static(path.join(__dirname, "..", "public", "audio")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use("/twilio/voice", twilioWebhook);

app.get("/", (req, res) => {
  res.send("Mecabs Voice Taxi Agent is running!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});