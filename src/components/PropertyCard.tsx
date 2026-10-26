import { Star, MapPin, Scale, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StayListing, Currency } from '@/types/stay';
import { formatPrice, platformDisplayName, platformBadgeColor } from '@/services/recommendationEngine';

interface PropertyCardProps {
  stay: StayListing;
  currency: Currency;
  nights: number;
  viewMode: 'grid' | 'list';
  onComparePrices: (stay: StayListing) => void;
  onSelectProperty: (stay: StayListing) => void;
  onToggleCompareStay: (stay: StayListing) => void;
  isSelectedForCompare: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function PropertyCard({
  stay,
  currency,
  nights,
  viewMode,
  onComparePrices,
  onSelectProperty,
  onToggleCompareStay,
  isSelectedForCompare,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: PropertyCardProps) {
  const platformColor = platformBadgeColor(stay.platform);

  if (viewMode === 'list') {
    return (
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`bg-card border-3 transition-none flex flex-col md:flex-row gap-4 p-4 pixel-shadow ${
          isSelectedForCompare ? 'border-primary ring-2 ring-primary' : 'border-border'
        } ${isHovered ? 'border-secondary' : ''}`}
      >
        {/* Image on list */}
        <div
          onClick={() => onSelectProperty(stay)}
          className="relative w-full md:w-64 aspect-[16/10] md:aspect-auto md:h-48 overflow-hidden bg-muted border-2 border-border cursor-pointer shrink-0"
        >
          <img
            src={stay.image}
            alt={stay.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${platformColor.bg} ${platformColor.text} ${platformColor.border} bg-background/90`}
            >
              {platformDisplayName(stay.platform)}
            </span>
          </div>
          {stay.superhost && (
            <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 border border-border">
              ★ SUPERHOST
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{stay.city}, {stay.country}</span>
                <span>·</span>
                <span className="uppercase text-[11px] font-bold text-foreground">
                  {stay.property_type}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-muted px-2 py-0.5 border border-border shrink-0">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{stay.rating.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground">({stay.review_count})</span>
              </div>
            </div>

            <h3
              onClick={() => onSelectProperty(stay)}
              className="text-base font-extrabold text-foreground hover:text-primary cursor-pointer line-clamp-1"
            >
              {stay.name}
            </h3>

            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {stay.summary || `${stay.bedrooms} bedroom stay located in ${stay.city} with verified amenities.`}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 bg-muted/70 border border-border">
                {stay.bedrooms} Beds
              </span>
              <span className="px-2 py-0.5 bg-muted/70 border border-border">
                {stay.bathrooms} Baths
              </span>
              <span className="px-2 py-0.5 bg-muted/70 border border-border">
                Max {stay.max_occupancy} Guests
              </span>
              {stay.amenities.slice(0, 3).map((a) => (
                <span key={a} className="px-1.5 py-0.5 bg-background border border-border/60 text-[11px]">
                  ✓ {a}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Actions */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-mono text-foreground">
                  {formatPrice(stay.nightly_price, currency)}
                </span>
                <span className="text-xs text-muted-foreground">/ night</span>
                <span className="text-xs font-bold text-muted-foreground ml-2">
                  ({formatPrice(stay.total_price, currency)} for {nights}n)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleCompareStay(stay)}
                className={`text-xs font-bold border-2 border-border h-8 ${
                  isSelectedForCompare ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {isSelectedForCompare ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Added
                  </>
                ) : (
                  '+ Compare'
                )}
              </Button>

              <Button
                size="sm"
                onClick={() => onComparePrices(stay)}
                className="h-8 bg-secondary text-secondary-foreground text-xs font-black border-2 border-border pixel-press flex items-center gap-1"
              >
                <Scale className="w-3 h-3" /> Compare Rates
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectProperty(stay)}
                className="h-8 text-xs font-bold border-2 border-border"
              >
                <Eye className="w-3 h-3 mr-1" /> Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`bg-card border-3 pixel-shadow flex flex-col h-full transition-none ${
        isSelectedForCompare ? 'border-primary ring-2 ring-primary' : 'border-border'
      } ${isHovered ? 'border-secondary' : ''}`}
    >
      {/* Image container */}
      <div
        onClick={() => onSelectProperty(stay)}
        className="relative aspect-[16/10] w-full overflow-hidden bg-muted border-b-3 border-border cursor-pointer group"
      >
        <img
          src={stay.image}
          alt={stay.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />

        {/* Platform Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span
            className={`px-2 py-0.5 text-[11px] font-bold uppercase border ${platformColor.bg} ${platformColor.text} ${platformColor.border} bg-background/90`}
          >
            {platformDisplayName(stay.platform)}
          </span>
        </div>

        {stay.superhost && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 border border-border">
            ★ SUPERHOST
          </div>
        )}

        {/* Rating overlay */}
        <div className="absolute bottom-2 right-2 z-10 bg-background/95 border border-border px-2 py-0.5 text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span>{stay.rating.toFixed(2)}</span>
          <span className="text-[10px] text-muted-foreground">({stay.review_count})</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{stay.city}, {stay.country}</span>
            <span>·</span>
            <span className="uppercase text-[11px] font-bold text-foreground">
              {stay.property_type}
            </span>
          </div>

          <h3
            onClick={() => onSelectProperty(stay)}
            className="font-extrabold text-sm sm:text-base leading-snug line-clamp-2 hover:text-primary cursor-pointer text-balance"
          >
            {stay.name}
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 bg-muted border border-border">
              {stay.bedrooms} {stay.bedrooms === 1 ? 'bed' : 'beds'}
            </span>
            <span className="px-1.5 py-0.5 bg-muted border border-border">
              {stay.bathrooms} {stay.bathrooms === 1 ? 'bath' : 'baths'}
            </span>
            <span className="px-1.5 py-0.5 bg-muted border border-border">
              {stay.max_occupancy} guests
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="mt-4 pt-3 border-t-2 border-dashed border-border">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-black font-mono text-foreground">
                {formatPrice(stay.nightly_price, currency)}
              </span>
              <span className="text-xs text-muted-foreground"> / night</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-muted-foreground">
                {formatPrice(stay.total_price, currency)} total
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Button
              onClick={() => onComparePrices(stay)}
              className="w-full h-8 bg-secondary text-secondary-foreground text-xs font-black uppercase border-2 border-border pixel-press flex items-center justify-center gap-1"
            >
              <Scale className="w-3 h-3" /> Compare Rates
            </Button>

            <div className="grid grid-cols-2 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleCompareStay(stay)}
                className={`text-xs font-bold border-2 border-border h-8 ${
                  isSelectedForCompare ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {isSelectedForCompare ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Added
                  </>
                ) : (
                  '+ Compare'
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectProperty(stay)}
                className="text-xs font-bold border-2 border-border h-8"
              >
                <Eye className="w-3 h-3 mr-1" /> Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
