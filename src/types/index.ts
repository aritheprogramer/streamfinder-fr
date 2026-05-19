export type MediaType = 'movie' | 'tv';

// ===== Movies =====
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type?: 'movie';
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  status: string;
  imdb_id: string | null;
}

// ===== TV Shows =====
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  media_type?: 'tv';
}

export interface TVShowDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genres: Genre[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  status: string;
  tagline: string;
  vote_average: number;
  episode_run_time: number[];
  networks: Network[];
  created_by: { id: number; name: string; profile_path: string | null }[];
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface SeasonDetails {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  episodes: Episode[];
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}

// ===== Multi-search =====
export interface MultiSearchItem {
  id: number;
  media_type: MediaType | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MultiSearchResponse {
  page: number;
  results: MultiSearchItem[];
  total_pages: number;
  total_results: number;
}

// ===== Shared =====
export interface Genre {
  id: number;
  name: string;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProvidersCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
}

export interface WatchProvidersResult {
  id: number;
  results: {
    [countryCode: string]: WatchProvidersCountry;
  };
}

export interface TMDBProvidersList {
  results: WatchProvider[];
}

// ===== User / Auth =====
export interface UserProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}
