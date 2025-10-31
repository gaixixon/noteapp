// src/utils/location.js
export default async function getLocation() {
  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve(`${latitude}, ${longitude}`);
        //resolve({ lat: latitude, lng: longitude });
      },
      (err) => reject(err)
    );
  });
}
