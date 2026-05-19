import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getWatchProviders, getPosterUrl, getLogoUrl, IMAGE_BASE_URL, COUNTRY } from '../api/tmdb';
import { ProviderBadge } from '../components/ProviderBadge';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import type { MovieDetails, WatchProvidersCountry, WatchProvider } from '../types';

export function MoviePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [providers, setProviders] = useState<WatchProvidersCountry | null>(null);
  const [noProviders, setNoProviders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = parseInt(id ?? '', 10);
    if (isNaN(movieId)) { setError('ID invalide.'); setLoading(false); return; }
    setLoading(true); setError(null); setMovie(null); setProviders(null); setNoProviders(false);

    Promise.all([getMovieDetails(movieId), getWatchProviders(movieId)])
      .then(([m, p]) => {
        setMovie(m);
        const c = p.results[COUNTRY];
        if (c) setProviders(c); else setNoProviders(true);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Impossible de charger le film.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="detail-page"><Loader message="Chargement…" /></div>;
  if (error) return <div className="detail-page"><ErrorMessage message={error} onRetry={() => navigate(0)} /></div>;
  if (!movie) return null;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const poster = getPosterUrl(movie.poster_path, 'w500');
  const backdrop = movie.backdrop_path ? `${IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : null;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h${movie.runtime % 60 > 0 ? ` ${movie.runtime % 60}min` : ''}` : null;

  const flatrate = providers?.flatrate ?? [];
  const rent = providers?.rent ?? [];
  const buy = providers?.buy ?? [];
  const free = providers?.free ?? [];
  const ads = providers?.ads ?? [];

  // Primary platform bubble (first subscription platform)
  const primaryProvider: WatchProvider | null = flatrate[0] ?? free[0] ?? ads[0] ?? null;
  const extraSubscription = [...flatrate, ...free, ...ads].slice(1);
  const hasAnyProvider = flatrate.length + rent.length + buy.length + free.length + ads.length > 0;

  return (
    <DetailLayout backdrop={backdrop} onBack={() => navigate(-1)}>
      {/* Poster + bubble */}
      <div className="detail-poster-wrap">
        {poster
          ? <img src={poster} alt={movie.title} className="detail-poster" />
          : <div className="detail-poster detail-poster--empty"><span>🎬</span></div>
        }
        {primaryProvider && (
          <PlatformBubble provider={primaryProvider} link={providers?.link} />
        )}
      </div>

      {/* Title & meta */}
      <div className="detail-hero-info">
        <h1 className="detail-title">{movie.title}</h1>
        {movie.original_title !== movie.title && (
          <p className="detail-original-title">{movie.original_title}</p>
        )}
        <div className="detail-meta-row">
          {year && <span className="detail-pill">{year}</span>}
          {runtime && <span className="detail-pill">{runtime}</span>}
          {movie.vote_average > 0 && <span className="detail-pill detail-pill--gold">★ {movie.vote_average.toFixed(1)}</span>}
        </div>
        {movie.genres.length > 0 && (
          <div className="detail-genres">
            {movie.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
          </div>
        )}
        {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}
        {movie.overview && <p className="detail-overview">{movie.overview}</p>}
      </div>

      {/* Availability */}
      <div className="detail-availability">
        <h2 className="detail-section-title">
          <span>🇫🇷</span> Disponibilité en France
        </h2>

        {noProviders || !hasAnyProvider ? (
          <div className="no-availability">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
              <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p>Aucune disponibilité trouvée en France.</p>
          </div>
        ) : (
          <div className="detail-providers-layout">
            {/* Primary subscription */}
            {[...flatrate, ...free, ...ads].length > 0 && (
              <div className="detail-providers-primary">
                <div className="providers-section__title">
                  <span className="providers-section__dot providers-section__dot--green" />
                  Inclus avec l'abonnement
                </div>
                <div className="providers-list providers-list--primary">
                  {flatrate.map(p => <ProviderBadge key={p.provider_id} provider={p} link={providers?.link} size="lg" />)}
                  {free.map(p => <ProviderBadge key={p.provider_id} provider={p} link={providers?.link} size="lg" />)}
                  {ads.map(p => <ProviderBadge key={p.provider_id} provider={p} link={providers?.link} size="lg" />)}
                </div>
                {extraSubscription.length > 0 && (
                  <p className="detail-extra-hint">
                    +{extraSubscription.length} autre{extraSubscription.length > 1 ? 's' : ''} plateforme{extraSubscription.length > 1 ? 's' : ''} d'abonnement
                  </p>
                )}
              </div>
            )}

            {/* VOD / Rental / Buy */}
            {(rent.length > 0 || buy.length > 0) && (
              <div className="detail-providers-secondary">
                {rent.length > 0 && (
                  <div className="detail-vod-group">
                    <span className="detail-vod-label">
                      <span className="providers-section__dot providers-section__dot--orange" />
                      Location / VOD
                    </span>
                    <div className="providers-list">
                      {rent.map(p => <ProviderBadge key={p.provider_id} provider={p} link={providers?.link} size="md" />)}
                    </div>
                  </div>
                )}
                {buy.length > 0 && (
                  <div className="detail-vod-group">
                    <span className="detail-vod-label">
                      <span className="providers-section__dot providers-section__dot--purple" />
                      Achat digital
                    </span>
                    <div className="providers-list">
                      {buy.map(p => <ProviderBadge key={p.provider_id} provider={p} link={providers?.link} size="md" />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {providers?.link && (
              <p className="providers-attribution">
                Données via <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">JustWatch</a> / TMDB
              </p>
            )}
          </div>
        )}
      </div>
    </DetailLayout>
  );
}

// ===== Shared sub-components =====

export function DetailLayout({ backdrop, onBack, children }: {
  backdrop: string | null;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="detail-page">
      {backdrop && (
        <div className="detail-page__backdrop" style={{ backgroundImage: `url(${backdrop})` }} aria-hidden="true" />
      )}
      <div className="detail-page__container">
        <button className="btn btn--ghost btn--sm back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
        <div className="detail-hero">
          {children}
        </div>
      </div>
    </div>
  );
}

export function PlatformBubble({ provider, link }: { provider: WatchProvider; link?: string }) {
  const logo = getLogoUrl(provider.logo_path, 'w92');
  const inner = (
    <div className="platform-bubble" title={provider.provider_name}>
      {logo
        ? <img src={logo} alt={provider.provider_name} />
        : <span>{provider.provider_name.slice(0, 2)}</span>
      }
    </div>
  );
  return link
    ? <a href={link} target="_blank" rel="noopener noreferrer" className="platform-bubble-link">{inner}</a>
    : inner;
}
