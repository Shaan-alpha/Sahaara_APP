"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Navigation,
  Home,
  Calendar,
  User,
  Users,
  UserCircle,
} from "lucide-react";
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
                    type: "raster",
                    tiles: [
                      "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    ],
                    tileSize: 256,
                    attribution: "&copy; OpenStreetMap Contributors",
                  },
                },
                layers: [
                  {
                    id: "osm",
                    type: "raster",
                    source: "osm",
                  },
                ],
              },
              center: [lng, lat],
              zoom: 15,
            });

            // Add navigation controls
            map.current.addControl(
              new maplibregl.NavigationControl(),
              "top-right",
            );

            // Add marker at user's current location
            marker.current = new maplibregl.Marker({ color: "#3b82f6" })
              .setLngLat([lng, lat])
              .setPopup(new maplibregl.Popup().setHTML("<p>Your Location</p>"))
              .addTo(map.current);

            // Add radius circle for geofencing visualization
            const trackingRadius = Number(process.env.NEXT_PUBLIC_TRACKING_RADIUS) || 500;
            map.current.on("load", () => {
              if (map.current) {
                map.current.addSource("radius", {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: {
                      type: "Point",
                      coordinates: [lng, lat],
                    },
                  },
                });

                // Add circle layer (radius visualization)
                map.current.addLayer({
                  id: "radius-circle",
                  type: "circle",
                  source: "radius",
                  paint: {
                    "circle-radius": [
                      "interpolate",
                      ["exponential", 2],
                      ["zoom"],
                      0,
                      0,
                      20,
                      trackingRadius,
                    ],
                    "circle-color": "#3b82f6",
                    "circle-opacity": 0.2,
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#3b82f6",
                  },
                });
              }
            });
          }
        },
        (error) => {
          console.error("Error fetching location: ", error);
        },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="relative flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-white sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden">
        {/* Map fills upper portion */}
        <div className="relative flex-grow min-h-0">
          {/* MapLibre GL Map */}
          <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />

          {/* Orange zone overlay */}
          <div
            className={`orangemaps ${isOrange ? "block" : "hidden"} h-40 w-40 transition-all duration-1000 absolute top-[35%] left-[30%] rounded-full bg-orange-300/50`}
          />

          {/* ── Top controls ── */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            {/* Back */}
            <Link href="/" className="pointer-events-auto">
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition-all">
                <X size={18} className="text-gray-700" />
              </button>
            </Link>
            {/* Right cluster */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition-all">
                <MapPin size={18} className="text-gray-700" />
              </button>
              <button className="w-10 h-10 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all">
                <Navigation size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Temperature badge */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold shadow-md text-gray-700">
            16° ☀️
          </div>
        </div>

        {/* ── Bottom sheet ── */}
        <div className="bg-white rounded-t-[2rem] -mt-6 shadow-2xl px-5 pt-3 pb-5 border-t border-gray-100 shrink-0">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />

          {/* Search bar */}
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
            <Search size={18} className="text-gray-400 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search Maps"
              className="bg-transparent outline-none flex-grow text-sm text-gray-700 placeholder-gray-400"
            />
            <button className="text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors">
              AA
            </button>
          </div>

          {/* Orange Zone active */}
          <div className={`${isOrange ? "block" : "hidden"} mb-3`}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Active Zone
            </h3>
            <div className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-2xl">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-800 text-sm">
                  Orange Zone
                </p>
                <p className="text-xs text-orange-500">
                  This area is marked as unsafe
                </p>
              </div>
            </div>
          </div>

          {/* Mark orange Zone button */}
          <div className={`${isOrange ? "hidden" : "block"} mb-3`}>
            <button
              onClick={() => setIsOrange(!isOrange)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white rounded-2xl font-semibold text-sm shadow-md active:scale-[0.97] transition-all"
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                ⚠️
              </div>
              <span>Feeling Unsafe? Mark it Orange</span>
            </button>
          </div>

          {/* Siri Suggestions */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Nearby
            </h3>
            <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Parked Car
                </p>
                <p className="text-xs text-gray-500">
                  290 m away, near ulica Krasnoarmejska
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Navigation Bar ── */}
        <nav className="bg-white border-t border-gray-100 px-4 pt-2 pb-3 safe-pb shrink-0">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <Link href="/">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Home
                </span>
              </li>
            </Link>
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-blue-50 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">
                Visits
              </span>
            </li>
            <Link href="/contacts">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Contacts
                </span>
              </li>
            </Link>
            <Link href="/friends">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Friends
                </span>
              </li>
            </Link>
            <Link href="/profile">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Profile
                </span>
              </li>
            </Link>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MapsPage;
