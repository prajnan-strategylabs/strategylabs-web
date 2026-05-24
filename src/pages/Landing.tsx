import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Proof } from "../components/Proof";
import { HowItWorks } from "../components/HowItWorks";
import { Pricing } from "../components/Pricing";
import { Footer } from "../components/Footer";

export function Landing() {
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
