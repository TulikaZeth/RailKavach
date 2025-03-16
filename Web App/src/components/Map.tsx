'use client';
import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface HeatmapPoint {
  location: [number, number]; // [longitude, latitude]
  weight: number;
  details: {
    cameraId: string;
    detections: number;
    animalTypes: Record<string, number>;
    railwaySection: string;
  };
}

interface MapProps {
  heatmapData: HeatmapPoint[];
  center: [number, number];
  zoom: number;
}

export default function Map({ heatmapData, center, zoom }: MapProps) {
  const mapRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletLoaded = useRef(false);

  // Function to format popup content
  const formatPopupContent = (point: HeatmapPoint) => {
    const animalList = Object.entries(point.details.animalTypes)
      .map(([animal, count]) => `<li>${animal}: ${count}</li>`)
      .join('');
    
    return `
      <div style="min-width: 200px;">
        <h3 style="margin-bottom: 8px; font-weight: bold;">Camera: ${point.details.cameraId}</h3>
        <p><strong>Railway Section:</strong> ${point.details.railwaySection}</p>
        <p><strong>Total Detections:</strong> ${point.details.detections}</p>
        <p><strong>Coordinates:</strong> ${point.location[1].toFixed(4)}, ${point.location[0].toFixed(4)}</p>
        <div style="margin-top: 8px;">
          <p><strong>Animals Detected:</strong></p>
          <ul style="padding-left: 20px; margin-top: 5px;">
            ${animalList}
          </ul>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    // Dynamically import Leaflet since it's a client-side library
    if (!leafletLoaded.current && typeof window !== 'undefined') {
      const loadMap = async () => {
        const L = await import('leaflet');
        const heatLayer = await import('leaflet.heat');
        
        if (!containerRef.current || leafletLoaded.current) return;
        
        // Initialize the map
        const map = L.map(containerRef.current).setView(
          [center[1], center[0]], // Leaflet uses [lat, lng] format
          zoom
        );
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
        
        // Create a layer for markers
        const markersLayer = L.layerGroup().addTo(map);
        
        // Format data for heat layer
        const heatData = heatmapData.map(point => [
          point.location[1], // latitude
          point.location[0], // longitude
          point.weight
        ]);
        
        // Create heat layer
        const heat = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        }).addTo(map);
        
        // Add markers with popups for each camera location
        heatmapData.forEach(point => {
          const marker = L.circleMarker(
            [point.location[1], point.location[0]],
            {
              radius: 5,
              fillColor: "#3388ff",
              color: "#fff",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            }
          );
          
          marker.bindPopup(formatPopupContent(point));
          marker.addTo(markersLayer);
        });
        
        // Add a scale control
        L.control.scale().addTo(map);
        
        // Save references
        mapRef.current = map;
        heatLayerRef.current = heat;
        markersLayerRef.current = markersLayer;
        leafletLoaded.current = true;
        
        // Handle resize
        const handleResize = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
          if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            leafletLoaded.current = false;
          }
        };
      };
      
      loadMap();
    }
  }, []); // Run only once on component mount

  // Update map when data changes
  useEffect(() => {
    if (!mapRef.current || !heatLayerRef.current || !markersLayerRef.current) return;
    
    const L = require('leaflet');
    
    // Update center and zoom if provided
    mapRef.current.setView([center[1], center[0]], zoom);
    
    // Update heat layer data
    const heatData = heatmapData.map(point => [
      point.location[1], // latitude
      point.location[0], // longitude
      point.weight
    ]);
    
    heatLayerRef.current.setLatLngs(heatData);
    
    // Clear and recreate markers
    markersLayerRef.current.clearLayers();
    
    heatmapData.forEach(point => {
      const marker = L.circleMarker(
        [point.location[1], point.location[0]],
        {
          radius: 5,
          fillColor: "#3388ff",
          color: "#fff",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }
      );
      
      marker.bindPopup(formatPopupContent(point));
      marker.addTo(markersLayerRef.current);
    });
    
  }, [heatmapData, center, zoom]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-md overflow-hidden"
      style={{ position: 'relative' }}
    >
      {heatmapData.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
        >
          <p className="text-gray-500">No data available for the selected filters</p>
        </div>
      )}
    </div>
  );
}