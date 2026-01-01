'use client'

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useTheme } from '@/contexts/theme-context'
import { motion } from 'framer-motion'

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

interface LocationMarker {
  name: string
  coordinates: [number, number]
  percentage: number
}

const markers: LocationMarker[] = [
  // North America
  { name: 'USA', coordinates: [-95, 40], percentage: 6 },
  { name: 'New York', coordinates: [-74, 40.7], percentage: 5 },
  { name: 'Toronto', coordinates: [-79.3, 43.6], percentage: 3 },
  { name: 'Mexico City', coordinates: [-99.1, 19.4], percentage: 4 },
  
  // South America
  { name: 'São Paulo', coordinates: [-46.6, -23.5], percentage: 4 },
  { name: 'Lima', coordinates: [-77.0, -12.0], percentage: 2 },
  { name: 'Santiago', coordinates: [-70.6, -33.4], percentage: 3 },
  { name: 'Buenos Aires', coordinates: [-58.3, -34.6], percentage: 3 },

  // Europe
  { name: 'Europe', coordinates: [10, 50], percentage: 6 },
  { name: 'London', coordinates: [-0.12, 51.5], percentage: 4 },
  { name: 'Paris', coordinates: [2.3, 48.8], percentage: 3 },
  { name: 'Berlin', coordinates: [13.4, 52.5], percentage: 3 },
  { name: 'Moscow', coordinates: [37.6, 55.7], percentage: 4 },

  // Africa
  { name: 'Cape Town', coordinates: [18.4, -33.9], percentage: 2 },
  { name: 'Lagos', coordinates: [3.3, 6.5], percentage: 3 },
  { name: 'Cairo', coordinates: [31.2, 30.0], percentage: 2 },
  { name: 'Nairobi', coordinates: [36.8, -1.2], percentage: 2 },

  // Middle East
  { name: 'Dubai', coordinates: [55.2, 25.2], percentage: 3 },
  
  // Asia
  { name: 'India', coordinates: [78, 22], percentage: 10 },
  { name: 'Southeast Asia', coordinates: [110, 5], percentage: 13 },
  { name: 'Tokyo', coordinates: [139.6, 35.6], percentage: 7 },
  { name: 'Beijing', coordinates: [116.4, 39.9], percentage: 8 },
  { name: 'Seoul', coordinates: [126.9, 37.5], percentage: 5 },
  { name: 'Jakarta', coordinates: [106.8, -6.2], percentage: 4 },
  { name: 'Bangkok', coordinates: [100.5, 13.7], percentage: 3 },

  // Oceania
  { name: 'Sydney', coordinates: [151.2, -33.8], percentage: 3 },
  { name: 'Auckland', coordinates: [174.7, -36.8], percentage: 2 },
]

export default function WorldMap() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 10]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={isDark ? "#3d3d5c" : "#c7d2fe"}
                stroke={isDark ? "#555" : "#a5b4fc"}
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { fill: isDark ? '#4a4a6a' : '#a5b4fc', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        
        {markers.map((marker, i) => (
          <Marker key={marker.name} coordinates={marker.coordinates}>
            <motion.circle 
              initial={{ r: 0, opacity: 0 }}
              whileInView={{ r: marker.percentage * 1.2, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: 1.5 + (i * 0.15),
                type: "spring",
                bounce: 0.5
              }}
              fill="rgba(168, 85, 247, 0.7)" 
              stroke="rgba(168, 85, 247, 0.9)"
              strokeWidth={1}
            />
            <motion.text
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: marker.percentage > 8 ? 4 : 3 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5 + (i * 0.15) + 0.4 }}
              textAnchor="middle"
              style={{ 
                fontFamily: 'system-ui', 
                fill: isDark ? '#fff' : '#1f2937',
                fontSize: marker.percentage > 8 ? '10px' : '8px',
                fontWeight: 600
              }}
            >
              {marker.percentage}%
            </motion.text>
          </Marker>
        ))}
      </ComposableMap>
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button className="w-7 h-7 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-sm">+</button>
        <button className="w-7 h-7 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-sm">−</button>
        <button className="w-7 h-7 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white text-sm">↻</button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm">
        <span className="text-gray-500 dark:text-neutral-400 text-xs font-medium">Size:</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <div className="w-2 h-2 bg-purple-400/50 rounded-full" /> &lt;2%
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <div className="w-3 h-3 bg-purple-500/60 rounded-full" /> 2-5%
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <div className="w-4 h-4 bg-purple-600/70 rounded-full" /> &gt;5%
        </span>
      </div>
    </div>
  )
}
