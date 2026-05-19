import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { FilterToggle } from '../components/FilterToggle';
import { getTrending, getProvidersForMedia, getPosterUrl, getLogoUrl, COUNTRY } from '../api/tmdb';
import type { MultiSearchItem, WatchProvider } from '../types';

interface CarouselCard { item: MultiSearchItem; provider: WatchProvider | null; }

const ROW_SPEEDS = [58, 48, 65, 52, 70, 45, 62, 55, 43, 68, 50, 60, 47, 72, 53, 44, 66, 51, 57, 64, 46, 69, 42, 56, 63];
const NUM_ROWS = 25;

function CarouselRow({ cards, reverse, speed }: { cards: CarouselCard[]; reverse: boolean; speed: number }) {
  // ×4 copies for seamless loop on any screen width
  const quad = [...cards, ...cards, ...cards, ...cards];
  return (
    <div className="carousel-row">
      <div
        className={`carousel-track ${reverse ? 'carousel-track--reverse' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {quad.map((c, i) => {
          const poster = getPosterUrl(c.item.poster_path, 'w342');
          const logo = c.provider ? getLogoUrl(c.provider.logo_path, 'w45') : null;
          if (!poster) return null;
          return (
            <div key={`${c.item.id}-${i}`} className="carousel-card">
              <img src={poster} alt="" loading="lazy" draggable={false} />
              {logo && (
                <div className="carousel-card__platform" title={c.provider!.provider_name}>
                  <img src={logo} alt="" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CarouselCard[][]>([]);
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getTrending('movie'), getTrending('tv')])
      .then(async ([movies, tv]) => {
        if (cancelled) return;

        // Interleave movie & TV, keep only poster-having items
        const movieItems = movies.results.filter(m => m.poster_path).map(m => ({ ...m, media_type: 'movie' as const }));
        const tvItems    = tv.results.filter(t => t.poster_path).map(t => ({ ...t, media_type: 'tv' as const }));
        const mixed: MultiSearchItem[] = [];
        for (let i = 0; i < Math.max(movieItems.length, tvItems.length); i++) {
          if (movieItems[i]) mixed.push(movieItems[i]);
          if (tvItems[i])    mixed.push(tvItems[i]);
        }

        // Fetch all providers in parallel, keep only streaming-available items
        const results = await Promise.allSettled(
          mixed.map(item =>
            getProvidersForMedia(item.id, item.media_type as 'movie' | 'tv').then(res => {
              const fr = res.results[COUNTRY];
              const primary = fr?.flatrate?.[0] ?? fr?.free?.[0] ?? fr?.ads?.[0] ?? null;
              return primary ? { item, provider: primary } : null;
            }).catch(() => null)
          )
        );
        if (cancelled) return;

        const streamingCards: CarouselCard[] = results
          .filter(r => r.status === 'fulfilled' && r.value !== null)
          .map(r => (r as PromiseFulfilledResult<CarouselCard>).value);

        if (streamingCards.length < 6) return; // not enough to show

        // Each row starts at a different offset for visual variety
        const rotate = (arr: CarouselCard[], n: number) => [...arr.slice(n), ...arr.slice(0, n)];
        const rowArr: CarouselCard[][] = [];
        for (let i = 0; i < NUM_ROWS; i++) {
          const offset = Math.floor((i * streamingCards.length) / NUM_ROWS) % streamingCards.length;
          rowArr.push(rotate(streamingCards, offset));
        }
        setRows(rowArr);
        setCarouselReady(true);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const handleSearch = (query: string) => {
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="home-page">
      <div className="home-page__hero">

        {/* ── Diagonal carousel background ── */}
        <div className={`carousel-bg ${carouselReady ? 'carousel-bg--ready' : ''}`} aria-hidden="true">
          {carouselReady && rows.map((cards, i) => (
            <CarouselRow
              key={i}
              cards={cards}
              reverse={i % 2 !== 0}
              speed={ROW_SPEEDS[i % ROW_SPEEDS.length]}
            />
          ))}
        </div>
        <div className="carousel-overlay" aria-hidden="true" />

        {/* ── Foreground ── */}
        <div className="home-page__content">
          <div className="home-page__logo-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#e50914" />
              <polygon points="18,12 38,24 18,36" fill="white" />
            </svg>
          </div>
          <h1 className="home-page__title">StreamFinder</h1>
          <p className="home-page__subtitle">Films &amp; séries — trouvez où regarder en France.</p>
          <SearchBar onSearch={handleSearch} large />
          <FilterToggle />
        </div>
      </div>
    </div>
  );
}
