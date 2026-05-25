import { useState, useEffect } from 'react';

export default function useLocation() {
  const [coords, setCoords] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    });
  }, []);

  return coords;
}
