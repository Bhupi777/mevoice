const axios = require("axios");
const { getQuote } = require("./maps");

async function processConversation(userPrompt, context) {
  // Get quote from Google Maps
  let quoteMsg = "";
  try {
    const quote = await getQuote(context.pickup, context.dropoff);
    quoteMsg = `The estimated distance is ${quote.distance}, and the fare is approximately $${quote.price}.`;
  } catch (e) {
    quoteMsg = "Sorry, I could not calculate an accurate quote right now.";
  }

  // Compose prompt for ChatGPT (premium, polite, ME CABS, taxi service)
  const systemPrompt = `
You are a highly professional, courteous AI assistant for ME CABS, a premium taxi service.
Always begin your responses with 'ME CABS, how may I help you?'.
Greet the customer warmly, and mention our commitment to comfort, reliability, and premium vehicles.
Confirm their journey from "${context.pickup}" to "${context.dropoff}" at "${context.time}", provide the quote: ${quoteMsg}, and ask if they'd like to confirm or request any special arrangements.
Use polite, formal language at all times.
If the customer is a returning client, thank them for their loyalty.
Emphasize comfort, privacy, and exclusive service.
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = response.data.choices[0].message.content;
    return reply;
  } catch (err) {
    return `ME CABS, how may I help you? Thank you for your booking request from "${context.pickup}" to "${context.dropoff}" at "${context.time}". ${quoteMsg} Please let us know if you would like to confirm your booking.`;
  }
}

module.exports = { processConversation };