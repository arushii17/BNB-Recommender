import { Sparkles } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import type { Currency, StayListing } from '@/types/stay';

interface TopRecommendationsProps {
  top3: StayListing[];
  currency: Currency;
  nights: number;
  onComparePrices: (stay: StayListing) => void;
  onSelectProperty: (stay: StayListing) => void;
  onToggleCompareStay: (stay: StayListing) => void;
  isStayInComparison: (id: string) => boolean;
}

export function TopRecommendations({
  top3,
  currency,
  nights,
  onComparePrices,
  onSelectProperty,
  onToggleCompareStay,
  isStayInComparison,
}: TopRecommendationsProps) {
  if (top3.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
          Top recommendations
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {top3.map((stay, index) => (
          <div key={stay.id} className="relative">
            <span className="absolute -top-2 -left-2 z-10 px-2 py-1 bg-yellow-400 text-black border-2 border-border text-xs font-black">
              #{index + 1} MATCH
            </span>
            <PropertyCard
              stay={stay}
              currency={currency}
              nights={nights}
              viewMode="grid"
              onComparePrices={onComparePrices}
              onSelectProperty={onSelectProperty}
              onToggleCompareStay={onToggleCompareStay}
              isSelectedForCompare={isStayInComparison(stay.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
