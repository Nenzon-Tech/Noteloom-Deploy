import React from "react";

const LiquidGlassSVGFilter = () => {
  return (
    <svg className="hidden" aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="liquid-glass-distortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
};

export default LiquidGlassSVGFilter;