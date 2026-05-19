import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { MediaCard } from '../components/MediaCard';
import { FilterToggle } from '../components/FilterToggle';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { searchMulti, getProvidersForMedia, COUNTRY } from '../api/tmdb';
import { useAuth } from '../context/AuthContext';
import type { MultiSearchItem } from '../types';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { filterActive, userProviders, loadingProviders } = useAuth();

  const [results, setResults] = useState<MultiSearchItem[]>([]);
  const [filtered, setFiltered] = useState<MultiSearchItem[] | null>(null);
  const [availability, setAvailability] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // Fetch search results
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setFiltered(null);
    setAvailability({});

    searchMulti(query)
      .then(data => {
        const items = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        setResults(items);
        setTotalResults(data.total_results);
        if (items.length === 0) setError('Aucun film ou série trouvé pour cette recherche.');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Erreur lors de la recherche.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [query]);

  // Apply filter when filterActive / providers / results change
  useEffect(() => {
    // Wait for providers to finish loading from Supabase before filtering
    if (loadingProviders) return;

    if (!filterActive || userProviders.length === 0) {
      setFiltered(null);
      setAvailability({});
      return;
    }
    if (results.length === 0) return;

    let cancelled = false;
    setFilterLoading(true);

    const userProviderIds = new Set(userProviders.map(p => Number(p.provider_id)));

    Promise.allSettled(
      results.map(item =>
        getProvidersForMedia(item.id, item.media_type as 'movie' | 'tv')
          .then(res => {
            const countryData = res.results[COUNTRY];
            const subscriptionProviders = [
              ...(countryData?.flatrate ?? []),
              ...(countryData?.free ?? []),
              ...(countryData?.ads ?? []),
            ];
            const available = subscriptionProviders.some(p =>
              userProviderIds.has(Number(p.provider_id))
            );
            return { id: item.id, available };
          })
          .catch(() => ({ id: item.id, available: false }))
      )
    ).then(settlements => {
      if (cancelled) return;
      const avMap: Record<number, boolean> = {};
      settlements.forEach(s => {
        if (s.status === 'fulfilled') avMap[s.value.id] = s.value.available;
      });
      setAvailability(avMap);
      setFiltered(results.filter(r => avMap[r.id] === true));
      setFilterLoading(false);
    });

    return () => { cancelled = true; };
  }, [filterActive, userProviders, loadingProviders, results]);

  const handleSearch = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const filterReady = filterActive && !loadingProviders && userProviders.length > 0;
  const displayResults = filterReady ? (filtered ?? []) : results;
  const isFiltering = filterReady && filterLoading;

  return (
    <div className="search-page">
      <div className="search-page__bar-wrap">
        <SearchBar onSearch={handleSearch} initialValue={query} />
        <div className="search-page__filter-row">
          <FilterToggle />
        </div>
      </div>

      <div className="search-page__content">
        {(loading || isFiltering) && (
          <Loader message={isFiltering ? 'Vérification des disponibilités…' : 'Recherche en cours…'} />
        )}

        {error && !loading && <ErrorMessage message={error} onRetry={() => navigate(0)} />}

        {!loading && !error && results.length > 0 && (
          <>
            <div className="search-page__meta">
              <p className="search-page__count">
                {filterReady && filtered !== null
                  ? <>{filtered.length} résultat{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''} sur vos plateformes</>
                  : <>{totalResults} résultat{totalResults > 1 ? 's' : ''} pour <strong>"{query}"</strong></>
                }
              </p>
            </div>

            {!isFiltering && (
              <>
                {filterReady && filtered !== null && filtered.length === 0 ? (
                  <div className="no-results-filter">
                    <span style={{ fontSize: 36 }}>😕</span>
                    <p>Aucun résultat disponible sur vos plateformes pour cette recherche.</p>
                    <button className="btn btn--outline btn--sm" onClick={() => navigate('/profile')}>
                      Modifier mes plateformes
                    </button>
                  </div>
                ) : (
                  <div className="movie-grid">
                    {displayResults.map(item => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        availableForUser={
                          filterReady && item.id in availability
                            ? availability[item.id]
                            : null
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
