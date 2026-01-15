"use client";
import React, { useState, memo, useMemo } from "react";
import { useInstagramInsights } from "@/hooks/use-instagram-insights";
import {
  MapPin,
  Users2,
  TrendingUp,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building2,
  Layers,
  AlertCircle,
} from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

// GeoJSON URL for world map
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/**
 * Type definitions for audience demographics data
 * Following Zero-Patchwork protocol - types defined at file level
 */
type LocationData = {
  name: string;
  type: "country" | "state" | "city";
  coordinates: [number, number];
  percentage: number;
  value: number;
};

// Instagram insights demographic item shape
type DemographicItem = {
  dimension: string;
  percentage: number;
  value: number;
};

// Coordinate lookup for common locations (Instagram returns names, we need coordinates for map)
const LOCATION_COORDINATES: Record<
  string,
  { coordinates: [number, number]; type: "country" | "state" | "city" }
> = {
  // Countries
  India: { coordinates: [78.9629, 20.5937], type: "country" },
  "United States": { coordinates: [-95.7129, 37.0902], type: "country" },
  "United Kingdom": { coordinates: [-3.436, 55.3781], type: "country" },
  Canada: { coordinates: [-106.3468, 56.1304], type: "country" },
  Australia: { coordinates: [133.7751, -25.2744], type: "country" },
  Germany: { coordinates: [10.4515, 51.1657], type: "country" },
  France: { coordinates: [2.2137, 46.2276], type: "country" },
  Brazil: { coordinates: [-51.9253, -14.235], type: "country" },
  Japan: { coordinates: [138.2529, 36.2048], type: "country" },
  Indonesia: { coordinates: [113.9213, -0.7893], type: "country" },
  Pakistan: { coordinates: [69.3451, 30.3753], type: "country" },
  Bangladesh: { coordinates: [90.3563, 23.685], type: "country" },
  Nigeria: { coordinates: [8.6753, 9.082], type: "country" },
  Mexico: { coordinates: [-102.5528, 23.6345], type: "country" },
  Philippines: { coordinates: [121.774, 12.8797], type: "country" },
  UAE: { coordinates: [53.8478, 23.4241], type: "country" },
  "Saudi Arabia": { coordinates: [45.0792, 23.8859], type: "country" },
  "South Africa": { coordinates: [22.9375, -30.5595], type: "country" },
  // Indian Cities
  Mumbai: { coordinates: [72.8777, 19.076], type: "city" },
  Delhi: { coordinates: [77.1025, 28.7041], type: "city" },
  Bangalore: { coordinates: [77.5946, 12.9716], type: "city" },
  Bengaluru: { coordinates: [77.5946, 12.9716], type: "city" },
  Chennai: { coordinates: [80.2707, 13.0827], type: "city" },
  Hyderabad: { coordinates: [78.4867, 17.385], type: "city" },
  Kolkata: { coordinates: [88.3639, 22.5726], type: "city" },
  Pune: { coordinates: [73.8567, 18.5204], type: "city" },
  Jaipur: { coordinates: [75.7873, 26.9124], type: "city" },
  Ahmedabad: { coordinates: [72.5714, 23.0225], type: "city" },
  // US Cities
  "New York": { coordinates: [-74.006, 40.7128], type: "city" },
  "Los Angeles": { coordinates: [-118.2437, 34.0522], type: "city" },
  Chicago: { coordinates: [-87.6298, 41.8781], type: "city" },
  Houston: { coordinates: [-95.3698, 29.7604], type: "city" },
  "San Francisco": { coordinates: [-122.4194, 37.7749], type: "city" },
  // Other Cities
  London: { coordinates: [-0.1276, 51.5074], type: "city" },
  Toronto: { coordinates: [-79.3832, 43.6532], type: "city" },
  Sydney: { coordinates: [151.2093, -33.8688], type: "city" },
  Melbourne: { coordinates: [144.9631, -37.8136], type: "city" },
  Dubai: { coordinates: [55.2708, 25.2048], type: "city" },
  Singapore: { coordinates: [103.8198, 1.3521], type: "city" },
  Berlin: { coordinates: [13.405, 52.52], type: "city" },
  Paris: { coordinates: [2.3522, 48.8566], type: "city" },
  Tokyo: { coordinates: [139.6917, 35.6895], type: "city" },
  // Indian States
  Maharashtra: { coordinates: [75.7139, 19.7515], type: "state" },
  Karnataka: { coordinates: [75.7139, 15.3173], type: "state" },
  "Tamil Nadu": { coordinates: [78.6569, 11.1271], type: "state" },
  Gujarat: { coordinates: [71.1924, 22.2587], type: "state" },
  "West Bengal": { coordinates: [87.855, 22.9868], type: "state" },
  Telangana: { coordinates: [79.0193, 18.1124], type: "state" },
  Rajasthan: { coordinates: [74.2179, 27.0238], type: "state" },
  "Uttar Pradesh": { coordinates: [80.9462, 26.8467], type: "state" },
  Kerala: { coordinates: [76.2711, 10.8505], type: "state" },
  // US States
  California: { coordinates: [-119.4179, 36.7783], type: "state" },
  Texas: { coordinates: [-99.9018, 31.9686], type: "state" },
  Florida: { coordinates: [-81.5158, 27.6648], type: "state" },
  "New York State": { coordinates: [-75.4999, 43.2994], type: "state" },
};

