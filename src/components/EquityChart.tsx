interface ChartPoint {
  0: number; // year fraction
  1: number; // compounded equity
}

export function EquityChart({ data, period = "8yr" }: { data: ChartPoint[]; period?: string }) {
  const W = 800;
  const H = 240;
  const P = 24;

  const xs = data.map((d) => d[0]);
  const ys = data.map((d) => d[1]);
  
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const fx = (x: number) => P + ((x - xMin) / (xMax - xMin)) * (W - 2 * P);
  
  const fy = (y: number) => {
    const range = yMax - yMin;
    if (range === 0) return H / 2;
    return H - P - ((y - yMin) / range) * (H - 2 * P);
  };

  const linePath =
    "M " + data.map((d) => `${fx(d[0]).toFixed(1)} ${fy(d[1]).toFixed(1)}`).join(" L ");

  const fillPath =
    linePath +
    ` L ${fx(xMax).toFixed(1)} ${H - P} L ${fx(xMin).toFixed(1)} ${H - P} Z`;

  const gridLines = [0.2, 0.4, 0.6, 0.8];
  const tickCount = 9;
  const horizontalTicks = Array.from({ length: tickCount }, (_, i) => i);

  return (
    <div className="w-full overflow-hidden bg-bg/10 rounded-xl px-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <defs>
          <linearGradient id="eqGradShowcase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3aa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22d3aa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {gridLines.map((g, idx) => {
          const yVal = H - P - g * (H - 2 * P);
          const gridLabel = yMin + g * (yMax - yMin);
          return (
            <g key={idx}>
              <line
                x1={P} 
                x2={W - P}
                y1={yVal} 
                y2={yVal}
                stroke="#1e2740" 
                strokeWidth="1"
                strokeDasharray="4 6"
                opacity="0.6"
              />
              <text
                x={P + 4}
                y={yVal - 4}
                fill="#5a6378"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                opacity="0.8"
              >
                ${Math.round(gridLabel).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Date / Progress Ticks */}
        {horizontalTicks.map((tick) => {
          const xVal = P + (tick / (tickCount - 1)) * (W - 2 * P);
          
          let label = "";
          if (period === "8yr") {
            label = String(2018 + tick);
          } else {
            // YTD 2026 months
            const months = ["Jan", "", "Feb", "", "Mar", "", "Apr", "", "May"];
            label = months[tick] ? `${months[tick]} 2026` : "";
          }

          if (!label) return null;

          return (
            <text
              key={tick}
              x={xVal}
              y={H - 6}
              fill="#5a6378"
              fontSize="9"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
            >
              {label}
            </text>
          );
        })}

        {/* Compounded Shaded Gradient Area */}
        <path d={fillPath} fill="url(#eqGradShowcase)" className="transition-all duration-500 ease-out" />
        
        {/* Compounding Curve Line */}
        <path 
          d={linePath} 
          stroke="#22d3aa" 
          strokeWidth="2.5" 
          fill="none"
          strokeLinejoin="round" 
          strokeLinecap="round" 
          className="transition-all duration-500 ease-out"
        />

        {/* Glowing Endpoint Bubble */}
        <circle cx={fx(xMax)} cy={fy(ys[ys.length - 1])} r="4.5" fill="#22d3aa" />
        <circle cx={fx(xMax)} cy={fy(ys[ys.length - 1])} r="10" fill="#22d3aa" fillOpacity="0.25" className="animate-pulse" />
      </svg>
    </div>
  );
}
