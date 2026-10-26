import type {
  PropertyPriceComparison,
  SearchFilters,
  StayListing,
} from '@/types/stay';

interface SearchResponse {
  top3: StayListing[];
  results: StayListing[];
  nights: number;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL ?? '';
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    const detail =
      typeof payload.detail === 'string'
        ? payload.detail
        : `Request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return payload as T;
}

export function searchStays(filters: SearchFilters): Promise<SearchResponse> {
  return postJson('/api/search', filters);
}

export function compareStayPrices(
  stay: StayListing,
  filters: SearchFilters,
): Promise<PropertyPriceComparison> {
  return postJson('/api/compare', {
    name: stay.name,
    location: [stay.address, stay.city, stay.country].filter(Boolean).join(', '),
    check_in: filters.check_in,
    check_out: filters.check_out,
    adults: filters.adults,
    children: filters.children,
    currency: filters.currency,
  });
}
