// ===== Глобальні змінні =====
// Координати Фахового коледжу електронних приладів ІФНТУНГ (м. Івано-Франківськ, вул. Вовчинецька, 223)
const ourCoords = {
  latitude: 48.9430535,
  longitude: 24.7337011
};
// Для перевірки можна підставити координати Верховної Ради: 50.4473, 30.5370

let watchId = null;
let map = null;              // карта Leaflet
let myMarker = null;         // маркер поточного місцезнаходження
let destMarker = null;       // маркер пункту призначення
let lastPosition = null;

window.onload = getMyLocation;

// ===== Частина 1–2. Перевірка підтримки та кнопки =====
function getMyLocation() {
  if (navigator.geolocation) {
    // Одноразове визначення місця при відкритті сторінки
    navigator.geolocation.getCurrentPosition(displayLocation, displayError);

    const watchButton = document.getElementById('watch');
    watchButton.onclick = watchLocation;
    const clearWatchButton = document.getElementById('clearWatch');
    clearWatchButton.onclick = clearWatch;

    document.getElementById('goToDest').onclick = showDestination;
    document.getElementById('goToMe').onclick = function () {
      if (lastPosition) map.flyTo(lastPosition, 16);
    };
  } else {
    alert('Oops, no geolocation support');
  }
}

// successHandler
function displayLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const div = document.getElementById('location');
  div.innerHTML = `You are at Latitude: ${latitude}, Longitude: ${longitude}`;

  // Точність визначення координат (у метрах)
  document.getElementById('accuracy').innerHTML =
    ` (with ${Math.round(position.coords.accuracy)} meters accuracy)`;

  // Відстань до Коледжу
  const km = computeDistance(position.coords, ourCoords);
  document.getElementById('distance').innerHTML = `You are ${km.toFixed(2)} km from the College`;

  // Індивідуальне завдання: карта і маркери
  showOnMap(latitude, longitude, position.coords.accuracy);
}

// errorHandler
function displayError(error) {
  const errorTypes = {
    0: 'Unknown error',
    1: 'Permission denied by user',
    2: 'Position is not available',
    3: 'Request timed out'
  };
  let errorMessage = errorTypes[error.code];
  if (error.code === 0 || error.code === 2) {
    errorMessage = errorMessage + ' ' + error.message;
  }
  document.getElementById('location').innerHTML = errorMessage;
}

// ===== Формула гаверсинуса =====
function computeDistance(startCoords, destCoords) {
  const startLatRads = degreesToRadians(startCoords.latitude);
  const startLongRads = degreesToRadians(startCoords.longitude);
  const destLatRads = degreesToRadians(destCoords.latitude);
  const destLongRads = degreesToRadians(destCoords.longitude);

  const Radius = 6371; // радіус Землі, км
  const distance = Math.acos(
    Math.sin(startLatRads) * Math.sin(destLatRads) +
    Math.cos(startLatRads) * Math.cos(destLatRads) *
    Math.cos(startLongRads - destLongRads)
  ) * Radius;

  return distance;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// ===== Частина 2. Відстеження в реальному часі =====
function watchLocation() {
  if (watchId !== null) return; // вже відстежуємо
  watchId = navigator.geolocation.watchPosition(displayLocation, displayError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
}

function clearWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

// ===== Індивідуальне завдання: карта Leaflet =====
function initMap(latitude, longitude) {
  map = L.map('map').setView([latitude, longitude], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Маркер коледжу
  L.marker([ourCoords.latitude, ourCoords.longitude])
    .addTo(map)
    .bindPopup('<b>Коледж електронних приладів ІФНТУНГ</b><br>вул. Вовчинецька, 223');
}

function showOnMap(latitude, longitude, accuracy) {
  if (typeof L === 'undefined') return; // бібліотека не завантажилась (немає інтернету)
  if (!map) initMap(latitude, longitude);

  const time = new Date().toLocaleTimeString('uk-UA');
  const popup = `<b>Ви тут</b><br>Широта: ${latitude.toFixed(6)}<br>Довгота: ${longitude.toFixed(6)}` +
    `<br>Точність: ${Math.round(accuracy)} м<br>Час: ${time}`;

  if (myMarker && lastPosition && lastPosition[0] === latitude && lastPosition[1] === longitude) {
    return; // координати не змінились — новий маркер не потрібен
  }
  // При кожній зміні місця додаємо новий маркер з координатами та часом
  myMarker = L.circleMarker([latitude, longitude], { radius: 8, color: '#dc2626', fillOpacity: 0.8 })
    .addTo(map)
    .bindPopup(popup)
    .openPopup();
  lastPosition = [latitude, longitude];
  map.panTo(lastPosition);
}

function showDestination() {
  const lat = parseFloat(document.getElementById('destLat').value);
  const lng = parseFloat(document.getElementById('destLng').value);
  const info = document.getElementById('destInfo');
  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    info.textContent = 'Введіть коректні координати (широта −90…90, довгота −180…180)';
    return;
  }
  if (!map) initMap(lat, lng);
  if (destMarker) map.removeLayer(destMarker);
  destMarker = L.marker([lat, lng]).addTo(map).bindPopup(`<b>Пункт призначення</b><br>${lat}, ${lng}`).openPopup();
  map.flyTo([lat, lng], 14); // «прокрутка» карти до пункту призначення

  if (lastPosition) {
    const km = computeDistance({ latitude: lastPosition[0], longitude: lastPosition[1] }, { latitude: lat, longitude: lng });
    info.textContent = `Відстань від вас до пункту призначення: ${km.toFixed(2)} km`;
  }
}
