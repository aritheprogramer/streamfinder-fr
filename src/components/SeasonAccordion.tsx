import { useState } from 'react';
import { getTVSeasonDetails, getPosterUrl, getStillUrl } from '../api/tmdb';
import type { Season, SeasonDetails } from '../types';

interface SeasonItemProps { tvId: number; season: Season; }

function SeasonItem({ tvId, season }: SeasonItemProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<SeasonDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const toggle = async () => {
    if (!open && !details) {
      setLoading(true); setError(false);
      try {
        setDetails(await getTVSeasonDetails(tvId, season.season_number));
      } catch { setError(true); }
      finally { setLoading(false); }
    }
    setOpen(o => !o);
  };

  const poster = getPosterUrl(season.poster_path, 'w185');

  return (
    <div className={`season-item ${open ? 'season-item--open' : ''}`}>
      <button className="season-header" onClick={toggle}>
        {poster
          ? <img src={poster} alt={season.name} className="season-header__poster" />
          : <div className="season-header__no-poster">S{season.season_number}</div>
        }
        <div className="season-header__info">
          <span className="season-header__name">{season.name}</span>
          <span className="season-header__meta">
            {season.episode_count} épisode{season.episode_count > 1 ? 's' : ''}
            {season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ''}
          </span>
        </div>
        <svg
          className={`season-header__chevron ${open ? 'season-header__chevron--open' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Grid-rows trick for smooth height animation */}
      <div className={`season-episodes-wrapper ${open ? 'season-episodes-wrapper--open' : ''}`}>
        <div className="season-episodes">
          {loading && <div className="season-loading"><div className="mini-spinner" /> Chargement…</div>}
          {error && <div className="season-error">Impossible de charger les épisodes.</div>}
          {details && details.episodes.map((ep, idx) => {
            const still = getStillUrl(ep.still_path);
            return (
              <div
                key={ep.id}
                className="episode-row"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="episode-row__num">
                  {ep.episode_number < 10 ? `0${ep.episode_number}` : ep.episode_number}
                </div>
                {still && (
                  <div className="episode-row__still">
                    <img src={still} alt={ep.name} loading="lazy" />
                  </div>
                )}
                <div className="episode-row__info">
                  <div className="episode-row__title">{ep.name}</div>
                  <div className="episode-row__meta">
                    {ep.air_date && <span>{new Date(ep.air_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                    {ep.runtime && <span>{ep.runtime} min</span>}
                    {ep.vote_average > 0 && <span>★ {ep.vote_average.toFixed(1)}</span>}
                  </div>
                  {ep.overview && <p className="episode-row__overview">{ep.overview}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SeasonAccordion({ tvId, seasons }: { tvId: number; seasons: Season[] }) {
  const mainSeasons = seasons.filter(s => s.season_number > 0);
  const specials    = seasons.filter(s => s.season_number === 0);
  return (
    <div className="season-accordion">
      {mainSeasons.map(s => <SeasonItem key={s.id} tvId={tvId} season={s} />)}
      {specials.length > 0 && mainSeasons.length > 0 && (
        <div className="season-specials-label">Spéciaux</div>
      )}
      {specials.map(s => <SeasonItem key={s.id} tvId={tvId} season={s} />)}
    </div>
  );
}
