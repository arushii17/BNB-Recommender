import { useState } from 'react';
import { Moon, Sun, Layers, HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Currency } from '@/types/stay';
import { CURRENCY_SYMBOLS } from '@/services/currency';

interface NavbarProps {
  comparisonCount: number;
  onOpenComparison: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  comparisonCount,
  onOpenComparison,
  currency,
  onCurrencyChange,
  darkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b-4 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground font-black text-2xl flex items-center justify-center pixel-shadow border-2 border-border select-none">
            ⌂
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-foreground">
                FindMyFlat
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400 text-black font-bold uppercase tracking-widest border border-border hidden sm:inline-block">
                v2.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block tracking-wide">
              SEARCH · COMPARE · CHOOSE
            </p>
          </div>
        </div>

        {/* Center info ticker on desktop */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 border border-border">
            <span className="w-2 h-2 bg-green-500 inline-block animate-pulse" />
            <span>4 Platforms Searched</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Live Provider Rates</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center border-2 border-border bg-card">
            {(['USD', 'EUR', 'GBP', 'INR'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={`px-2 py-1 text-xs font-bold transition-none ${
                  currency === c
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                title={`Switch currency to ${c} (${CURRENCY_SYMBOLS[c]})`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Comparison drawer trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenComparison}
            className="relative font-bold border-2 border-border pixel-press flex items-center gap-1.5"
            title="View property comparison matrix"
          >
            <Layers className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Compare</span>
            {comparisonCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 min-w-[20px] px-1 text-[11px] font-black border border-border bg-primary text-primary-foreground"
              >
                {comparisonCount}
              </Badge>
            )}
          </Button>

          {/* Dark mode toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleDarkMode}
            className="border-2 border-border pixel-press w-9 h-9"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>

          {/* Info Modal trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHowItWorks(true)}
            className="border-2 border-border hover:bg-muted w-9 h-9"
            title="How FindMyFlat works"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* How it works modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border-4 border-border pixel-shadow-lg max-w-lg w-full p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-border">
              <h3 className="text-lg font-black tracking-wide flex items-center gap-2">
                <span className="text-primary font-mono">[?]</span> HOW FINDMYFLAT WORKS
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHowItWorks(false)}
                className="border-2 border-border font-bold"
              >
                CLOSE [X]
              </Button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="p-3 bg-muted border-2 border-border">
                <p className="font-bold text-foreground">01 · Cross-Platform Search</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We search the live listings returned by the connected accommodation provider.
                </p>
              </div>
              <div className="p-3 bg-muted border-2 border-border">
                <p className="font-bold text-foreground">02 · Vector Match Recommendation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Our ranking algorithm calculates distance from the ideal profile (lowest cost, highest ratings, most reviews).
                </p>
              </div>
              <div className="p-3 bg-muted border-2 border-border">
                <p className="font-bold text-foreground">03 · Live Price Arbitrage Matrix</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Request current rates for this property from available providers, then confirm final terms with the booking provider.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowHowItWorks(false)}
                className="bg-primary text-primary-foreground font-bold border-2 border-border pixel-press"
              >
                GOT IT
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
