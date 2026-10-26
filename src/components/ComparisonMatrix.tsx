import {
  Scale,
  X,
  Trash2,
  Star,
  Check,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StayListing, Currency } from '@/types/stay';
import {
  formatPrice,
  platformDisplayName,
  platformBadgeColor,
} from '@/services/recommendationEngine';

interface ComparisonMatrixProps {
  selectedStays: StayListing[];
  currency: Currency;
  nights: number;
  isOpen: boolean;
  onClose: () => void;
  onRemoveStay: (id: string) => void;
  onClearAll: () => void;
  onOpenPriceComparison: (stay: StayListing) => void;
  onSelectProperty: (stay: StayListing) => void;
}

const COMMON_AMENITIES = [
  'High-speed WiFi',
  'Air Conditioning',
  'Kitchen',
  'Private Pool',
  'Washer/Dryer',
  'Free Parking',
  'Elevator',
  'Workspace',
  'Balcony',
  'Pet Friendly',
];

export function ComparisonMatrix({
  selectedStays,
  currency,
  nights,
  isOpen,
  onClose,
  onRemoveStay,
  onClearAll,
  onOpenPriceComparison,
  onSelectProperty,
}: ComparisonMatrixProps) {
  if (!isOpen) return null;

  // Find lowest price stay among selected
  const lowestPriceStayId =
    selectedStays.length > 0
      ? selectedStays.reduce((prev, curr) =>
          curr.nightly_price < prev.nightly_price ? curr : prev
        ).id
      : null;

  // Find highest rated stay among selected
  const highestRatedStayId =
    selectedStays.length > 0
      ? selectedStays.reduce((prev, curr) =>
          curr.rating > prev.rating ? curr : prev
        ).id
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-card text-card-foreground border-4 border-border pixel-shadow-lg w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 border-b-4 border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  SIDE-BY-SIDE PROPERTY MATRIX
                </h2>
                <Badge className="bg-yellow-400 text-black border border-border text-[11px] font-black">
                  {selectedStays.length} / 4 STAYS
                </Badge>
              </div>
              <p className="text-xs text-primary-foreground/80 font-medium">
                Compare attributes, specs, amenities, and pricing side-by-side.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedStays.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 text-xs font-bold"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="border-2 border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Matrix Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {selectedStays.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-muted border-3 border-border mx-auto flex items-center justify-center text-2xl font-black">
                ⌂
              </div>
              <h3 className="text-lg font-black text-foreground">No Stays Added to Comparison</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Select between 2 and 4 stays by clicking the "+ Compare" button on any listing card or top recommendation to compare them side by side.
              </p>
              <Button
                onClick={onClose}
                className="bg-primary text-primary-foreground border-2 border-border font-bold text-xs pixel-press"
              >
                Browse Stays Now
              </Button>
            </div>
          ) : selectedStays.length === 1 ? (
            <div className="py-8 text-center space-y-4">
              <div className="p-4 bg-yellow-400/15 border-2 border-yellow-500 max-w-lg mx-auto text-yellow-800 dark:text-yellow-300 font-bold text-xs flex items-center gap-2 text-left">
                <Sparkles className="w-5 h-5 shrink-0 text-yellow-500" />
                <span>
                  You need at least <strong>2 properties</strong> to generate a meaningful side-by-side comparison matrix. Please add 1 to 3 more properties!
                </span>
              </div>
            </div>
          ) : null}

          {selectedStays.length >= 1 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-3 border-border text-xs min-w-[640px]">
                {/* Properties Header row */}
                <thead>
                  <tr className="bg-muted">
                    <th className="p-3 border-2 border-border text-left font-black uppercase w-44">
                      Attributes
                    </th>
                    {selectedStays.map((stay) => {
                      const isCheapest = stay.id === lowestPriceStayId && selectedStays.length > 1;
                      const isHighestRated = stay.id === highestRatedStayId && selectedStays.length > 1;
                      const pColor = platformBadgeColor(stay.platform);

                      return (
                        <th
                          key={stay.id}
                          className="p-3 border-2 border-border text-left font-bold min-w-[200px] align-top bg-card"
                        >
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => onRemoveStay(stay.id)}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white border border-border hover:bg-red-600"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            <img
                              src={stay.image}
                              alt={stay.name}
                              className="w-full aspect-[16/10] object-cover border-2 border-border mb-2"
                            />

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1 mb-1">
                              {isCheapest && (
                                <span className="bg-emerald-500 text-black font-black text-[10px] px-1.5 py-0.2 border border-border">
                                  LOWEST PRICE
                                </span>
                              )}
                              {isHighestRated && (
                                <span className="bg-yellow-400 text-black font-black text-[10px] px-1.5 py-0.2 border border-border">
                                  TOP RATED
                                </span>
                              )}
                            </div>

                            <h4
                              onClick={() => onSelectProperty(stay)}
                              className="font-extrabold text-xs leading-snug line-clamp-2 hover:text-primary cursor-pointer text-foreground"
                            >
                              {stay.name}
                            </h4>

                            <span
                              className={`inline-block mt-1 px-1.5 py-0.2 text-[10px] font-bold uppercase border ${pColor.bg} ${pColor.text} ${pColor.border}`}
                            >
                              {platformDisplayName(stay.platform)}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {/* Nightly Rate */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Nightly Rate
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-mono font-black text-sm">
                        {formatPrice(stay.nightly_price, currency)}
                        <span className="text-[10px] text-muted-foreground font-sans font-normal ml-1">
                          / night
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Total Stay */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Total Stay ({nights} nights)
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-mono font-black text-base text-primary">
                        {formatPrice(stay.total_price, currency)}
                      </td>
                    ))}
                  </tr>

                  {/* Rating & Reviews */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Guest Rating
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-semibold">
                        <div className="flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span>{stay.rating.toFixed(2)}</span>
                          <span className="text-muted-foreground font-normal">
                            ({stay.review_count} reviews)
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Match Score */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Vector Match Score
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-bold">
                        {stay.match_score ? (
                          <span className="px-2 py-0.5 bg-yellow-400 text-black border border-border font-mono font-black text-xs">
                            {stay.match_score.toFixed(1)}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Location & Type */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Property Type & City
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-medium">
                        <span className="uppercase font-bold text-foreground block">
                          {stay.property_type}
                        </span>
                        <span className="text-muted-foreground">
                          {stay.city}, {stay.country}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Room Specs */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Bedrooms & Baths
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-medium">
                        {stay.bedrooms} Beds · {stay.bathrooms} Baths (Max {stay.max_occupancy} guests)
                      </td>
                    ))}
                  </tr>

                  {/* Host status */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Host Credentials
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border font-medium">
                        <span className="font-bold">{stay.host_name || 'Verified Host'}</span>
                        {stay.superhost && (
                          <span className="block text-[10px] text-yellow-600 dark:text-yellow-400 font-black">
                            ★ SUPERHOST STATUS
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities Matrix */}
                  {COMMON_AMENITIES.map((amenity) => (
                    <tr key={amenity}>
                      <td className="p-2.5 border-2 border-border font-semibold text-muted-foreground bg-muted/20">
                        {amenity}
                      </td>
                      {selectedStays.map((stay) => {
                        const hasAmenity = stay.amenities.some((a) =>
                          a.toLowerCase().includes(amenity.toLowerCase())
                        );
                        return (
                          <td
                            key={stay.id}
                            className={`p-2.5 border-2 border-border text-center ${
                              hasAmenity ? 'bg-emerald-500/10' : ''
                            }`}
                          >
                            {hasAmenity ? (
                              <Check className="w-4 h-4 text-emerald-600 mx-auto font-black" />
                            ) : (
                              <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Action row */}
                  <tr>
                    <td className="p-3 border-2 border-border font-extrabold bg-muted/40">
                      Actions
                    </td>
                    {selectedStays.map((stay) => (
                      <td key={stay.id} className="p-3 border-2 border-border">
                        <div className="space-y-1.5">
                          <Button
                            size="sm"
                            onClick={() => onOpenPriceComparison(stay)}
                            className="w-full text-xs font-black bg-secondary text-secondary-foreground border-2 border-border pixel-press"
                          >
                            <Scale className="w-3 h-3 mr-1" /> Compare Rates
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectProperty(stay)}
                            className="w-full text-xs font-bold border-2 border-border"
                          >
                            View Full Specs
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted border-t-4 border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-muted-foreground font-bold">
            💡 Tip: Compare up to 4 stays to inspect price differentials and amenity perks before booking.
          </p>
          <Button
            onClick={onClose}
            className="bg-primary text-primary-foreground border-2 border-border font-black text-xs pixel-press"
          >
            Done Comparing
          </Button>
        </div>
      </div>
    </div>
  );
}
