// src/App.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import { database, ref, set, onValue } from './firebase';

// Fix icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function App() {
  const [myLocation, setMyLocation] = useState(null);
  const [friendLocation, setFriendLocation] = useState(null);

  // Send my live location to Firebase
  useEffect(() => {
    const updateMyLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const position = { latitude, longitude };
          setMyLocation([latitude, longitude]);

          // Save to Firebase
          set(ref(database, 'locations/myself'), position);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    };

    updateMyLocation();
    const interval = setInterval(updateMyLocation, 5000); // Every 5s
    return () => clearInterval(interval);
  }, []);

  // Read friend location from Firebase
  useEffect(() => {
    const friendRef = ref(database, 'locations/friend'); // friend uploads here
    onValue(friendRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFriendLocation([data.latitude, data.longitude]);
      }
    });
  }, []);

  return (
    <div className="App">
      <h1>Live Location Tracker</h1>
      {(myLocation || friendLocation) ? (
        <MapContainer center={myLocation || friendLocation} zoom={13} style={{ height: "500px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {myLocation && (
            <Marker position={myLocation}>
              <Popup>You (India)</Popup>
            </Marker>
          )}
          {friendLocation && (
            <Marker position={friendLocation}>
              <Popup>Friend (e.g., Dubai)</Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
}

export default App;
