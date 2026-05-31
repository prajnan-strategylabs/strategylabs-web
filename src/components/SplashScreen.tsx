import { useEffect, useState } from "react";
import { SplashScreen as CapSplashScreen } from "@capacitor/splash-screen";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Hide the native launch splash screen immediately since our custom React animation is now ready and rendering.
    CapSplashScreen.hide().catch(() => {});

    // Start fading out after 2.2 seconds (allowing logo animation to complete)
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 2200);

    // Unmount from the DOM after the fade-out transition completes (700ms transition)
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 2900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg select-none pointer-events-none transition-all duration-700 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-105"
      }`}
    >
      {/* Self-contained premium animations */}
      <style>{`
        .splash-path {
          stroke-dasharray: 350;
          stroke-dashoffset: 350;
          animation: draw-path 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          animation-delay: 0.2s;
        }

        .splash-circle-start {
          transform-origin: 36px 180px;
          transform: scale(0);
          animation: pop-circle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.1s;
        }

        .splash-circle-end {
          transform-origin: 222px 50px;
          transform: scale(0);
          animation: pop-circle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 1.4s;
        }

        .splash-sparks {
          transform-origin: 222px 50px;
          transform: scale(0);
          opacity: 0;
          animation: shoot-sparks 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 1.5s;
        }

        .splash-text {
          animation: focus-text 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.8s;
          opacity: 0;
        }

        @keyframes draw-path {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pop-circle {
          to {
            transform: scale(1);
          }
        }

        @keyframes shoot-sparks {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes focus-text {
          0% {
            filter: blur(10px);
            opacity: 0;
            transform: translateY(8px);
            letter-spacing: 0.15em;
          }
          100% {
            filter: blur(0);
            opacity: 1;
            transform: translateY(0);
            letter-spacing: -0.025em;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Dynamic Background Glow */}
      <div 
        className="absolute h-[350px] w-[350px] rounded-full bg-accent/20 blur-[80px]"
        style={{
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />

      {/* Logo Wrapper */}
      <div className="relative flex flex-col items-center gap-6">
        
        {/* Custom Animated Logo */}
        <div className="relative flex items-center justify-center">
          {/* External ambient pulse ring */}
          <div className="absolute inset-0 rounded-full bg-accent/5 scale-125 animate-pulse blur-md" />
          
          <svg
            viewBox="0 0 256 256"
            className="w-24 h-24 text-accent relative z-10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 36 180 C 60 178, 78 168, 96 144 L 116 168 L 222 50"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="splash-path"
            />
            <circle
              cx="36"
              cy="180"
              r="10"
              stroke="currentColor"
              strokeWidth="9"
              className="splash-circle-start"
            />
            <circle
              cx="222"
              cy="50"
              r="12"
              stroke="currentColor"
              strokeWidth="9"
              className="splash-circle-end"
            />
            <g
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              className="splash-sparks"
            >
              <line x1="222" y1="22" x2="222" y2="8" />
              <line x1="200" y1="32" x2="190" y2="22" />
              <line x1="244" y1="32" x2="254" y2="22" />
              <line x1="192" y1="50" x2="178" y2="50" />
              <line x1="252" y1="50" x2="266" y2="50" />
            </g>
          </svg>
        </div>

        {/* Wordmark Lockup */}
        <div className="splash-text flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">
            Strategy<span className="text-accent">Labs</span>
          </h1>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-ink-subtle">
            AI Quantitative Simulator
          </p>
        </div>
      </div>
    </div>
  );
}
