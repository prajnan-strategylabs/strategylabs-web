import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShieldCheck, Eye, Key, Database, ChevronDown, Scale, Server } from "lucide-react";

interface PrivacySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  content: React.ReactNode;
}

export function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>("custody");

  const sections: PrivacySection[] = [
    {
      id: "custody",
      title: "Strict Self-Custody & Key Privacy",
      icon: <Key className="h-5 w-5 text-accent" />,
      subtitle: "We do not hold, see, or custody your exchange API credentials or funds.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            Strategy Labs operates on the core principle of <strong className="text-ink">user autonomy and absolute self-custody</strong>. Unlike centralized wealth managers or advisory funds, we do not operate databases designed to hold or access your exchange secrets.
          </p>
          <div className="bg-bg-elev/40 border border-line/50 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-accent font-mono">CREDENTIAL ISOLATION ARCHITECTURE:</span>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Local Storage Encryption:</strong> Any Bybit, Binance, or other exchange API keys, webhook URLs, and automation keys you configure are stored exclusively on your local device (utilizing secure local storage sandboxes or mobile system keychains).</li>
              <li><strong>Zero Server-Side Decryption:</strong> Private keys are never transmitted to, processed by, or cached on the Strategy Labs servers. Communication with exchange gateways occurs directly from your client machine or native WebView.</li>
              <li><strong>Zero Asset Custody:</strong> Strategy Labs cannot withdraw, transfer, or access your exchange balances. Your assets remain securely stored inside your domestic cryptocurrency exchange accounts.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "data",
      title: "Scope of Data Collection",
      icon: <Eye className="h-5 w-5 text-accent" />,
      subtitle: "A transparent list of the data elements we collect to power your backtesting portal.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            We collect only the bare minimum informational elements required to synchronize your personal profile, compile strategy specifications, and validate active subscriptions:
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-line/45 p-3 rounded-lg bg-bg-card/20">
              <span className="font-bold text-ink text-xs block mb-1">Profile & Identity Data</span>
              <p className="text-xs">
                Your email address and your chosen trader handle (personalization name). This data is stored inside secure, encrypted database tables managed by our auth partner (Supabase).
              </p>
            </div>
            <div className="border border-line/45 p-3 rounded-lg bg-bg-card/20">
              <span className="font-bold text-ink text-xs block mb-1">Backtest Prompts & Logic</span>
              <p className="text-xs">
                The text prompts, indicators, strategy specs, and backtest results you compile. This data is synced to let you view your backtest history, compile optimizations, and view showcase stats.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "services",
      title: "Third-Party Sub-Processors",
      icon: <Server className="h-5 w-5 text-accent" />,
      subtitle: "We use only the most reliable, industry-standard processors to keep our pipeline secure.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            To deliver real-time notifications, secure authentication, and app-store purchasing pipelines, we integrate with the following trusted third-party providers:
          </p>
          <ul className="list-decimal pl-4 space-y-2 text-xs">
            <li><strong>Supabase Inc.</strong> Handles secure authentication, email validation, and data hosting. All connections are routed over secure SSL channels.</li>
            <li><strong>RevenueCat Inc.</strong> Validates subscription entitlements, billing tiers, and purchases made via Google Play or App Store transactions. No credit card details are processed by our servers.</li>
            <li><strong>Telegram Bot API:</strong> Routes voluntary signals alerts to your phone if you connect a chat link. Only raw signal data is pushed; no personal account data is shared.</li>
          </ul>
        </div>
      )
    },
    {
      id: "security",
      title: "Information Security Protocols",
      icon: <Database className="h-5 w-5 text-accent" />,
      subtitle: "How we protect your quantitative data and prevent unauthorized leaks.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            We implement advanced, institutional-grade security safeguards to protect our codebase and user parameters:
          </p>
          <div className="border border-accent/20 bg-accent/5 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-ink-muted">
              <span className="font-bold text-white">ENCRYPTED DATA CHANNELS</span>
              <p>
                All data transmission between the Strategy Labs frontend and our backend API uses strict TLS/HTTPS protocols. Server configurations bypass local WebView sandboxes by routing queries securely, preventing CORS exploits or middleman attacks.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink relative">
      <Header />

      <main className="flex-grow container-app py-16 space-y-12 relative z-10 animate-fade-in">
        
        {/* Title Block */}
        <div className="max-w-3xl space-y-3 pt-5 px-4 md:px-0">
          <div className="w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy & Trust Protocol
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Our <span className="text-accent">Privacy Policy</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Strategy Labs is built on a foundation of absolute transparency, security, and strict self-custody. Read this simple breakdown of how your personal data and systematic parameters are kept completely secure.
          </p>
        </div>

        {/* Accordion list */}
        <div className="max-w-4xl space-y-4 px-4 md:px-0">
          {sections.map((sec) => {
            const isOpen = activeSection === sec.id;
            return (
              <div 
                key={sec.id}
                className={`card border transition-all duration-300 overflow-hidden p-0 ${
                  isOpen 
                    ? "border-accent/40 bg-bg-card/65 shadow-[0_4px_30px_rgba(0,0,0,0.4)]" 
                    : "border-line/60 bg-bg-card/25 hover:bg-bg-card/45 hover:border-line"
                }`}
              >
                {/* Header Toggle */}
                <button
                  onClick={() => setActiveSection(isOpen ? null : sec.id)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg border transition-colors ${
                      isOpen ? "bg-accent/10 border-accent/30" : "bg-bg-elev/40 border-line"
                    }`}>
                      {sec.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">{sec.title}</h3>
                      <p className="text-xs text-ink-subtle mt-0.5 hidden md:block">{sec.subtitle}</p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-accent transition-transform duration-300 transform rotate-180" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-ink-muted transition-transform duration-300" />
                  )}
                </button>

                {/* Content Panel */}
                <div className={`transition-all duration-300 ${
                  isOpen ? "max-h-[1000px] border-t border-line/45" : "max-h-0"
                }`}>
                  <div className="p-6 md:px-8 md:py-6 space-y-4 bg-bg/25">
                    <p className="text-xs text-ink-subtle md:hidden block italic font-mono mb-2">
                      {sec.subtitle}
                    </p>
                    {sec.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Callout Box */}
        <div className="max-w-4xl card border-accent/30 bg-accent/5 p-6 flex flex-col md:flex-row gap-5 items-center justify-between mx-4 md:mx-0">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" />
              Privacy Compliance Standard
            </h4>
            <p className="text-xs text-ink-muted max-w-2xl leading-relaxed">
              We continuously audit our sub-processors and connection paths to ensure alignment with global privacy regulations. For inquiries or data deletion requests, contact us.
            </p>
          </div>
          <a href="/#how" className="btn-ghost text-xs py-2 px-4 flex-shrink-0 text-ink-muted hover:text-ink">
            Back to Sandbox
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
