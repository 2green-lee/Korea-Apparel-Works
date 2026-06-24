import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "South Korea", coordinates: [127.7669, 35.9078] as [number, number] },
  { name: "USA", coordinates: [-95.7129, 37.0902] as [number, number] },
  { name: "Canada", coordinates: [-106.3468, 56.1304] as [number, number] },
  { name: "Europe", coordinates: [10.4515, 51.1657] as [number, number] },
  { name: "SE Asia", coordinates: [100.9925, 15.8700] as [number, number] },
];

const koreaCoord = markers[0].coordinates;
const targets = markers.slice(1);

const ExportMap = ({ className }: { className?: string }) => {
  return (
    <div className={`w-full max-w-[900px] mx-auto pb-20 pt-0 px-6 relative ${className || 'mt-[250px]'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
          Global Export Reach
        </h2>
        <p className="text-[15px] sm:text-lg text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
          Delivering premium Korean apparel manufacturing to brands across the world.
        </p>
      </div>

      <div className="relative w-full aspect-[2/1] min-h-[300px] bg-transparent rounded-3xl overflow-hidden p-0 md:p-4">
        <ComposableMap projectionConfig={{ scale: 175, rotate: [-137, 0, 0], center: [0, 30] }} width={800} height={400} className="w-full h-full">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#333333"
                  stroke="#4b4b4b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#404040" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {targets.map((target, idx) => (
            <Line
              key={idx}
              from={koreaCoord}
              to={target.coordinates}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeLinecap="round"
              className="export-line"
            />
          ))}

          {markers.map((marker, idx) => {
            const isKorea = idx === 0;
            const color = isKorea ? "#ef4444" : "#3b82f6"; // Red for Korea, Blue for targets
            return (
              <Marker key={idx} coordinates={marker.coordinates}>
                {/* Animated pulse circle */}
                <circle r={8} fill={color} opacity={0.3}>
                  <animate attributeName="r" from="4" to="16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Core circle */}
                <circle r={4} fill={color} />
                <text
                  textAnchor="middle"
                  y={isKorea ? 22 : -16} // Text above or below based on location
                  style={{ fontFamily: "Inter, sans-serif", fill: "#f3f4f6", fontSize: "15px", fontWeight: "700", letterSpacing: "0.5px" }}
                >
                  {marker.name}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .export-line {
          stroke-dasharray: 6 8;
          animation: march 2s linear infinite;
        }
        @keyframes march {
          from {
            stroke-dashoffset: 28;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}} />
    </div>
  );
};

export default ExportMap;
