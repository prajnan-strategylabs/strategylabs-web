import { useState, useEffect } from "react";
import { API_BASE } from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Clock, Calendar, ArrowRight, BookOpen, X } from "lucide-react";

// Branded renderers for the blog markdown — keeps every element on-brand
// without pulling in @tailwindcss/typography.
const markdownComponents = {
  h1: (p: any) => <h1 className="text-2xl font-bold text-ink mt-6 mb-3" {...p} />,
  h2: (p: any) => <h2 className="text-xl font-bold text-ink mt-6 mb-3" {...p} />,
  h3: (p: any) => <h3 className="text-base font-bold text-ink mt-5 mb-2" {...p} />,
  p:  (p: any) => <p className="leading-relaxed text-ink-muted" {...p} />,
  strong: (p: any) => <strong className="font-semibold text-ink" {...p} />,
  em: (p: any) => <em className="italic text-ink" {...p} />,
  ul: (p: any) => <ul className="list-disc pl-5 space-y-1.5 text-ink-muted" {...p} />,
  ol: (p: any) => <ol className="list-decimal pl-5 space-y-1.5 text-ink-muted" {...p} />,
  li: (p: any) => <li className="leading-relaxed" {...p} />,
  a:  (p: any) => <a className="text-accent hover:underline" target="_blank" rel="noreferrer noopener" {...p} />,
  blockquote: (p: any) => (
    <blockquote className="border-l-2 border-accent/40 pl-4 italic text-ink-muted" {...p} />
  ),
  code: ({ inline, ...props }: any) =>
    inline ? (
      <code className="rounded bg-bg-elev/70 px-1.5 py-0.5 text-[0.85em] font-mono text-accent" {...props} />
    ) : (
      <code className="block rounded-lg bg-bg-elev/60 p-4 text-xs font-mono text-ink overflow-x-auto" {...props} />
    ),
  pre: (p: any) => <pre className="my-3" {...p} />,
  hr: () => <hr className="my-6 border-line" />,
  table: (p: any) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-xs border-collapse" {...p} />
    </div>
  ),
  thead: (p: any) => <thead className="border-b border-line" {...p} />,
  tbody: (p: any) => <tbody {...p} />,
  tr: (p: any) => <tr className="border-b border-line/40 even:bg-bg-elev/20" {...p} />,
  th: (p: any) => <th className="px-3 py-2 text-left font-semibold text-ink" {...p} />,
  td: (p: any) => <td className="px-3 py-2 text-ink-muted" {...p} />,
};

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string | null;
  cover_gradient: string;
  read_time: string;
  tags: string[];
  created_at: string;
}

