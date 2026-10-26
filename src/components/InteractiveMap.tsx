import { useState } from 'react';
import { MapPin, Navigation, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StayListing, Currency } from '@/types/stay';
import { formatPrice, platformDisplayName } from '@/services/recommendationEngine';

interface InteractiveMapProps {
  stays: StayListing[];
  currency: Currency;
  activeLocation?: string;
  onSelectStay: (stay: StayListing) => void;
  hoveredStayId?: string | null;
  onHoverStay?: (id: string | null) => void;
}

export function InteractiveMap({
  stays,
  currency,
  activeLocation,
  onSelectStay,
  hoveredStayId,
  onHoverStay,
}: InteractiveMapProps) {
  const [selectedPin, setSelectedPin] = useState<StayListing | null>(null);

  // Determine query place for Google Maps embed
  const locationQuery = encodeURIComponent(
    activeLocation && activeLocation.trim()
      ? activeLocation
      : stays.length > 0
      ? `${stays[0].city}, ${stays[0].country}`
      : 'Paris, France'
  );

  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=REMOVED&q=${locationQuery}&language=en&region=cn`;

  return (
    <div className="bg-card border-4 border-border pixel-shadow mb-8 overflow-hidden">
      {/* Map Header */}
      <div className="bg-muted px-4 py-3 border-b-4 border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-foreground">
            LIVE MAP VIEW · {stays.length} LOCATIONS IN {activeLocation ? activeLocation.toUpperCase() : 'CURRENT VIEW'}
          </span>
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          Click any stay below or on the map pin to inspect
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Google Map iframe */}
        <div className="lg:col-span-8 relative min-h-[360px] sm:min-h-[460px] bg-slate-900 border-b-4 lg:border-b-0 lg:border-r-4 border-border">
          <iframe
            title="Stay Locations Map"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '360px', height: '100%' }}
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            allowFullScreen
            className="w-full h-full filter saturate-110"
          />

          {/* Floating Pin Indicator */}
          <div className="absolute top-3 left-3 bg-card/95 border-2 border-border p-2 pixel-shadow text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 bg-primary inline-block animate-ping" />
            <span className="text-foreground">Live Geocoded Coordinates</span>
          </div>
        </div>

        {/* Sidebar list of map pins with prices */}
        <div className="lg:col-span-4 p-3 bg-muted/20 flex flex-col max-h-[460px] overflow-y-auto">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground px-2 py-1.5 border-b-2 border-border mb-2 flex items-center justify-between">
            <span>Stays in this area</span>
            <span>Rate / Night</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {stays.map((stay) => {
              const isSelected = selectedPin?.id === stay.id || hoveredStayId === stay.id;

              return (
                <div
                  key={stay.id}
                  onClick={() => setSelectedPin(stay)}
                  onMouseEnter={() => onHoverStay?.(stay.id)}
                  onMouseLeave={() => onHoverStay?.(null)}
                  className={`p-2.5 border-2 cursor-pointer transition-none flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-card border-primary pixel-shadow-sm'
                      : 'bg-card/70 border-border hover:bg-card'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{stay.city}</span>
                      <span>·</span>
                      <span>{platformDisplayName(stay.platform)}</span>
                    </div>
                    <p className="text-xs font-extrabold text-foreground truncate mt-0.5">
                      {stay.name}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mt-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{stay.rating.toFixed(2)}</span>
                      <span>({stay.review_count} rev)</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-foreground block">
                      {formatPrice(stay.nightly_price, currency)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStay(stay);
                      }}
                      className="text-[10px] font-bold text-primary hover:underline mt-1 block"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Pin Quick Preview */}
          {selectedPin && (
            <div className="mt-3 p-3 bg-card border-2 border-primary pixel-shadow-sm">
              <div className="flex items-center justify-between text-xs font-black uppercase text-primary mb-1">
                <span>Selected Pin</span>
                <button
                  type="button"
                  onClick={() => setSelectedPin(null)}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  [Dismiss]
                </button>
              </div>
              <h4 className="text-xs font-extrabold text-foreground line-clamp-1">{selectedPin.name}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{selectedPin.address}</p>
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs font-black font-mono">
                  {formatPrice(selectedPin.nightly_price, currency)} / night
                </span>
                <Button
                  size="sm"
                  onClick={() => onSelectStay(selectedPin)}
                  className="h-7 text-[11px] font-bold bg-primary text-primary-foreground border border-border"
                >
                  <Eye className="w-3 h-3 mr-1" /> Inspect
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
