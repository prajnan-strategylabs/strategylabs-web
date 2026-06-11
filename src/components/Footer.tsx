import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { LogoMark } from "./Logo";

// Brand icons not in lucide — use inline SVGs
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark size={32} className="text-accent" />
              <span className="text-lg font-bold tracking-tight">
                Strategy<span className="text-accent">Labs</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Where strategies are tested.
              Build, backtest, and deploy trading strategies — verifiably.
            </p>
          </div>

          {/* Product */}
          <FooterColumn title="Product">
            <FooterLink href="/#how">How it works</FooterLink>
            <FooterLink href="/#proof">Backtest proof</FooterLink>
            <FooterLink href="/#pricing">Pricing</FooterLink>
            <FooterLink href="/#waitlist">Join beta</FooterLink>
          </FooterColumn>

          {/* Resources */}
          <FooterColumn title="Resources">
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/disclosures">Risk disclosures</FooterLink>
            <FooterLink href="/privacy">Privacy policy</FooterLink>
          </FooterColumn>

          {/* Connect */}
          <FooterColumn title="Connect">
            <FooterLink href="https://x.com/strategylabs_" external>
              <XIcon className="h-4 w-4" /> Twitter / X
            </FooterLink>
            <FooterLink href="https://instagram.com/strategylabs_" external>
              <InstagramIcon className="h-4 w-4" /> Instagram
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
              <Link to="/terms" className="hover:text-ink-muted transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-ink-muted transition-colors">Privacy</Link>
              <Link to="/disclosures" className="hover:text-ink-muted transition-colors">Disclosures</Link>
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
  const className = "inline-flex items-center gap-2 text-ink-muted hover:text-ink transition-colors";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link to={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}
