export type PropertyType = 'any' | 'apartment' | 'house' | 'villa' | 'hotel' | 'private room' | (string & {});

export type PlatformType = 'airbnb' | 'booking' | 'vrbo' | 'google' | 'expedia' | (string & {});

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface StayListing {
  id: string;
  name: string;
  platform: PlatformType;
  platform_listing_id?: string;
  property_type: Exclude<PropertyType, 'any'>;
  city: string;
  region: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number; // 0 to 5
  review_count: number;
  max_occupancy: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  nightly_price: number;
  total_price: number;
  currency: Currency;
  image: string;
  gallery?: string[];
  booking_url: string;
  match_score?: number; // 0 - 100%
  distance_from_ideal?: number;
  summary?: string;
  host_name?: string;
  host_badge?: string;
  superhost?: boolean;
}

export interface SearchFilters {
  location: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  adults: number;
  children: number;
  currency: Currency;
  min_price: number | null;
  max_price: number | null;
  property_type: PropertyType;
  bedrooms: number;
  min_rating: number;
}

export interface PlatformOffer {
  platform: PlatformType;
  platform_display_name: string;
  nightly_price: number;
  total_price: number;
  currency: Currency;
  booking_url: string;
  is_cheapest: boolean;
  savings_vs_max?: number;
  tax_included?: boolean;
  cancellation_policy?: string;
}

export interface PropertyPriceComparison {
  property_id: string;
  property_name: string;
  location: string;
  check_in: string;
  check_out: string;
  nights: number;
  currency: Currency;
  minimum_price: number;
  median_price: number;
  maximum_price: number;
  offers: PlatformOffer[];
}
