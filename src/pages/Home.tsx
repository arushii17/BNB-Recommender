import { useState, useMemo, useEffect } from 'react';
import {
  Grid3X3,
  List,
  Map as MapIcon,
  ArrowUpDown,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { SearchForm } from '@/components/SearchForm';
import { TopRecommendations } from '@/components/TopRecommendations';
import { PropertyCard } from '@/components/PropertyCard';
import { InteractiveMap } from '@/components/InteractiveMap';
import { PriceComparisonModal } from '@/components/PriceComparisonModal';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';

import type { StayListing, SearchFilters } from '@/types/stay';
import { calculateNights } from '@/services/recommendationEngine';
import { searchStays } from '@/services/api';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark class on root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial filters
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const today = new Date();
    const inDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const outDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
    return {
      location: '',
      check_in: inDate.toISOString().split('T')[0],
      check_out: outDate.toISOString().split('T')[0],
      adults: 2,
      children: 0,
      currency: 'USD',
      min_price: null,
      max_price: null,
      property_type: 'any',
      bedrooms: 0,
      min_rating: 0,
    };
  });
  const [top3, setTop3] = useState<StayListing[]>([]);
  const [allResults, setAllResults] = useState<StayListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'match' | 'price-asc' | 'price-desc' | 'rating' | 'reviews'>('match');
  const [hoveredStayId, setHoveredStayId] = useState<string | null>(null);

  // Modals state
  const [comparisonStays, setComparisonStays] = useState<StayListing[]>([]);
  const [isComparisonMatrixOpen, setIsComparisonMatrixOpen] = useState(false);

  const [activePriceCompareStay, setActivePriceCompareStay] = useState<StayListing | null>(null);
  const [isPriceCompareOpen, setIsPriceCompareOpen] = useState(false);

  const [activeDetailStay, setActiveDetailStay] = useState<StayListing | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const nights = calculateNights(filters.check_in, filters.check_out);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await searchStays(filters);
      setTop3(response.top3);
      setAllResults(response.results);
      toast.success(`Found ${response.results.length} stays matching your criteria`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The live search failed.';
      setTop3([]);
      setAllResults([]);
      toast.error(message);
    } finally {
      setIsSearching(false);
    }
  };

  // Sorting
  const sortedResults = useMemo(() => {
    const list = [...allResults];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.nightly_price - b.nightly_price);
      case 'price-desc':
        return list.sort((a, b) => b.nightly_price - a.nightly_price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return list.sort((a, b) => b.review_count - a.review_count);
      case 'match':
      default:
        return list; // already ordered by vector distance from ideal
    }
  }, [allResults, sortBy]);

  // Handlers for comparison selection
  const handleToggleCompareStay = (stay: StayListing) => {
    const exists = comparisonStays.some((s) => s.id === stay.id);
    if (exists) {
      setComparisonStays((prev) => prev.filter((s) => s.id !== stay.id));
      toast.info(`Removed "${stay.name}" from comparison`);
    } else {
      if (comparisonStays.length >= 4) {
        toast.warning('Maximum 4 properties can be compared simultaneously.');
        return;
      }
      setComparisonStays((prev) => [...prev, stay]);
      toast.success(`Added "${stay.name}" to comparison (${comparisonStays.length + 1}/4)`);
    }
  };

  const handleOpenPriceComparison = (stay: StayListing) => {
    setActivePriceCompareStay(stay);
    setIsPriceCompareOpen(true);
  };

  const handleSelectProperty = (stay: StayListing) => {
    setActiveDetailStay(stay);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <Navbar
        comparisonCount={comparisonStays.length}
        onOpenComparison={() => setIsComparisonMatrixOpen(true)}
        currency={filters.currency}
        onCurrencyChange={(c) => setFilters((prev) => ({ ...prev, currency: c }))}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Retro Hero Header */}
        <div className="mb-8 p-6 sm:p-8 bg-card border-4 border-border pixel-shadow relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black border-2 border-border text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" /> SMART STAY SEARCH ENGINE
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
              Find the right stay. Compare where it's cheapest.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed text-pretty">
              Search accommodation across Airbnb, Booking.com, Vrbo, and Google Hotels. Vector-ranked recommendations with rate comparisons from the existing live provider.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-dashed border-border text-xs font-bold">
              <div className="flex items-center gap-2.5 p-2 bg-muted/60 border border-border">
                <span className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center font-black">
                  01
                </span>
                <span>Multiple Platforms Scanned</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-muted/60 border border-border">
                <span className="w-6 h-6 bg-secondary text-secondary-foreground flex items-center justify-center font-black">
                  02
                </span>
                <span>One Unified Comparison</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 bg-muted/60 border border-border">
                <span className="w-6 h-6 bg-emerald-500 text-black flex items-center justify-center font-black">
                  03
                </span>
                <span>Your Independent Choice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <SearchForm
          filters={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          totalMatches={allResults.length}
          isSearching={isSearching}
        />

        {/* Top 3 Algorithmic Recommendations */}
        <TopRecommendations
          top3={top3}
          currency={filters.currency}
          nights={nights}
          onComparePrices={handleOpenPriceComparison}
          onSelectProperty={handleSelectProperty}
          onToggleCompareStay={handleToggleCompareStay}
          isStayInComparison={(id) => comparisonStays.some((s) => s.id === id)}
        />

        {/* Map View Toggle Section (when map mode active) */}
        {viewMode === 'map' && (
          <InteractiveMap
            stays={sortedResults}
            currency={filters.currency}
            activeLocation={filters.location}
            onSelectStay={handleSelectProperty}
            hoveredStayId={hoveredStayId}
            onHoverStay={setHoveredStayId}
          />
        )}

        {/* Results Controls Bar */}
        <div className="bg-card border-4 border-border pixel-shadow p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-wide uppercase text-foreground">
                ALL MATCHING STAYS ({sortedResults.length})
              </h3>
              {filters.location && (
                <Badge variant="outline" className="text-xs font-bold border-2 border-border bg-muted">
                  in {filters.location}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nights} night stay · {filters.adults} adults · {filters.currency}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 border-2 border-border bg-background px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-black uppercase text-foreground focus:outline-none cursor-pointer"
              >
                <option value="match">★ Best Match Score</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Guest Rating</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center border-2 border-border bg-card">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-none ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-none ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`p-1.5 transition-none ${
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Interactive Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid / List */}
        {!hasSearched ? (
          <div className="bg-card border-4 border-border pixel-shadow p-12 text-center space-y-4 my-8">
            <div className="w-16 h-16 bg-muted border-3 border-border mx-auto flex items-center justify-center text-3xl">
              🔍
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              Search live stays to get started
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Choose a destination and dates above to search current listings and get recommendations.
            </p>
          </div>
        ) : sortedResults.length === 0 ? (
          <div className="bg-card border-4 border-border pixel-shadow p-12 text-center space-y-4 my-8">
            <div className="w-16 h-16 bg-muted border-3 border-border mx-auto flex items-center justify-center text-3xl">
              🔍
            </div>
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              No properties matched your requirements
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Try expanding your maximum budget, reducing minimum bedrooms, clearing destination keyword, or selecting "Any Type".
            </p>
            <Button
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  location: '',
                  min_price: null,
                  max_price: null,
                  property_type: 'any',
                  bedrooms: 0,
                  min_rating: 0,
                }));
              }}
              className="bg-primary text-primary-foreground border-2 border-border font-black text-xs pixel-press"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset All Filters
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {sortedResults.map((stay) => (
              <PropertyCard
                key={stay.id}
                stay={stay}
                currency={filters.currency}
                nights={nights}
                viewMode={viewMode === 'map' ? 'list' : viewMode}
                onComparePrices={handleOpenPriceComparison}
                onSelectProperty={handleSelectProperty}
                onToggleCompareStay={handleToggleCompareStay}
                isSelectedForCompare={comparisonStays.some((s) => s.id === stay.id)}
                isHovered={hoveredStayId === stay.id}
                onMouseEnter={() => setHoveredStayId(stay.id)}
                onMouseLeave={() => setHoveredStayId(null)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Comparison Drawer Bar */}
      {comparisonStays.length > 0 && (
        <aside
          aria-label="Comparison dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-card border-4 border-border pixel-shadow-lg p-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shrink-0 border border-border">
              {comparisonStays.length}
            </span>
            <div className="min-w-0">
              <span className="text-xs font-black uppercase text-foreground block truncate">
                {comparisonStays.length === 1
                  ? '1 property selected'
                  : `${comparisonStays.length} properties selected`}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {comparisonStays.length < 2
                  ? 'Select at least 1 more to compare'
                  : 'Ready for side-by-side comparison'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonStays([])}
              className="text-xs font-bold border-2 border-border h-8"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setIsComparisonMatrixOpen(true)}
              className="bg-primary text-primary-foreground font-black text-xs uppercase border-2 border-border pixel-press h-8 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare Now ({comparisonStays.length})</span>
            </Button>
          </div>
        </aside>
      )}

      {/* Modals */}
      <PriceComparisonModal
        stay={activePriceCompareStay}
        filters={filters}
        isOpen={isPriceCompareOpen}
        onClose={() => {
          setIsPriceCompareOpen(false);
          setActivePriceCompareStay(null);
        }}
      />

      <ComparisonMatrix
        selectedStays={comparisonStays}
        currency={filters.currency}
        nights={nights}
        isOpen={isComparisonMatrixOpen}
        onClose={() => setIsComparisonMatrixOpen(false)}
        onRemoveStay={(id) => setComparisonStays((prev) => prev.filter((s) => s.id !== id))}
        onClearAll={() => setComparisonStays([])}
        onOpenPriceComparison={handleOpenPriceComparison}
        onSelectProperty={handleSelectProperty}
      />

      <PropertyDetailModal
        stay={activeDetailStay}
        filters={filters}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveDetailStay(null);
        }}
        onOpenPriceComparison={handleOpenPriceComparison}
        onToggleCompare={handleToggleCompareStay}
        isInComparison={
          activeDetailStay ? comparisonStays.some((s) => s.id === activeDetailStay.id) : false
        }
      />

      {/* Retro Footer */}
      <footer className="mt-16 bg-card border-t-4 border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center font-black">
              ⌂
            </div>
            <span className="text-foreground font-extrabold">FindMyFlat</span>
            <span>· Search smarter. Compare better. Book where you prefer.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-foreground cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-foreground cursor-pointer">Platform API Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
