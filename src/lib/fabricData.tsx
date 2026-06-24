import React from 'react';

export const fabricsData = [
  { id: "mesh", name: "MESH", desc: "An outstandingly fast sweat-wicking and refreshing mesh fabric featuring a hole structure that maximizes air circulation. It perfectly serves high-performance sports and daily casual outerwear in hot, humid climates." },
  { id: "jersey", name: "JERSEY", desc: "A functional single jersey with excellent surface retention and firm bounce-back. Free from distortion along the stretch axis, it is ideal for high-class activewear and t-shirts to minimize sagging on necklines or elbows." },
  { id: "flat-back-rib", name: "FLAT BACK RIB", desc: "A high-performance rib fabric with a dense ribbed structure that is flat-woven on the back for maximum security and excellent stretch. High pilling resistance makes it optimal for premium sportswear necks and cuffs." },
  { id: "pique", name: "PIQUE", desc: "A heritage pique fabric with a sophisticated honeycomb texture. It stays clear of the skin to maintain dryness, standing as the primary choice for luxury polo shirts and casual tennis wear." },
  { id: "interlock", name: "INTERLOCK", desc: "A double-sided interlock fabric offering an ultra-smooth touch and uniform weave with no distinction between front and back. Biowashed and silket-finished, it delivers a subtle silk-like luster perfect for premium loungewear and sweatshirts." },
  { id: "jacquard", name: "JACQUARD", desc: "A high-end jacquard fabric where patterns are physically woven into the structure rather than printed. The fabric itself carries deep silhouettes and volume, bringing a luxury collection mood with a single garment." },
  { id: "stripe", name: "STRIPE", desc: "A modern knit with stripes and colors precision-dyed before weaving for perfect line spacing and color fastness. Resistant to bleeding or fading after washes, it retains its timeless French marine aesthetic." },
  { id: "others", name: "OTHERS", desc: "Various other specialty fabrics and customized weaves built to your direct design requirements and styling instructions." }
];

export const getFabricPatternSvg = (id: string, nameEng: string) => {
  switch (id) {
    case "mesh":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="mesh_pat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.2" fill="#10b981" fillOpacity="0.4" />
              <rect x="0" y="0" width="8" height="8" fill="none" stroke="#e5e5e5" strokeWidth="0.5" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#mesh_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "jersey":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="jersey_pat" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="3" x2="6" y2="3" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="3" y1="0" x2="3" y2="6" stroke="#94a3b8" strokeWidth="0.3" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#jersey_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "flat-back-rib":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="rib_pat" x="0" y="0" width="12" height="6" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="6" height="6" fill="#f8fafc" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="6" y1="0" x2="6" y2="6" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#rib_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="monospace" letterSpacing="0.12em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "pique":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="pique_pat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height="5" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="5" y="5" width="5" height="5" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              <circle cx="2.5" cy="2.5" r="1.2" fill="#64748b" />
              <circle cx="7.5" cy="7.5" r="1.2" fill="#64748b" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#pique_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "interlock":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="interlock_pat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="5" x2="10" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="5" y1="0" x2="5" y2="10" stroke="#cbd5e1" strokeWidth="0.5" />
              <circle cx="5" cy="5" r="1" fill="#475569" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#interlock_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "jacquard":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="jacquard_pat" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 8 Q 4 12, 8 8 T 16 8" fill="none" stroke="#64748b" strokeWidth="0.5" />
              <path d="M0 16 Q 4 12, 8 16 T 16 16" fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#jacquard_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "stripe":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="stripe_pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="10" fill="#0f172a" fillOpacity="0.85" />
              <rect x="0" y="10" width="20" height="10" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#stripe_pat)" />
          <rect x="35" y="28" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.95" />
          <text x="100" y="44" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "others":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="others_pat" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.5" fill="#475569" fillOpacity="0.3" />
              <rect x="0" y="0" width="16" height="16" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#others_pat)" />
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    default:
      return null;
  }
};
