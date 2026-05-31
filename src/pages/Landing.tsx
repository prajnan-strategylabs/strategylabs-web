import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Capacitor } from "@capacitor/core";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Proof } from "../components/Proof";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Footer } from "../components/Footer";

export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      if (!loading) {
        if (user) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }
    }
  }, [user, loading, navigate]);

  if (Capacitor.isNativePlatform() && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Proof />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
