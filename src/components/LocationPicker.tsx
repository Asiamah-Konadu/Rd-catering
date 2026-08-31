"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Search, Check, AlertCircle, X } from "lucide-react";

export type LocationData = {
  address: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
};

interface LocationPickerProps {
  initialAddress?: string;
  initialCity?: string;
  initialRegion?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (location: LocationData) => void;
  onClose?: () => void;
}

// Default center: Accra, Ghana
const DEFAULT_CENTER = { lat: 5.6037, lng: -0.1870 };

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMapsScript?: () => void;
  }
}

export function LocationPicker({
  initialAddress = "",
  initialCity = "Accra",
  initialRegion = "Greater Accra",
  initialLat,
  initialLng,
  onSelect,
  onClose,
}: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentLat, setCurrentLat] = useState<number>(initialLat || DEFAULT_CENTER.lat);
  const [currentLng, setCurrentLng] = useState<number>(initialLng || DEFAULT_CENTER.lng);
  const [address, setAddress] = useState<string>(initialAddress);
  const [city, setCity] = useState<string>(initialCity || "Accra");
  const [region, setRegion] = useState<string>(initialRegion || "Greater Accra");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Google Maps instances references
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Reverse geocode via Google Geocoder
  const reverseGeocodeGoogle = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const place = results[0];
        const formatted = place.formatted_address || "";
        setAddress(formatted);

        let parsedCity = "Accra";
        let parsedRegion = "Greater Accra";

        for (const comp of place.address_components) {
          if (comp.types.includes("locality") || comp.types.includes("sublocality") || comp.types.includes("administrative_area_level_2")) {
            parsedCity = comp.long_name;
          }
          if (comp.types.includes("administrative_area_level_1")) {
            parsedRegion = comp.long_name;
          }
        }
        setCity(parsedCity);
        setRegion(parsedRegion);
      }
    });
  }, []);

  // Reverse geocode via OpenStreetMap Nominatim for fallback when no Google Key
  const reverseGeocodeOsm = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
        const addressObj = data.address || {};
        const parsedCity = addressObj.city || addressObj.town || addressObj.suburb || addressObj.county || "Accra";
        const parsedRegion = addressObj.state || addressObj.region || "Greater Accra";
        setCity(parsedCity);
        setRegion(parsedRegion);
      }
    } catch {
      // Ignore geocode error in fallback
    }
  }, []);

  // Set marker and center map
  const updatePosition = useCallback((lat: number, lng: number, updateAddress = true) => {
    setCurrentLat(lat);
    setCurrentLng(lng);

    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat, lng });
    }
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }

    if (updateAddress) {
      if (apiKey && geocoderRef.current) {
        reverseGeocodeGoogle(lat, lng);
      } else {
        reverseGeocodeOsm(lat, lng);
      }
    }
  }, [apiKey, reverseGeocodeGoogle, reverseGeocodeOsm]);

  // Load Google Maps API Script
  useEffect(() => {
    if (!apiKey) {
      setMapLoaded(true);
      return;
    }

    if (window.google?.maps) {
      initGoogleMap();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleMap();
      };
      script.onerror = () => {
        setLoadError("Could not load Google Maps. Switched to coordinates picker.");
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", initGoogleMap);
    }

    function initGoogleMap() {
      if (!mapRef.current || !window.google?.maps) return;

      const center = { lat: currentLat, lng: currentLng };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      googleMapRef.current = map;
      geocoderRef.current = new window.google.maps.Geocoder();

      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: "Delivery Location",
      });

      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) {
          updatePosition(pos.lat(), pos.lng(), true);
        }
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updatePosition(e.latLng.lat(), e.latLng.lng(), true);
        }
      });

      if (inputRef.current && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "gh" },
          fields: ["address_components", "geometry", "formatted_address", "name"],
        });
        autocompleteRef.current = autocomplete;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setAddress(place.formatted_address || place.name || "");
            
            let parsedCity = "Accra";
            let parsedRegion = "Greater Accra";
            if (place.address_components) {
              for (const comp of place.address_components) {
                if (comp.types.includes("locality") || comp.types.includes("sublocality") || comp.types.includes("administrative_area_level_2")) {
                  parsedCity = comp.long_name;
                }
                if (comp.types.includes("administrative_area_level_1")) {
                  parsedRegion = comp.long_name;
                }
              }
            }
            setCity(parsedCity);
            setRegion(parsedRegion);
            updatePosition(lat, lng, false);
          }
        });
      }

      setMapLoaded(true);
    }
  }, [apiKey, currentLat, currentLng, updatePosition]);

  // Handle GPS button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updatePosition(lat, lng, true);
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fallback search using Nominatim
  const handleFallbackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ", Ghana"
        )}&format=json&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setAddress(data[0].display_name);
          updatePosition(lat, lng, true);
        } else {
          alert("Location not found. Please try a different landmark or street.");
        }
      }
    } catch {
      alert("Search failed. Please enter your address manually.");
    }
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      alert("Please specify or confirm your delivery address.");
      return;
    }
    onSelect({
      address: address.trim(),
      city: city.trim() || "Accra",
      region: region.trim() || "Greater Accra",
      latitude: currentLat,
      longitude: currentLng,
    });
    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-w-2xl w-full max-h-[90vh]">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base">Select Delivery Location</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toolbar / Search & GPS */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {apiKey ? (
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search area, landmark or street in Ghana..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          ) : (
            <form onSubmit={handleFallbackSearch} className="relative flex-1 flex gap-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search landmark or area (e.g. Osu, East Legon)..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Search
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
            {isLocating ? "Locating..." : "Use My GPS"}
          </button>
        </div>

        {loadError && (
          <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="relative w-full h-72 sm:h-80 bg-slate-100">
        {apiKey ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full relative">
            {/* Embedded interactive OpenStreetMap iframe / pin locator */}
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.008}%2C${currentLat - 0.008}%2C${currentLng + 0.008}%2C${currentLat + 0.008}&layer=mapnik&marker=${currentLat}%2C${currentLng}`}
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 text-[11px] text-slate-700 font-medium">
              📍 Lat: {currentLat.toFixed(5)}, Lng: {currentLng.toFixed(5)}
            </div>
          </div>
        )}

        {!mapLoaded && apiKey && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80">
            <span className="text-xs text-slate-500 font-medium animate-pulse">
              Loading Google Maps...
            </span>
          </div>
        )}
      </div>

      {/* Selected Address Preview & Confirmation */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 block">
            Selected Delivery Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Detailed street address, house/building #, or landmark"
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              City / Town
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 font-mono">
            GPS: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Check className="w-4 h-4" />
            Confirm This Location
          </button>
        </div>
      </div>
    </div>
  );
}
