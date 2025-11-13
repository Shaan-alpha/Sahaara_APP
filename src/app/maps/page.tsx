"use client";
import React, { useEffect, useState, useRef } from "react";
import { Search, X, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapsPage = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isOrange, setIsOrange] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    // Get the user's current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);

          // Initialize MapLibre GL map
          if (mapContainer.current && !map.current) {
            map.current = new maplibregl.Map({
              container: mapContainer.current,
              style: {
                version: 8,
                sources: {
                  osm: {
                    type: 'raster',
                    tiles: [
                      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    ],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap Contributors',
                  },
                },
                layers: [
                  {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm',
                  },
                ],
              },
              center: [lng, lat],
              zoom: 15,
            });

            // Add navigation controls
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            // Add marker at user's current location
            marker.current = new maplibregl.Marker({ color: '#3b82f6' })
              .setLngLat([lng, lat])
              .setPopup(new maplibregl.Popup().setHTML('<p>Your Location</p>'))
              .addTo(map.current);

            // Add 50m radius circle for geofencing visualization
            map.current.on('load', () => {
              if (map.current) {
                map.current.addSource('radius', {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'Point',
                      coordinates: [lng, lat],
                    },
                  },
                });

                // Add circle layer (50m radius visualization)
                map.current.addLayer({
                  id: 'radius-circle',
                  type: 'circle',
                  source: 'radius',
                  paint: {
                    'circle-radius': [
                      'interpolate',
                      ['exponential', 2],
                      ['zoom'],
                      0, 0,
                      20, 50
                    ],
                    'circle-color': '#3b82f6',
                    'circle-opacity': 0.2,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#3b82f6',
                  },
                });
              }
            });
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden shadow-lg">
      {/* Map Container */}
      <div className="relative flex-grow ">
        {/* MapLibre GL Map */}
        <div ref={mapContainer} style={{ height: "100%", width: "100%" }}></div>

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Link href="/">
            <button className="p-2 bg-white rounded-full shadow">
              <X size={20} />
            </button>
          </Link>
          <div className="flex space-x-2">
            <button className="p-2 bg-white rounded-full shadow">
              <MapPin size={20} />
            </button>
            <button className="p-2 bg-white rounded-full shadow">
              <Navigation size={20} />
            </button>
          </div>
        </div>


        {/* yello marker  */}
        <div  className={`orangemaps ${isOrange?"block":"hidden"} h-40 w-40 transition-all duration-1000 absolute top-[35%] left-[30%] rounded-full bg-orange-300/50`}></div>

        {/* Temperature */}
        <div className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow">
          16°
        </div>
      </div>

      {/* Bottom panel */}
      <div className="bg-white p-4 rounded-t-3xl -mt-4 shadow-lg">
        {/* Search bar */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 mt-2  mb-4">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search Maps"
            className="bg-transparent outline-none flex-grow"
          />
          <button className="text-gray-400 font-semibold">AA</button>
        </div>

        {/* Orange Zone */}
        <div className={`${isOrange ? "block" : "hidden"}`}>
          <h3 className="text-sm font-semibold mb-2">Mark Orange Zone</h3>
          <div className="flex items-center bg-orange-100 p-3 rounded-lg">
            <div className="bg-orange-500 rounded-full p-2 mr-3">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold">Orange Zone</p>
              <p className="text-sm text-gray-600">
                This area is marked as Orange
              </p>
            </div>
          </div>
        </div>

        {/* Mark orange Zone */}
        <div className={`${isOrange ? "hidden" : "block"}`}>
          <button
            onClick={() => setIsOrange(!isOrange)}
            className="bg-orange-500/40 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Feeling Unsafe Mark it Orange
          </button>
        </div>

        {/* Siri Suggestions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-2">Siri Suggestions</h3>
          <div className="flex items-center bg-blue-100 p-3 rounded-lg">
            <div className="bg-blue-500 rounded-full p-2 mr-3">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold">Parked Car</p>
              <p className="text-sm text-gray-600">
                290 m away, near ulica Krasnoarmejska
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsPage;
