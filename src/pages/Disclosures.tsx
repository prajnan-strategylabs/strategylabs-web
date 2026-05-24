import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShieldAlert, Terminal, UserCheck, ChevronDown, ChevronUp, Scale, AlertTriangle, Cpu, Globe } from "lucide-react";

interface DisclosureSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  content: React.ReactNode;
}

export function Disclosures() {
  const [activeSection, setActiveSection] = useState<string | null>("sim");

  const sections: DisclosureSection[] = [
    {
      id: "sim",
      title: "Simulation & Backtesting Limitations",
      icon: <Cpu className="h-5 w-5 text-accent" />,
      subtitle: "Past performance is a simulated hypothesis, not a live financial guarantee.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            All backtesting results shown on the Strategy Labs platform (including the V22 Strategy Showcase, optimized sandbox models, and user-generated algorithms) are <strong className="text-ink">hypothetical, simulated, and reconstructed</strong> using historical candle databases.
          </p>
          <div className="bg-bg-elev/40 border border-line/50 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-accent font-mono">CRITICAL SIMULATION GAP FACTORS:</span>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li><strong>Zero Execution Slippage:</strong> Historical simulations execute fills at exact bar close or high/low boundaries. In live markets, order routing, exchange book depth, and network latency introduce adverse fills.</li>
              <li><strong>Exchange Liquidity & Fee Spans:</strong> Backtests compound nominal values assuming infinite order book depth. Live trading of larger capital clips (&gt; $50,000) causes market impact, driving average entry/exit prices away from historical model curves.</li>
              <li><strong>Overfitting & Curve Fitting:</strong> Strategy optimizers iteratively scan hundreds of parameter configurations (such as RSI triggers and EMA lengths) to find the absolute maximum historical returns. This process often compounds noise rather than structural signal, resulting in dramatic decay in out-of-sample live performance.</li>
            </ul>
          </div>
          <p>
            Hypothetical performance has many inherent limitations. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown in our simulations.
          </p>
        </div>
      )
    },
    {
      id: "sys",
      title: "Systemic, Network & Algorithmic Risks",
      icon: <Terminal className="h-5 w-5 text-accent" />,
      subtitle: "Execution software relies on highly complex technical stacks subject to systemic failure points.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            Running automated signal pipelines introduces significant operational risks. Code bases represent logic structures that execute precisely as written, but cannot adapt dynamically to black-swan hardware anomalies.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-line/45 p-3 rounded-lg bg-bg-card/20">
              <span className="font-bold text-ink text-xs block mb-1">API Latency & Connectivity Failure</span>
              <p className="text-xs">
                Signal execution relies on webhook delivery, WebSocket feeds, and REST requests connecting servers to centralized exchange gateways (e.g. Binance, OKX, Coinbase). Server restarts, API rate limits, or network drops can drop buy/sell commands completely, leaving positions unhedged or unmanaged.
              </p>
            </div>
            <div className="border border-line/45 p-3 rounded-lg bg-bg-card/20">
              <span className="font-bold text-ink text-xs block mb-1">Execution Logic & Oracle Corruptions</span>
              <p className="text-xs">
                Indicators (RSI, Bollinger Bands, ATR) compute using aggregated pricing feeds from decentralized data oracles or exchanges. Corrupted candle packets, flash spikes, or temporary data lag can trigger false signals that initiate unintended trades.
              </p>
            </div>
          </div>
          <p>
            Users deploying automated strategies agree that Strategy Labs is not liable for system-level glitches, execution outages, hardware crashes, or network disconnects that cause trades to misfire or miss targets entirely.
          </p>
        </div>
      )
    },
    {
      id: "mkt",
      title: "Cryptocurrency Market Volatility & Liquidity",
      icon: <Globe className="h-5 w-5 text-accent" />,
      subtitle: "Digital assets represent extremely high-beta, volatile markets operating 24/7/365.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            Cryptocurrency markets represent an emerging asset class characterized by unprecedented price swings, regulatory shifts, and structural fragmentation. Unlike traditional equity or commodity markets, digital asset trading operates continuously without circuit breakers.
          </p>
          <blockquote className="border-l-2 border-accent px-4 py-1 text-xs text-ink-subtle font-mono">
            "Crypto assets regularly undergo sudden, rapid drawdowns exceeding 50% across multiple liquid base-pairs inside single multi-hour sessions due to structural liquidations."
          </blockquote>
          <ul className="list-decimal pl-4 space-y-2 text-xs">
            <li><strong>De-pegging & Stablecoin Systemic Shock:</strong> Algorithmic pairs structured against stablecoins (USDT, USDC, FDUSD) are subject to structural de-peg scenarios where backing assets fail, rendering theoretical profit curves meaningless.</li>
            <li><strong>Regulatory & Exchange Insolvency:</strong> Centralized clearing venues are vulnerable to sudden capital controls, trading suspensions, or insolvency events (such as exchange bank runs). Your capital remains exposed to these counterparty failure loops.</li>
          </ul>
        </div>
      )
    },
    {
      id: "fld",
      title: "Self-Custody & Platform Responsibility Boundary",
      icon: <UserCheck className="h-5 w-5 text-accent" />,
      subtitle: "Strategy Labs is an educational research software. We do not hold or custody your assets.",
      content: (
        <div className="space-y-4 text-xs md:text-sm text-ink-muted leading-relaxed">
          <p>
            Our core operating architecture is built on the principle of strict self-custody and user autonomy:
          </p>
          <div className="border border-red-500/25 bg-red-500/5 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-ink-muted">
              <span className="font-bold text-red-300">NO FIDUCIARY OR INVESTMENT ADVISORY RELATIONSHIP</span>
              <p>
                Strategy Labs does not hold, access, or manage your capital. All trades, risk levels, and API credentials are kept locally or routed securely on platforms you control. We do not operate as registered financial planners, fund managers, or custodians.
              </p>
              <p>
                You are solely responsible for verifying the accuracy of your strategy logic, adjusting risk thresholds, managing leverage sizing, and ensuring compliance with local regulatory bodies in your domestic jurisdiction.
              </p>
            </div>
          </div>
          <p>
            Past performance—even when verified across years of extensive tick-by-tick backtesting—is not indicative of future performance. You should never trade with capital you cannot afford to lose completely.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink relative">
      <Header />

      <main className="flex-grow container-app py-16 space-y-12 relative z-10">
        
        {/* Title Block */}
        <div className="max-w-3xl space-y-3">
          <div className="w-fit rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5 animate-fade-in">
            <ShieldAlert className="h-3.5 w-3.5" />
            Mandatory Risk Disclosures & Framework
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Quantitative Research <span className="text-red-400">Risk Disclosure</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Algorithmic trading is highly complex and carries significant risks of capital loss. Please read this transparent breakdown of our mathematical limitations, software boundary assumptions, and self-custody framework carefully.
          </p>
        </div>

        {/* ── INTERACTIVE ACCORDION ── */}
        <div className="max-w-4xl space-y-4">
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
                    <ChevronUp className="h-5 w-5 text-accent transition-transform duration-300" />
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
        <div className="max-w-4xl card border-red-500/30 bg-red-950/15 p-6 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-ink flex items-center gap-2">
              <Scale className="h-4 w-4 text-red-400" />
              Institutional Standard Protocol
            </h4>
            <p className="text-xs text-ink-muted max-w-2xl leading-relaxed">
              By using our sandbox, loading V22 presets, compiling prompts, or connecting keys, you acknowledge that you are using this platform at your own risk. Past performance does not guarantee or predict future success.
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
