import { useState, useEffect } from "react";
import { LogoMark } from "./Logo";
import { Link } from "react-router-dom";
import { apiGetConfig } from "../lib/api";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user } = useAuth();
  const [isLaunched, setIsLaunched] = useState(false);

  const isAndroid = Capacitor.getPlatform() === "android";
  const isIOS = Capacitor.getPlatform() === "ios";

  const topHeaderPadding = isAndroid
    ? "calc(var(--safe-area-inset-top, 38px) + 12px)"
    : isIOS
      ? "calc(env(safe-area-inset-top, 44px) + 12px)"
      : "0px";

  useEffect(() => {
    apiGetConfig().then((cfg) => {
      setIsLaunched(cfg.is_launched);
    });
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 border-b border-line/50 bg-bg/80 backdrop-blur-md"
      style={{ paddingTop: topHeaderPadding }}
    >
      <div className="container-app flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <LogoMark size={32} className="text-accent transition-transform group-hover:scale-110" />
          <span className="text-lg font-bold tracking-tight">
            Strategy<span className="text-accent">Labs</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#how" className="text-sm text-ink-muted hover:text-ink transition-colors">How it works</a>
          <a href="/#proof" className="text-sm text-ink-muted hover:text-ink transition-colors">Proof</a>
          <a href="/#pricing" className="text-sm text-ink-muted hover:text-ink transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-sm py-2 px-4 shadow-md shadow-accent/25">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-ink-muted hover:text-ink transition-colors mr-1">
                Sign In
              </Link>
              {!isLaunched && !Capacitor.isNativePlatform() && (
                <a href="#waitlist" className="btn-primary text-sm py-2 px-4 shadow-md shadow-accent/25">
                  Join Waitlist
                </a>
              )}
              {(isLaunched || Capacitor.isNativePlatform()) && (
                <Link to="/login" className="btn-primary text-sm py-2 px-4 shadow-md shadow-accent/25">
                  {Capacitor.isNativePlatform() ? "Sign In" : "Launch App"}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