// Uniform dot size
const DOT_SIZE = 8;
const DOT_SIZE_HOVER = 12;

// Get marker color based on percentage (heat map style intensity)
const getMarkerColor = (
  percentage: number
): { fill: string; stroke: string; glow: string } => {
  if (percentage >= 10)
    return {
      fill: "#7C3AED",
      stroke: "#5B21B6",
      glow: "rgba(139, 92, 246, 0.6)",
    };
  if (percentage >= 5)
    return {
      fill: "#8B5CF6",
      stroke: "#6D28D9",
      glow: "rgba(139, 92, 246, 0.4)",
    };
  if (percentage >= 3)
    return {
      fill: "#A78BFA",
      stroke: "#7C3AED",
      glow: "rgba(167, 139, 250, 0.3)",
    };
  return {
    fill: "#C4B5FD",
    stroke: "#A78BFA",
    glow: "rgba(196, 181, 253, 0.2)",
  };
};

// Age group colors
const ageColors = [
  "#8B5CF6",
  "#A78BFA",
  "#6366F1",
  "#818CF8",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
];

// Gender colors
const genderColors = ["#3B82F6", "#EC4899", "#8B5CF6"];

const AudienceDemographics = () => {
  const { data: insights, isLoading, isError } = useInstagramInsights();
  const [position, setPosition] = useState<{
    coordinates: [number, number];
    zoom: number;
  }>({
    coordinates: [40, 20],
    zoom: 1.2,
  });
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cities" | "states" | "all">("all");

  const audience = insights?.status === 200 ? insights.data?.audience : null;
  const hasData =
    audience &&
    (audience.followerDemographics.length > 0 ||
      audience.reachedDemographics.length > 0 ||
      audience.engagedDemographics.length > 0);

  // Convert API demographics to map locations
  const locationData = useMemo<LocationData[]>(() => {
    if (!audience?.followerDemographics) return [];

    return (audience.followerDemographics as DemographicItem[])
      .filter((d) => LOCATION_COORDINATES[d.dimension])
      .map((d) => ({
        name: d.dimension,
        type: LOCATION_COORDINATES[d.dimension].type,
        coordinates: LOCATION_COORDINATES[d.dimension].coordinates,
        percentage: d.percentage,
        value: d.value,
      }))
      .filter(
        (loc) =>
          viewMode === "all" ||
          loc.type === (viewMode.slice(0, -1) as "city" | "state") // 'cities' -> 'city'
      );
  }, [audience, viewMode]);

  // Age data from API - typed using file-level DemographicItem
  const ageData: DemographicItem[] =
    (audience?.reachedDemographics as DemographicItem[]) || [];

  // Gender data from API - typed using file-level DemographicItem
  const genderData: DemographicItem[] =
    (audience?.engagedDemographics as DemographicItem[]) || [];

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 0.8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [40, 20], zoom: 1.2 });
  };

  const handleMoveEnd = (position: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    setPosition(position);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 h-96 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
            <div className="space-y-4">
              <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
              <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
              <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!hasData) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-6">
          <Users2 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audience Demographics
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Demographics Data
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {isError
              ? "Unable to fetch insights. Please check your Instagram connection."
              : "Demographics data will appear here once your Instagram account is connected and has the required permissions (instagram_manage_insights)."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Audience Demographics
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("cities")}
              className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "cities"
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Building2 className="w-3 h-3" />
              Cities
            </button>
            <button
              onClick={() => setViewMode("states")}
              className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "states"
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Layers className="w-3 h-3" />
              States
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                viewMode === "all"
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* World Map */}
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-900 border border-gray-200 dark:border-neutral-700 min-h-[400px]">
          {/* Zoom Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120,
              rotate: [-10, 0, 0],
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              minZoom={0.8}
              maxZoom={12}
              translateExtent={[
                [-500, -300],
                [1500, 700],
              ]}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: "#C7D2FE",
                          stroke: "#818CF8",
                          strokeWidth: 0.4,
                          outline: "none",
                        },
                        hover: {
                          fill: "#A5B4FC",
                          stroke: "#6366F1",
                          strokeWidth: 0.6,
                          outline: "none",
                        },
                        pressed: { fill: "#818CF8", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Dot Markers */}
              {locationData.map((location) => {
                const colors = getMarkerColor(location.percentage);
                const isHovered = hoveredLocation === location.name;

                return (
                  <Marker
                    key={location.name}
                    coordinates={location.coordinates}
                    onMouseEnter={() => setHoveredLocation(location.name)}
                    onMouseLeave={() => setHoveredLocation(null)}
                  >
                    <circle
                      r={isHovered ? DOT_SIZE_HOVER + 6 : DOT_SIZE + 4}
                      fill={colors.glow}
                      style={{ transition: "all 0.2s ease" }}
                    />
                    <circle
                      r={isHovered ? DOT_SIZE_HOVER : DOT_SIZE}
                      fill={colors.fill}
                      stroke={isHovered ? "#FFF" : colors.stroke}
                      strokeWidth={isHovered ? 2 : 1}
                      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                    />
                    <circle
                      r={isHovered ? 3 : 2}
                      fill="rgba(255, 255, 255, 0.5)"
                      style={{ pointerEvents: "none" }}
                    />
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Hover Tooltip */}
          {hoveredLocation &&
            (() => {
              const loc = locationData.find((l) => l.name === hoveredLocation);
              if (!loc) return null;
              return (
                <div className="absolute top-3 left-3 z-10 px-4 py-3 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-200 dark:border-neutral-700 min-w-[180px]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      {hoveredLocation}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        loc.type === "city"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : loc.type === "state"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {loc.type.charAt(0).toUpperCase() + loc.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Audience
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {loc.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Followers
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ~{loc.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })()}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-lg px-3 py-2 text-xs border border-gray-200 dark:border-neutral-700">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Intensity:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-300" />
              <span className="text-gray-600 dark:text-gray-400">&lt;3%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-gray-600 dark:text-gray-400">3-5%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-gray-600 dark:text-gray-400">5-10%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span className="text-gray-600 dark:text-gray-400">&gt;10%</span>
            </div>
          </div>

          {/* No map data notice */}
          {locationData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No location data available for map
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Age Distribution */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 mb-4">
              <Users2 className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Age Distribution
              </h4>
            </div>

            {ageData.length > 0 ? (
              <div className="space-y-2">
                {ageData.map((item, i) => (
                  <div key={item.dimension} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                      {item.dimension}
                    </span>
                    <div className="flex-1 h-5 bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (item.percentage / 40) * 100,
                            100
                          )}%`,
                          backgroundColor: ageColors[i % ageColors.length],
                        }}
                      >
                        <span className="text-[10px] font-semibold text-white">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No age data available
              </p>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-pink-500" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Gender Split
              </h4>
            </div>

            {genderData.length > 0 ? (
              <>
                <div className="h-8 rounded-full overflow-hidden flex">
                  {genderData.map((item, i) => (
                    <div
                      key={item.dimension}
                      className="h-full flex items-center justify-center transition-all"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: genderColors[i % genderColors.length],
                      }}
                    >
                      {item.percentage > 10 && (
                        <span className="text-xs font-bold text-white">
                          {Math.round(item.percentage)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-3">
                  {genderData.map((item, i) => (
                    <div
                      key={item.dimension}
                      className="flex items-center gap-1.5"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            genderColors[i % genderColors.length],
                        }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.dimension}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No gender data available
              </p>
            )}
          </div>

          {/* Top Locations List */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="w-4 h-4 text-purple-500" />
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Top Locations
              </h4>
            </div>
            {audience?.followerDemographics &&
            audience.followerDemographics.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(audience.followerDemographics as DemographicItem[])
                  .slice(0, 8)
                  .map((item, i) => (
                    <div
                      key={item.dimension}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                        hoveredLocation === item.dimension
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : "hover:bg-gray-100 dark:hover:bg-neutral-700/50"
                      }`}
                      onMouseEnter={() => setHoveredLocation(item.dimension)}
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[90px]">
                          {item.dimension}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No location data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(AudienceDemographics);
