import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile: wider view with less rotation so all continents fit without clipping
  const projectionConfig = isMobile
    ? { scale: 220, rotate: [-142, 0, 0] as [number, number, number], center: [0, 20] as [number, number] }
    : { scale: 175, rotate: [-137, 0, 0] as [number, number, number], center: [0, 30] as [number, number] };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-50px" }} 
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`w-full max-w-[900px] mx-auto pb-20 pt-0 px-2 lg:px-6 relative ${className || 'mt-[250px]'}`}
    >
      <div className="text-center mb-8 lg:mb-12">
        <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 flex items-start justify-center gap-3 lg:gap-5 z-10">
          <span className="text-center">Global Export Reach</span>
        </h2>
        <p className="text-[15px] sm:text-lg lg:text-[20px] text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
          This is how we supply worldwide.
        </p>
      </div>

      <div className="relative w-full bg-transparent rounded-3xl p-0 lg:p-4">
        <ComposableMap
          projectionConfig={projectionConfig}
          width={800}
          height={isMobile ? 500 : 400}
          className="w-full h-auto"
        >
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
            const color = isKorea ? "#ef4444" : "#3b82f6";
            return (
              <Marker key={idx} coordinates={marker.coordinates}>
                <circle r={8} fill={color} opacity={0.3}>
                  <animate attributeName="r" from="4" to="16" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle r={4} fill={color} />
                <text
                  textAnchor="middle"
                  y={isKorea ? 22 : -16}
                  style={{ fontFamily: "Inter, sans-serif", fill: "#f3f4f6", fontSize: isMobile ? "17px" : "15px", fontWeight: "700", letterSpacing: "0.5px" }}
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
    </motion.div>
  );
};

export default ExportMap;
