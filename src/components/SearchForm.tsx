import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Users,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  MapPin,
  Star,
  Home,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SearchFilters, PropertyType } from '@/types/stay';
import { CURRENCY_SYMBOLS } from '@/services/currency';

interface SearchFormProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  totalMatches: number;
  isSearching: boolean;
}

const QUICK_DESTINATIONS = [
  { name: 'Paris', country: 'France', flag: '🇫🇷' },
  { name: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { name: 'New Delhi', country: 'India', flag: '🇮🇳' },
  { name: 'London', country: 'UK', flag: '🇬🇧' },
  { name: 'New York', country: 'USA', flag: '🇺🇸' },
  { name: 'Bali', country: 'Indonesia', flag: '🇮🇩' },
];

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: 'any', label: 'Any Type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'private room', label: 'Private Room' },
];

export function SearchForm({
  filters,
  onChange,
  onSearch,
  totalMatches,
  isSearching,
}: SearchFormProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currencySymbol = CURRENCY_SYMBOLS[filters.currency] || '$';

  const handleDestinationSelect = (city: string) => {
    onChange({
      ...filters,
      location: city,
    });
    setErrorMsg(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.location.trim()) {
      setErrorMsg('Enter a destination to search.');
      return;
    }
    if (filters.check_out <= filters.check_in) {
      setErrorMsg('Check-out date must be after check-in date.');
      return;
    }
    if (
      filters.max_price !== null &&
      filters.min_price !== null &&
      filters.min_price > filters.max_price
    ) {
      setErrorMsg('Maximum price must be greater than minimum price.');
      return;
    }
    setErrorMsg(null);
    onSearch();
  };

  const handleResetFilters = () => {
    const today = new Date();
    const inDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const outDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

    onChange({
      location: '',
      check_in: inDate.toISOString().split('T')[0],
      check_out: outDate.toISOString().split('T')[0],
      adults: 2,
      children: 0,
      currency: filters.currency,
      min_price: null,
      max_price: null,
      property_type: 'any',
      bedrooms: 0,
      min_rating: 0,
    });
    setErrorMsg(null);
  };

  return (
    <div className="w-full bg-card border-4 border-border pixel-shadow-lg mb-8">
      {/* Arcade Header Banner */}
      <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 border-b-4 border-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase">
            PLAN YOUR STAY · CROSS-PLATFORM RADAR
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-black/40 px-2 py-0.5 border border-primary-foreground/30">
            {totalMatches} STAYS DETECTED
          </span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-6">
        {/* Quick Destination Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Popular Global Destinations
            </Label>
            {filters.location && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, location: '' })}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Clear Location [×]
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_DESTINATIONS.map((dest) => {
              const isSelected =
                filters.location.toLowerCase().includes(dest.name.toLowerCase());
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => handleDestinationSelect(dest.name)}
                  className={`px-3 py-1.5 text-xs font-bold border-2 transition-none flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-border pixel-shadow-sm'
                      : 'bg-muted/70 text-foreground border-border hover:bg-muted'
                  }`}
                >
                  <span>{dest.flag}</span>
                  <span>{dest.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Row: Destination, Dates, Guests */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Destination Input */}
          <div className="md:col-span-5 space-y-1.5">
            <Label htmlFor="destination-input" className="text-xs font-extrabold tracking-wide uppercase">
              Where are you going?
            </Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="destination-input"
                type="text"
                value={filters.location}
                onChange={(e) => {
                  onChange({ ...filters, location: e.target.value });
                  setErrorMsg(null);
                }}
                placeholder="e.g. Paris, Tokyo, New Delhi, London..."
                className="pl-9 h-11 border-2 border-border font-medium text-sm focus-visible:ring-0 focus-visible:border-primary"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="checkin-date" className="text-xs font-extrabold tracking-wide uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" /> Check-in
              </Label>
              <Input
                id="checkin-date"
                type="date"
                value={filters.check_in}
                onChange={(e) => onChange({ ...filters, check_in: e.target.value })}
                className="h-11 border-2 border-border text-xs sm:text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout-date" className="text-xs font-extrabold tracking-wide uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-secondary" /> Check-out
              </Label>
              <Input
                id="checkout-date"
                type="date"
                value={filters.check_out}
                onChange={(e) => onChange({ ...filters, check_out: e.target.value })}
                className="h-11 border-2 border-border text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="adults-input" className="text-xs font-extrabold tracking-wide uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-primary" /> Adults
              </Label>
              <Input
                id="adults-input"
                type="number"
                min={1}
                max={20}
                value={filters.adults}
                onChange={(e) =>
                  onChange({ ...filters, adults: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="h-11 border-2 border-border text-sm font-bold text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="children-input" className="text-xs font-extrabold tracking-wide uppercase">
                Children
              </Label>
              <Input
                id="children-input"
                type="number"
                min={0}
                max={10}
                value={filters.children}
                onChange={(e) =>
                  onChange({ ...filters, children: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="h-11 border-2 border-border text-sm font-bold text-center"
              />
            </div>
          </div>
        </div>

        {/* Filter Toggle and Reset Bar */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-extrabold flex items-center gap-1.5 border border-border bg-muted/40 hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            {showFilters ? 'Hide Advanced Filters [-]' : 'Refine Your Search [+]'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </Button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showFilters && (
          <div className="p-4 bg-muted/30 border-2 border-border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Min Price */}
              <div className="space-y-1.5">
                <Label htmlFor="min-price-input" className="text-xs font-bold uppercase">
                  Min Price / Night ({currencySymbol})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="min-price-input"
                    type="number"
                    min={0}
                    step={10}
                    placeholder="0"
                    value={filters.min_price ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      onChange({ ...filters, min_price: val });
                    }}
                    className="pl-8 h-10 border-2 border-border text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Max Price */}
              <div className="space-y-1.5">
                <Label htmlFor="max-price-input" className="text-xs font-bold uppercase">
                  Max Price / Night ({currencySymbol})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="max-price-input"
                    type="number"
                    min={0}
                    step={25}
                    placeholder="No limit"
                    value={filters.max_price ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value) : null;
                      onChange({ ...filters, max_price: val });
                    }}
                    className="pl-8 h-10 border-2 border-border text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-1.5">
                <Label htmlFor="property-type-select" className="text-xs font-bold uppercase flex items-center gap-1">
                  <Home className="w-3 h-3 text-primary" /> Property Type
                </Label>
                <select
                  id="property-type-select"
                  value={filters.property_type}
                  onChange={(e) =>
                    onChange({ ...filters, property_type: e.target.value as PropertyType })
                  }
                  className="w-full h-10 px-3 border-2 border-border bg-background text-foreground text-xs font-bold uppercase focus:outline-none"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Bedrooms */}
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms-input" className="text-xs font-bold uppercase">
                  Min Bedrooms
                </Label>
                <Input
                  id="bedrooms-input"
                  type="number"
                  min={0}
                  max={10}
                  value={filters.bedrooms}
                  onChange={(e) =>
                    onChange({ ...filters, bedrooms: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="h-10 border-2 border-border text-sm font-bold"
                />
              </div>
            </div>

            {/* Guest Rating Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-bold uppercase flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Minimum Guest Rating
                </Label>
                <span className="px-2 py-0.5 bg-card border-2 border-border text-xs font-black">
                  {filters.min_rating > 0 ? `★ ${filters.min_rating.toFixed(1)} & up` : 'Any Rating'}
                </span>
              </div>
              <Slider
                value={[filters.min_rating]}
                min={0}
                max={5}
                step={0.1}
                onValueChange={(vals) => onChange({ ...filters, min_rating: vals[0] })}
                className="py-2"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border-2 border-red-500 text-red-600 dark:text-red-400 font-bold text-xs">
            [ERROR] {errorMsg}
          </div>
        )}

        {/* Search Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={isSearching}
            className="w-full h-12 bg-primary text-primary-foreground text-sm sm:text-base font-black tracking-wider uppercase border-3 border-border pixel-shadow pixel-press hover:bg-primary/90"
          >
            {isSearching ? 'SEARCHING LIVE LISTINGS…' : 'SEARCH STAYS ACROSS 4 PLATFORMS →'}
          </Button>
        </div>
      </form>
    </div>
  );
}
