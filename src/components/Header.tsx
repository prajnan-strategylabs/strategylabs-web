import { LogoMark } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/50 bg-bg/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <LogoMark size={32} className="text-accent transition-transform group-hover:scale-110" />
          <span className="text-lg font-bold tracking-tight">
            Strategy<span className="text-accent">Labs</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-ink-muted hover:text-ink transition-colors">How it works</a>
          <a href="#proof" className="text-sm text-ink-muted hover:text-ink transition-colors">Proof</a>
          <a href="#pricing" className="text-sm text-ink-muted hover:text-ink transition-colors">Pricing</a>
        </nav>

        <a href="#waitlist" className="btn-primary text-sm py-2 px-4">
          Join waitlist
        </a>
      </div>
    </header>
  );
}
