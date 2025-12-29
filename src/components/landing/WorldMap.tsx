'use client'

import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useTheme } from '@/contexts/theme-context'

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

interface LocationMarker {
  name: string
  coordinates: [number, number]
  percentage: number
}

const markers: LocationMarker[] = [
  { name: 'USA', coordinates: [-95, 40], percentage: 6 },
  { name: 'Europe', coordinates: [10, 50], percentage: 6 },
  { name: 'India', coordinates: [78, 22], percentage: 10 },
  { name: 'Southeast Asia', coordinates: [110, 5], percentage: 13 },
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
          center: [40, 20]
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
        
        {markers.map((marker) => (
          <Marker key={marker.name} coordinates={marker.coordinates}>
            <circle 
              r={marker.percentage * 1.2} 
              fill="rgba(147, 51, 234, 0.6)" 
              stroke="rgba(147, 51, 234, 0.8)"
              strokeWidth={1}
              className="animate-pulse"
            />
            <text
              textAnchor="middle"
              y={marker.percentage > 8 ? 4 : 3}
              style={{ 
                fontFamily: 'system-ui', 
                fill: '#fff',
                fontSize: marker.percentage > 8 ? '10px' : '8px',
                fontWeight: 500
              }}
            >
              {marker.percentage}%
            </text>
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
      <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-gray-200/90 dark:bg-neutral-800/90 px-4 py-2 rounded-lg">
        <span className="text-gray-500 dark:text-neutral-400 text-xs">Size:</span>
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
