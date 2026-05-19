import axios from 'axios';
import type {
  MovieDetails,
  TVShowDetails,
  SeasonDetails,
  MultiSearchResponse,
  WatchProvidersResult,
  TMDBProvidersList,
} from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const COUNTRY = 'FR';

const client = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'fr-FR' },
});

function requireKey() {
  if (!API_KEY) throw new Error('Clé API TMDB manquante. Ajoutez VITE_TMDB_API_KEY dans le fichier .env.');
}

export function getPosterUrl(path: string | null, size: 'w92' | 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function getLogoUrl(path: string | null, size: 'w45' | 'w92' | 'w154' | 'original' = 'w92'): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function getStillUrl(path: string | null): string | null {
  return path ? `${IMAGE_BASE_URL}/w300${path}` : null;
}

// ===== Search =====
export async function searchMulti(query: string, page = 1): Promise<MultiSearchResponse> {
  requireKey();
  const { data } = await client.get<MultiSearchResponse>('/search/multi', {
    params: { query, page, include_adult: false },
  });
  return data;
}

export async function searchSuggestions(query: string): Promise<MultiSearchResponse> {
  requireKey();
  const { data } = await client.get<MultiSearchResponse>('/search/multi', {
    params: { query, page: 1, include_adult: false },
  });
  return data;
}

// ===== Movie =====
export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  requireKey();
  const { data } = await client.get<MovieDetails>(`/movie/${movieId}`);
  return data;
}

export async function getWatchProviders(movieId: number): Promise<WatchProvidersResult> {
  requireKey();
  const { data } = await client.get<WatchProvidersResult>(`/movie/${movieId}/watch/providers`);
  return data;
}

// ===== TV =====
export async function getTVDetails(tvId: number): Promise<TVShowDetails> {
  requireKey();
  const { data } = await client.get<TVShowDetails>(`/tv/${tvId}`);
  return data;
}

export async function getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<SeasonDetails> {
  requireKey();
  const { data } = await client.get<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
  return data;
}

export async function getTVWatchProviders(tvId: number): Promise<WatchProvidersResult> {
  requireKey();
  const { data } = await client.get<WatchProvidersResult>(`/tv/${tvId}/watch/providers`);
  return data;
}

// ===== Providers list (for profile setup) =====
export async function getAllMovieProvidersFR(): Promise<TMDBProvidersList> {
  requireKey();
  const { data } = await client.get<TMDBProvidersList>('/watch/providers/movie', {
    params: { watch_region: COUNTRY },
  });
  return data;
}

export async function getAllTVProvidersFR(): Promise<TMDBProvidersList> {
  requireKey();
  const { data } = await client.get<TMDBProvidersList>('/watch/providers/tv', {
    params: { watch_region: COUNTRY },
  });
  return data;
}

// ===== Trending =====
export async function getTrending(type: 'movie' | 'tv'): Promise<MultiSearchResponse> {
  requireKey();
  const { data } = await client.get<MultiSearchResponse>(`/trending/${type}/week`);
  return data;
}

// ===== Filter helper =====
export async function getProvidersForMedia(id: number, type: 'movie' | 'tv'): Promise<WatchProvidersResult> {
  return type === 'movie' ? getWatchProviders(id) : getTVWatchProviders(id);
}
