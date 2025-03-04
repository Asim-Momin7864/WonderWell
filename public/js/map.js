// Leaflet js

document.addEventListener("DOMContentLoaded", function () {
  async function mapRenderer(coordinates) {
    // Initialize the map
    var map = L.map("map").setView(coordinates, 13); // Centered at [lat, lng] with zoom level 13

    // Add a tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
      map
    );

    // Add a marker at a specific location
    L.marker(coordinates)
      .addTo(map)
      .bindPopup("Exact Location provided after booking.")
      .openPopup();
  }

  // Call the function with the coordinates
  mapRenderer(coordinates);
});
