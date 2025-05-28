const axios = require("axios");

// Premium fare calculation (base fare + per km)
const BASE_FARE = 15; // base fare is $15
const PER_KM_RATE = 2.4; // per km rate is $2.40

async function getQuote(pickup, dropoff) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    pickup
  )}&destination=${encodeURIComponent(dropoff)}&key=${apiKey}`;
  const response = await axios.get(url);
  if (
    response.data.routes &&
    response.data.routes.length > 0 &&
    response.data.routes[0].legs.length > 0
  ) {
    const route = response.data.routes[0].legs[0];
    const distanceKm = route.distance.value / 1000;
    const duration = route.duration.text;
    const price = (BASE_FARE + distanceKm * PER_KM_RATE).toFixed(2);
    return {
      distance: `${distanceKm.toFixed(1)} km`,
      duration,
      price
    };
  } else {
    throw new Error("Could not calculate route");
  }
}

module.exports = { getQuote };