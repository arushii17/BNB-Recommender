import { useEffect, useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StayListing, SearchFilters } from '@/types/stay';
import {
  formatPrice,
  platformDisplayName,
  platformBadgeColor,
  calculateNights,
} from '@/services/recommendationEngine';
import { compareStayPrices } from '@/services/api';

interface PropertyDetailModalProps {
  stay: StayListing | null;
  filters: SearchFilters;
  isOpen: boolean;
  onClose: () => void;
  onOpenPriceComparison: (stay: StayListing) => void;
  onToggleCompare: (stay: StayListing) => void;
  isInComparison: boolean;
}

export function PropertyDetailModal({
  stay,
  filters,
  isOpen,
  onClose,
  onOpenPriceComparison,
  onToggleCompare,
  isInComparison,
}: PropertyDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [comparison, setComparison] = useState<Awaited<ReturnType<typeof compareStayPrices>> | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !stay) return;

    let active = true;
    setComparison(null);
    setComparisonError(null);
    setComparisonLoading(true);
    compareStayPrices(stay, filters)
      .then((result) => {
        if (active) setComparison(result);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setComparisonError(
            requestError instanceof Error
              ? requestError.message
              : 'The live price comparison failed.',
          );
        }
      })
      .finally(() => {
        if (active) setComparisonLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, stay, filters]);

  if (!isOpen || !stay) return null;

  const currency = filters.currency;
  const nights = calculateNights(filters.check_in, filters.check_out);
  const images = stay.gallery && stay.gallery.length > 0 ? stay.gallery : [stay.image];
  const platformColor = platformBadgeColor(stay.platform);

  // Map embed URL
  const query = encodeURIComponent(`${stay.address || stay.name}, ${stay.city}`);
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=REMOVED&q=${query}&language=en&region=cn`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-card text-card-foreground border-4 border-border pixel-shadow-lg w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 border-b-4 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl">⌂</span>
            <span className="font-black text-sm sm:text-base tracking-wider uppercase">
              PROPERTY DOSSIER · {stay.city.toUpperCase()}
            </span>
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
          {/* Top gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full bg-muted border-3 border-border overflow-hidden">
              <img
                src={images[activeImageIndex] || stay.image}
                alt={stay.name}
                className="w-full h-full object-cover"
              />

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span
                  className={`px-2.5 py-1 text-xs font-black uppercase border-2 ${platformColor.bg} ${platformColor.text} ${platformColor.border} bg-background/95`}
                >
                  {platformDisplayName(stay.platform)}
                </span>
                {stay.superhost && (
                  <span className="px-2.5 py-1 text-xs font-black uppercase border-2 bg-yellow-400 text-black border-border">
                    ★ SUPERHOST
                  </span>
                )}
              </div>

              {stay.match_score && (
                <div className="absolute top-3 right-3 bg-black/85 text-yellow-400 px-2.5 py-1 text-xs font-black border border-yellow-400 font-mono">
                  {stay.match_score.toFixed(1)}% MATCH SCORE
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 border-2 shrink-0 overflow-hidden ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary' : 'border-border opacity-70'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Meta */}
          <div className="border-b-2 border-dashed border-border pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{stay.address}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 border border-border">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-sm">{stay.rating.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">({stay.review_count} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {stay.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
              {stay.summary}
            </p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-muted/40 border-2 border-border text-center">
              <Bed className="w-5 h-5 mx-auto text-primary mb-1" />
              <span className="text-xs text-muted-foreground font-bold block">Bedrooms</span>
              <span className="text-base font-black text-foreground">{stay.bedrooms} Beds</span>
            </div>
            <div className="p-3 bg-muted/40 border-2 border-border text-center">
              <Bath className="w-5 h-5 mx-auto text-secondary mb-1" />
              <span className="text-xs text-muted-foreground font-bold block">Bathrooms</span>
              <span className="text-base font-black text-foreground">{stay.bathrooms} Baths</span>
            </div>
            <div className="p-3 bg-muted/40 border-2 border-border text-center">
              <Users className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
              <span className="text-xs text-muted-foreground font-bold block">Capacity</span>
              <span className="text-base font-black text-foreground">Up to {stay.max_occupancy}</span>
            </div>
            <div className="p-3 bg-muted/40 border-2 border-border text-center">
              <Award className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <span className="text-xs text-muted-foreground font-bold block">Host Type</span>
              <span className="text-sm font-black text-foreground truncate block">
                {stay.host_name || 'Verified Host'}
              </span>
            </div>
          </div>

          {/* Multi-Platform Price Arbitrage Table */}
          <div className="bg-muted/30 border-3 border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-wide">
                  Live Multi-Platform Rates ({nights} Nights)
                </h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenPriceComparison(stay)}
                className="text-xs font-bold border-2 border-border h-7"
              >
                Deep Radar View ↗
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border bg-card">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="p-2 text-left font-bold">Platform</th>
                    <th className="p-2 text-left font-bold">Rate / Night</th>
                    <th className="p-2 text-left font-bold">Total Stay</th>
                    <th className="p-2 text-left font-bold">Cancellation</th>
                    <th className="p-2 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison?.offers.map((offer) => (
                    <tr
                      key={offer.platform}
                      className={`border-b border-border ${
                        offer.is_cheapest ? 'bg-emerald-500/10 font-bold' : ''
                      }`}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <span>{offer.platform_display_name}</span>
                          {offer.is_cheapest && (
                            <span className="bg-emerald-600 text-white text-[9px] px-1 py-0.2 font-black uppercase">
                              CHEAPEST
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 font-mono">{formatPrice(offer.nightly_price, currency)}</td>
                      <td className="p-2 font-mono font-black">{formatPrice(offer.total_price, currency)}</td>
                      <td className="p-2 text-muted-foreground">{offer.cancellation_policy}</td>
                      <td className="p-2 text-right">
                        <a
                          href={offer.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <Button
                            size="sm"
                            className={`h-6 text-[10px] font-black uppercase border border-border ${
                              offer.is_cheapest
                                ? 'bg-emerald-600 text-white'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            Book ↗
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {comparisonLoading && (
              <p className="mt-3 text-xs font-bold text-muted-foreground">Loading live provider rates…</p>
            )}
            {comparisonError && (
              <p className="mt-3 text-xs font-bold text-red-700 dark:text-red-400">{comparisonError}</p>
            )}
            {comparison && comparison.offers.length === 0 && !comparisonLoading && (
              <p className="mt-3 text-xs font-bold text-muted-foreground">No provider offers were returned for this stay.</p>
            )}
          </div>

          {/* Amenities Breakdown */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Included Stays Amenities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stay.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="p-2 bg-card border-2 border-border text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Location & Surroundings
            </h3>
            <div className="aspect-[16/9] w-full border-3 border-border bg-slate-900 overflow-hidden">
              <iframe
                title="Property Detailed Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}
                allowFullScreen
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Coordinates: {stay.latitude.toFixed(4)}, {stay.longitude.toFixed(4)} · {stay.address}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted border-t-4 border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-lg font-black font-mono text-foreground mr-1">
              {formatPrice(stay.nightly_price, currency)}
            </span>
            <span className="text-xs text-muted-foreground font-medium">/ night</span>
            <span className="text-xs font-bold text-muted-foreground ml-2">
              ({formatPrice(stay.total_price, currency)} total for {nights} nights)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleCompare(stay)}
              className={`text-xs font-bold border-2 border-border ${
                isInComparison ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {isInComparison ? '✓ In Comparison Matrix' : '+ Add to Matrix'}
            </Button>

            <Button
              size="sm"
              onClick={() => onOpenPriceComparison(stay)}
              className="text-xs font-black bg-secondary text-secondary-foreground border-2 border-border pixel-press"
            >
              <Scale className="w-3.5 h-3.5 mr-1" /> Compare 5 Platforms
            </Button>

            <a
              href={stay.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button
                size="sm"
                className="text-xs font-black bg-primary text-primary-foreground border-2 border-border pixel-press"
              >
                <span>Direct Booking ↗</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
