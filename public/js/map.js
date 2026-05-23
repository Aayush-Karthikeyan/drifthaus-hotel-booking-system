(function () {
const listing = window.listingData;
  const coordinates = window.listingCoordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return;
  }

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return;
  }

  const map = L.map("map").setView([lat, lng], 9);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(
    `<b>${listing.title}</b><br>Exact location provided after booking.`
  );
})();
