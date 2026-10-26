import { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StayListing, SearchFilters, PropertyPriceComparison } from '@/types/stay';
import {
  formatPrice,
  platformBadgeColor,
} from '@/services/recommendationEngine';
import { compareStayPrices } from '@/services/api';

interface PriceComparisonModalProps {
  stay: StayListing | null;
  filters: SearchFilters;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceComparisonModal({
  stay,
  filters,
  isOpen,
  onClose,
}: PriceComparisonModalProps) {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<PropertyPriceComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && stay) {
      let active = true;
      setLoading(true);
      setComparison(null);
      setError(null);
      compareStayPrices(stay, filters)
        .then((result) => {
          if (active) setComparison(result);
        })
        .catch((requestError: unknown) => {
          if (active) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : 'The live price comparison failed.',
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }
  }, [isOpen, stay, filters]);

  if (!isOpen || !stay) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-card text-card-foreground border-4 border-border pixel-shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 border-b-4 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                PRICE COMPARISON RADAR
              </h2>
              <p className="text-xs text-primary-foreground/80 font-medium">
                Where is it cheapest? Compare live platform rates.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Stay Info Card */}
          <div className="bg-muted/40 border-2 border-border p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary px-1.5 py-0.5 bg-background border border-border">
                {stay.property_type}
              </span>
              <h3 className="text-base font-extrabold text-foreground mt-1">{stay.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stay.address || `${stay.city}, ${stay.country}`}
              </p>
            </div>
            <div className="bg-card border-2 border-border px-3 py-1.5 text-right shrink-0">
              <span className="text-xs text-muted-foreground block font-bold">Stay Dates</span>
              <span className="text-xs font-black font-mono text-foreground">
                {filters.check_in} → {filters.check_out} ({comparison?.nights ?? 1} nights)
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-extrabold text-foreground tracking-wider uppercase">
                Requesting current rates from available providers...
              </p>
              <p className="text-xs text-muted-foreground">
                Retrieving real-time quotes, room rates, and service fees
              </p>
            </div>
          ) : comparison ? (
            <div className="space-y-4">
              {/* Arbitrage Banner */}
              {comparison.offers.length > 0 && comparison.offers[0].savings_vs_max ? (
                <div className="bg-emerald-500/10 border-3 border-emerald-600 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        BEST PRICE FOUND ON {comparison.offers[0].platform_display_name.toUpperCase()}
                      </p>
                      <p className="text-xs text-emerald-600/90 font-medium">
                        You can save up to{' '}
                        <span className="font-extrabold font-mono underline">
                          {formatPrice(comparison.offers[0].savings_vs_max, filters.currency)}
                        </span>{' '}
                        compared to the highest booking platform!
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 border border-border shrink-0">
                    SAVE {Math.round((comparison.offers[0].savings_vs_max / comparison.maximum_price) * 100)}%
                  </Badge>
                </div>
              ) : null}

              {/* Offers List */}
              <div className="space-y-3">
                {comparison.offers.map((offer, idx) => {
                  const pBadge = platformBadgeColor(offer.platform);
                  return (
                    <div
                      key={offer.platform}
                      className={`p-3.5 sm:p-4 border-3 pixel-shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-none ${
                        offer.is_cheapest
                          ? 'bg-emerald-500/5 border-emerald-600 ring-2 ring-emerald-500'
                          : 'bg-card border-border hover:border-foreground'
                      }`}
                    >
                      {/* Platform & features */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-black uppercase border-2 ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}
                          >
                            {offer.platform_display_name}
                          </span>
                          {offer.is_cheapest && (
                            <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 tracking-wider uppercase border border-border flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> BEST DEAL
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Offer #{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          {offer.cancellation_policy && (
                            <>
                              <span>{offer.cancellation_policy}</span>
                              {offer.tax_included && <span className="mx-1">·</span>}
                            </>
                          )}
                          {offer.tax_included && <span>Taxes & fees included</span>}
                        </p>
                      </div>

                      {/* Prices & Action Button */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg sm:text-xl font-black font-mono text-foreground">
                              {formatPrice(offer.nightly_price, filters.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">/ night</span>
                          </div>
                          <span className="text-xs font-extrabold text-foreground block font-mono">
                            {formatPrice(offer.total_price, filters.currency)} total
                          </span>
                        </div>

                        <a
                          href={offer.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex"
                        >
                          <Button
                            size="sm"
                            className={`h-9 font-black text-xs uppercase border-2 border-border pixel-press px-4 ${
                              offer.is_cheapest
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            }`}
                          >
                            <span>Book on {offer.platform_display_name}</span>
                            <ExternalLink className="w-3 h-3 ml-1.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-muted-foreground text-center pt-2">
                * Rates are fetched live and normalized across partner APIs. Platform inventory and final cancellation policies are verified during checkout on the provider website.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border-2 border-red-500 text-center text-xs font-bold text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : (
            <div className="p-4 bg-muted border-2 border-border text-center text-xs font-bold">
              Unable to load live price comparison.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted border-t-4 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Direct booking links take you to the platform without surcharge</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-2 border-border font-bold text-xs"
          >
            Close Radar [Esc]
          </Button>
        </div>
      </div>
    </div>
  );
}
