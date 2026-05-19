import {
  useState, useRef, useEffect, useCallback,
  type FormEvent, type KeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSuggestions, getProvidersForMedia, getPosterUrl, COUNTRY } from '../api/tmdb';
import { useAuth } from '../context/AuthContext';
import type { MultiSearchItem } from '../types';

interface Props {
  onSearch: (query: string) => void;
  initialValue?: string;
  large?: boolean;
}

function getTitle(item: MultiSearchItem) { return item.title ?? item.name ?? ''; }
function getYear(item: MultiSearchItem) {
  const d = item.release_date ?? item.first_air_date ?? '';
  return d ? d.slice(0, 4) : null;
}

export function SearchBar({ onSearch, initialValue = '', large = false }: Props) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<MultiSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { filterActive, userProviders } = useAuth();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await searchSuggestions(q);
      // Start with up to 9 candidates to have room to filter down to 3
      const candidates = res.results
        .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
        .slice(0, 9);

      let final: MultiSearchItem[];

      if (filterActive && userProviders.length > 0) {
        const userProviderIds = new Set(userProviders.map(p => Number(p.provider_id)));
        const checked = await Promise.allSettled(
          candidates.map(item =>
            getProvidersForMedia(item.id, item.media_type as 'movie' | 'tv')
              .then(provRes => {
                const countryData = provRes.results[COUNTRY];
                const subProviders = [
                  ...(countryData?.flatrate ?? []),
                  ...(countryData?.free ?? []),
                  ...(countryData?.ads ?? []),
                ];
                const available = subProviders.some(p =>
                  userProviderIds.has(Number(p.provider_id))
                );
                return { item, available };
              })
              .catch(() => ({ item, available: false }))
          )
        );
        final = checked
          .filter(s => s.status === 'fulfilled' && s.value.available)
          .map(s => (s as PromiseFulfilledResult<{ item: MultiSearchItem; available: boolean }>).value.item)
          .slice(0, 3);
      } else {
        final = candidates.slice(0, 3);
      }

      setSuggestions(final);
      setOpen(final.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [filterActive, userProviders]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(false); setActiveIdx(-1);
    onSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === 'Enter') { setOpen(false); onSearch(value); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
    else if (e.key === 'Enter') {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        e.preventDefault();
        const item = suggestions[activeIdx];
        setOpen(false);
        navigate(item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`);
      } else {
        setOpen(false); onSearch(value);
      }
    }
  };

  const selectSuggestion = (item: MultiSearchItem) => {
    setOpen(false); setActiveIdx(-1);
    navigate(item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`);
  };

  return (
    <div ref={containerRef} className={`search-bar-wrap ${large ? 'search-bar-wrap--large' : ''}`}>
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="search-bar__inner">
          {loading
            ? <div className="search-bar__icon search-bar__icon--spin"><div className="mini-spinner" /></div>
            : (
              <svg className="search-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )
          }
          <input
            type="text"
            className="search-bar__input"
            placeholder="Rechercher un film ou une série…"
            value={value}
            onChange={e => { setValue(e.target.value); setActiveIdx(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            autoFocus={large}
            autoComplete="off"
            spellCheck="false"
          />
          {value && (
            <button type="button" className="search-bar__clear"
              onClick={() => { setValue(''); setSuggestions([]); setOpen(false); }}
              aria-label="Effacer">✕</button>
          )}
        </div>
        <button type="submit" className="search-bar__btn">Rechercher</button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="autocomplete-dropdown">
          {filterActive && userProviders.length > 0 && (
            <div className="autocomplete-filter-notice">
              <span>⚡</span> Mes plateformes
            </div>
          )}
          {suggestions.map((item, idx) => {
            const poster = getPosterUrl(item.poster_path, 'w92');
            const year = getYear(item);
            const title = getTitle(item);
            const isTV = item.media_type === 'tv';
            return (
              <div
                key={item.id}
                className={`autocomplete-item ${idx === activeIdx ? 'autocomplete-item--active' : ''}`}
                onMouseDown={() => selectSuggestion(item)}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <div className="autocomplete-item__poster">
                  {poster
                    ? <img src={poster} alt="" />
                    : <div className="autocomplete-item__no-poster">{isTV ? '📺' : '🎬'}</div>
                  }
                </div>
                <div className="autocomplete-item__info">
                  <span className="autocomplete-item__title">{title}</span>
                  {year && <span className="autocomplete-item__year">{year}</span>}
                </div>
                <span className={`autocomplete-item__badge ${isTV ? 'autocomplete-item__badge--tv' : 'autocomplete-item__badge--movie'}`}>
                  {isTV ? 'Série' : 'Film'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
