import { Mail } from "lucide-react";
import { LogoMark } from "./Logo";

// Brand icons not in lucide — use inline SVGs
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-12">
      <div className="container-app">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <a href="/" className="flex items-center gap-2.5">
              <LogoMark size={32} className="text-accent" />
              <span className="text-lg font-bold tracking-tight">
                Strategy<span className="text-accent">Labs</span>
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Where strategies are tested.
              Build, backtest, and deploy trading strategies — verifiably.
            </p>
          </div>

          {/* Product */}
          <FooterColumn title="Product">
            <FooterLink href="#how">How it works</FooterLink>
            <FooterLink href="#proof">Backtest proof</FooterLink>
            <FooterLink href="#pricing">Pricing</FooterLink>
            <FooterLink href="#waitlist">Join beta</FooterLink>
          </FooterColumn>

          {/* Resources */}
          <FooterColumn title="Resources">
            <FooterLink href="/docs">Docs</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/changelog">Changelog</FooterLink>
            <FooterLink href="/disclosures">Risk disclosures</FooterLink>
          </FooterColumn>

          {/* Connect */}
          <FooterColumn title="Connect">
            <FooterLink href="https://twitter.com/strategylabs" external>
              <XIcon className="h-4 w-4" /> Twitter / X
            </FooterLink>
            <FooterLink href="https://github.com/strategylabs" external>
              <GithubIcon className="h-4 w-4" /> GitHub
            </FooterLink>
            <FooterLink href="mailto:hello@strategylabs.trade" external>
              <Mail className="h-4 w-4" /> hello@strategylabs.trade
            </FooterLink>
          </FooterColumn>
        </div>

        {/* Disclaimers */}
        <div className="mt-12 space-y-4 border-t border-line pt-8 text-xs text-ink-subtle">
          <p>
            <strong className="text-ink-muted">Not financial advice.</strong> Strategy Labs is an
            educational and research tool. We do not provide investment advice. Past performance
            shown in backtests does not predict or guarantee future results. Trading involves
            substantial risk of loss, including the possibility of losing your entire investment.
            You should consult with qualified financial, legal, and tax professionals before making
            any investment decisions.
          </p>
          <p>
            Strategy Labs does not hold or custody user funds. All trades are executed by users on
            their own exchange accounts. Users are solely responsible for their trading decisions,
            outcomes, tax obligations, and compliance with all applicable laws and regulations in
            their jurisdiction.
          </p>
          <p>
            <strong className="text-ink-muted">Geographic restrictions:</strong> Service is not
            available in restricted regions. Users must be 18 or older.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
            <span>© {year} Strategy Labs. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="/terms" className="hover:text-ink-muted transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-ink-muted transition-colors">Privacy</a>
              <a href="/disclosures" className="hover:text-ink-muted transition-colors">Disclosures</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href, children, external,
}: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <li>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors"
      >
        {children}
      </a>
    </li>
  );
}