// Highly premium pre-seeded blog posts (Offline fallback)
const SEEDED_POSTS: BlogPost[] = [
  {
    title: "Inside V22: Compounding +784% Return with Dual-Regime Ensembles",
    slug: "inside-v22-dual-regime-backtest",
    excerpt: "An in-depth mathematical audit of our flagship institutional strategy. Explore the regime classifier consensus on ADX and Choppiness.",
    cover_gradient: "from-[#22d3aa]/30 via-[#3b6af1]/25 to-bg-card",
    read_time: "6 min read",
    tags: ["Strategy Release", "Backtesting", "Regime Classifier"],
    created_at: "May 20, 2026",
    content: `
# Inside V22: Compounding +784% Return with Dual-Regime Ensembles

Our flagship institutional model, **V22**, represents a significant leap forward in systematic crypto trend-following. In this article, we lay bare the exact mechanics, math, and walk-forward verification that powered its 8-year audited return.

---

### The Regime Problem
Most trading algorithms fail because they are designed for a single market state. A pure trend-follower rips profits in a bull run but gets shredded in a choppy consolidation. Conversely, mean-reversion grids capture ranging profits but blow up during a strong breakout.

The **V22 Strategy** solves this with a **Consensus Regime Classifier**:
* **ADX (Average Directional Index):** Evaluates trend strength.
* **CI (Choppiness Index):** Measures whether price is compressed or expanding.
* **EMA21 Slope:** Determines directional momentum.

By demanding a **2-of-3 consensus**, V22 dynamically switches between two active states:
1. **Trending Regime:** Runs Pullbacks (S3 Strategy) alongside continuation Bollinger Breakouts (S5 Strategy).
2. **Ranging Regime:** Disables pullback entries completely, running only Band-Squeezes to avoid catching falling knives.

---

### Dynamic Sizing & S3 Pullbacks
The S3 component targets daily trend alignments on the 4H/1H charts. By entering pullbacks to the EMA21 only when the **BTC regime gate** is bullish, it acts as a high-fidelity filter. Sizing is continuously adjusted via our proprietary **Drawdown Brake (DD Brake)**—risk is cut in half during equity curves drawdown, preventing compounding drawdowns.

### Verifiable Performance
* **8-Year Return:** +784% ($5k initial capital compounding to $44,196).
* **Max Drawdown:** 8.57% (well within typical prop firm constraints).
* **Sharpe Ratio:** 1.86 portfolio-wide.

The data proves that **portfolio diversification** is the only free lunch in quantitative finance. Interleaving trades across 42 pairs naturally smooths out drawdowns, giving V22 its institutional-grade stability.
`
  },
  {
    title: "The Volatility Squeeze: How Bollinger Bands Identify S5 Continuation Breakouts",
    slug: "bollinger-squeeze-continuation-s5",
    excerpt: "Explore the textbook S5 Break-Retest-Go setup. Learn how we filter high-probability breakouts and avoid false fakeouts.",
    cover_gradient: "from-[#f59e0b]/20 via-[#3b6af1]/25 to-bg-card",
    read_time: "5 min read",
    tags: ["Technical Analysis", "S5 Setup", "Breakout Trading"],
    created_at: "May 12, 2026",
    content: `
# The Volatility Squeeze: Bollinger Bands & S5 Setup

The **S5 Break-Retest-Go** pattern is the absolute workhorse of our algorithmic ensemble. It accounts for **90% of the total profit** compiled over our 8-year historical audit. Here is the exact blueprint for identifying and automating this setup.

---

### Step 1: The Squeeze & Breakout
Markets alternate between compression and expansion. The S5 setup looks for Bollinger Bands contracting to historical lows, indicating an imminent breakout.
* **The Trigger:** A 4H candle closes fully outside the **Bollinger Band (20, 2)**. This confirms momentum expansion.

### Step 2: The Retest
90% of retail traders chase breakouts immediately—and get wiped out by false fakeouts. V22 waits.
* **The Retest Filter:** The price must retest the broken band within **6 candles**. This confirms that the broken barrier has flipped into active support or resistance.

### Step 3: Reclaim & Sizing
* **The Go Signal:** A confirmation candle closes back in the breakout direction with a body size $\\ge 50\\%$.
* **Risk Parameters:** Stop loss is placed at the swing extreme $\\pm 0.5\\times \\text{ATR}$.
* **Take Profits:** TP1 is placed at $2.0\\times$ the stop distance (RR 2.0). TP2 is placed at $4.0\\times$ the stop distance.

---

### Filtering the Noise
To maintain a high profit factor, V22 applies strict filters:
1. **ATR Chaos Check:** Skip the trade if ATR is $>5\\%$, representing extreme market chaos where technical indicators degrade.
2. **BTC Gate:** Longs are completely blocked if Bitcoin is trading below its daily EMA21. We never swim against the macro tide.
`
  },
  {
    title: "Regime Classification: The Secret to Surviving the 2026 Crypto Grind",
    slug: "regime-classification-crypto-2026",
    excerpt: "Why retail algos fail in choppy sideways grind, and how systematic regime switches protect your portfolio capital.",
    cover_gradient: "from-[#ef4444]/20 via-[#3b6af1]/25 to-bg-card",
    read_time: "4 min read",
    tags: ["Market Regimes", "Capital Protection", "Risk Management"],
    created_at: "May 05, 2026",
    content: `
# Regime Classification: Surviving the 2026 Grind

As the crypto market matures, cycles are compressing. Choppy, transitional months are becoming the default state. In this environment, retail algorithms that perform spectacularly in backtests get quickly wiped out in live trading.

---

### The Reality of Choppiness
Ranging markets are characterized by **high fakeout rates**. Breakouts are quickly faded, and swing levels are repeatedly swept. If you run a standard trend-following system in this regime:
* You will buy the highs, get stopped out on the pullbacks, and short the lows.
* This is known as **whipsawing**, and it is the #1 killer of systematic accounts.

### How V22 Adapts
V22 continuously scans the daily ADX and Choppiness index:
* If the daily **Choppiness Index is above 60**, the market is declared **RANGING**.
* Pullback entries (S3) are immediately turned off.
* Bollinger breakout targets are tightened, and stop losses are trailed aggressively using a **1.5x ATR trailing mechanism** that instantly shifts to **1.0x ATR** once a trade hits $+3R$ profit.

### Capital Preservation is the Moat
Professional trading is not about making massive gains in bull markets—it's about **losing as little as possible** during the grinds. By utilizing the V22 consensus switches, your capital remains protected, sitting safely in cash or low-exposure setups, ready to deploy at full capacity when true macro volatility returns.
`
  }
];

