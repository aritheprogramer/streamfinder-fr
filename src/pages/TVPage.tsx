import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTVDetails, getTVWatchProviders, getPosterUrl, IMAGE_BASE_URL, COUNTRY } from '../api/tmdb';
import { ProviderBadge } from '../components/ProviderBadge';
import { SeasonAccordion } from '../components/SeasonAccordion';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { DetailLayout, PlatformBubble } from './MoviePage';
import type { TVShowDetails, WatchProvidersCountry, WatchProvider } from '../types';

export function TVPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [providers, setProviders] = useState<WatchProvidersCountry | null>(null);
  const [noProviders, setNoProviders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tvId = parseInt(id ?? '', 10);
    if (isNaN(tvId)) { setError('ID invalide.'); setLoading(false); return; }
    setLoading(true); setError(null); setShow(null); setProviders(null); setNoProviders(false);

    Promise.all([getTVDetails(tvId), getTVWatchProviders(tvId)])
      .then(([s, p]) => {
        setShow(s);
        const c = p.results[COUNTRY];
        if (c) setProviders(c); else setNoProviders(true);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Impossible de charger la série.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="detail-page"><Loader message="Chargement…" /></div>;
  if (error) return <div className="detail-page"><ErrorMessage message={error} onRetry={() => navigate(0)} /></div>;
  if (!show) return null;

  const year = show.first_air_date ? show.first_air_date.slice(0, 4) : null;
  const poster = getPosterUrl(show.poster_path, 'w500');
  const backdrop = show.backdrop_path ? `${IMAGE_BASE_URL}/w1280${show.backdrop_path}` : null;
  const runtime = show.episode_run_time?.[0] ? `~${show.episode_run_time[0]} min/ép.` : null;

  const flatrate = providers?.flatrate ?? [];
  const rent = providers?.rent ?? [];
  const buy = providers?.buy ?? [];
  const free = providers?.free ?? [];
  const ads = providers?.ads ?? [];

  const primaryProvider: WatchProvider | null = flatrate[0] ?? free[0] ?? ads[0] ?? null;
  const hasAnyProvider = flatrate.length + rent.length + buy.length + free.length + ads.length > 0;

  return (
    <DetailLayout backdrop={backdrop} onBack={() => navigate(-1)}>
      {/* Poster + bubble */}
      <div className="detail-poster-wrap">
        {poster
          ? <img src={poster} alt={show.name} className="detail-poster" />
          : <div className="detail-poster detail-poster--empty"><span>📺</span></div>
        }
        {primaryProvider && (
          <PlatformBubble provider={primaryProvider} link={providers?.link} />
        )}
      </div>

      {/* Title & meta */}
      <div className="detail-hero-info">
        <div className="detail-type-badge">Série TV</div>
        <h1 className="detail-title">{show.name}</h1>
        {show.original_name !== show.name && (
          <p className="detail-original-title">{show.original_name}</p>
        )}
        <div className="detail-meta-row">
          {year && <span className="detail-pill">{year}</span>}
          {show.number_of_seasons > 0 && (
            <span className="detail-pill">
              {show.number_of_seasons} saison{show.number_of_seasons > 1 ? 's' : ''}
            </span>
          )}
          {show.number_of_episodes > 0 && (
            <span className="detail-pill">{show.number_of_episodes} épisodes</span>
          )}
          {runtime && <span className="detail-pill">{runtime}</span>}
          {show.vote_average > 0 && <span className="detail-pill detail-pill--gold">★ {show.vote_average.toFixed(1)}</span>}
        </div>
        {show.genres.length > 0 && (
          <div className="detail-genres">
            {show.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}
          </div>
        )}
        {show.tagline && <p className="detail-tagline">"{show.tagline}"</p>}
        {show.overview && <p className="detail-overview">{show.overview}</p>}
        {show.created_by?.length > 0 && (
          <p className="detail-created-by">
            Créé par <strong>{show.created_by.map(c => c.name).join(', ')}</strong>
          </p>
        )}
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
              </div>
            )}

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

      {/* Seasons */}
      {show.seasons && show.seasons.length > 0 && (
        <div className="detail-seasons">
          <h2 className="detail-section-title">
            Saisons &amp; Épisodes
            <span className="seasons-section__count">
              {show.number_of_seasons} saison{show.number_of_seasons > 1 ? 's' : ''} · {show.number_of_episodes} épisodes
            </span>
          </h2>
          <SeasonAccordion tvId={show.id} seasons={show.seasons} />
        </div>
      )}
    </DetailLayout>
  );
}