export function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch blogs from backend, fallback to pre-seeded list
  useEffect(() => {
    async function loadBlogs() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/blogs`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBlogs(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // Fallback silently to seeded posts
      }
      setBlogs(SEEDED_POSTS);
      setLoading(false);
    }
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink relative">
      <Header />
      
      <main className="flex-grow container-app py-16 space-y-12 relative z-10">
        
        {/* Page Title */}
        <div className="max-w-3xl space-y-3">
          <div className="w-fit rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
            Strategy Labs Alpha Blog
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Quantitative Research & <span className="text-accent">Market Insights</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Auto-generated quantitative backtest breakdowns, V22 updates, and structural trend-following analysis direct from the research lab.
          </p>
        </div>

        {/* ── ARTICLES GRID ── */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card h-96 bg-bg-card/45 border-line/60 animate-pulse flex flex-col justify-between p-6">
                <div className="h-44 rounded-lg bg-bg-elev/40" />
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-2/3 rounded bg-bg-elev" />
                  <div className="h-3 w-full rounded bg-bg-elev" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {blogs.map((post) => (
              <article 
                key={post.slug}
                onClick={() => setSelectedPost(post)}
                className="card flex flex-col justify-between border-line/60 bg-bg-card/35 hover:bg-bg-card/65 hover:border-accent/40 backdrop-blur-sm cursor-pointer select-none transition-all duration-300 hover:scale-[1.015] group p-0 overflow-hidden"
              >
                {/* Cover visual */}
                {post.cover_image ? (
                  <div className="h-40 border-b border-line/50 overflow-hidden relative">
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card/85 to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                      {post.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[8px] font-extrabold bg-bg/60 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`h-40 bg-gradient-to-tr ${post.cover_gradient} border-b border-line/50 p-6 flex flex-col justify-between relative`}>
                    <div className="flex flex-wrap gap-1.5 z-10">
                      {post.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[8px] font-extrabold bg-bg/60 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    <BookOpen className="h-8 w-8 text-accent/65 group-hover:text-accent transition-colors self-end z-10" />
                  </div>
                )}

                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-[9px] font-semibold text-ink-subtle font-mono uppercase">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.created_at}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.read_time}</span>
                    </div>
                    <h2 className="text-base font-bold text-ink leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <span className="text-[10px] text-accent font-mono uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1.5 transition-transform self-start pt-2">
                    Read Alpha Report <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      </main>

      <Footer />

      {/* ── GLASSMORPHIC FLOATING ARTICLE READER OVERLAY ── */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] card border-accent/40 bg-bg-card/98 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-0 overflow-hidden flex flex-col">
            
            {/* Top sticky header bar */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-bg/50 backdrop-blur-sm z-10">
              <div className="flex items-center gap-4 text-[9px] font-semibold text-ink-subtle font-mono uppercase">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedPost.created_at}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {selectedPost.read_time}</span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-ink-muted hover:text-ink transition-colors p-1 bg-bg-elev/40 border border-line rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable markdown reader body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
              
              {/* Header Visual */}
              {selectedPost.cover_image ? (
                <div className="rounded-2xl overflow-hidden border border-line/45 relative h-48 md:h-64">
                  <img src={selectedPost.cover_image} alt={selectedPost.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPost.tags.map((t) => (
                        <span key={t} className="text-[9px] font-extrabold bg-bg/80 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-ink leading-tight">
                      {selectedPost.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className={`p-8 rounded-2xl bg-gradient-to-tr ${selectedPost.cover_gradient} border border-line/45 flex flex-col justify-end space-y-4`}>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.tags.map((t) => (
                      <span key={t} className="text-[9px] font-extrabold bg-bg/80 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-ink leading-tight">
                    {selectedPost.title}
                  </h2>
                </div>
              )}

              {/* Rendered post Markdown content */}
              <div className="text-xs md:text-sm leading-relaxed space-y-4 font-sans select-text">
                <ReactMarkdown
                  components={markdownComponents}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {selectedPost.content.trim()}
                </ReactMarkdown>
              </div>

            </div>

            {/* Sticky footer close bar */}
            <div className="border-t border-line px-6 py-4 flex justify-between items-center bg-bg/50 backdrop-blur-sm">
              <span className="text-[10px] text-ink-subtle font-mono">Strategy Labs Education Platform</span>
              <button 
                onClick={() => setSelectedPost(null)}
                className="btn-ghost py-1.5 px-4 text-xs font-mono border-line text-ink-muted hover:text-ink select-none"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
