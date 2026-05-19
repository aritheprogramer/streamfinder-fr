import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../api/tmdb';
import type { MultiSearchItem } from '../types';

interface Props {
  item: MultiSearchItem;
  availableForUser?: boolean | null; // null = not yet checked
}

export function MediaCard({ item, availableForUser = null }: Props) {
  const navigate = useNavigate();
  const isTV = item.media_type === 'tv';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const overview = item.overview
    ? item.overview.length > 110 ? item.overview.slice(0, 110) + '…' : item.overview
    : null;
  const poster = getPosterUrl(item.poster_path, 'w342');
  const path = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <div className="movie-card" onClick={() => navigate(path)}>
      <div className="movie-card__poster-wrap">
        {poster ? (
          <img src={poster} alt={title} className="movie-card__poster" loading="lazy" />
        ) : (
          <div className="movie-card__no-poster">
            <span style={{ fontSize: 32 }}>{isTV ? '📺' : '🎬'}</span>
            <span>Pas d'affiche</span>
          </div>
        )}
        <div className="movie-card__overlay" />
        <span className={`media-type-badge ${isTV ? 'media-type-badge--tv' : 'media-type-badge--movie'}`}>
          {isTV ? 'Série' : 'Film'}
        </span>
        {availableForUser === true && (
          <span className="available-badge">✓ Mes plateformes</span>
        )}
      </div>
      <div className="movie-card__body">
        {year && <div className="movie-card__year">{year}</div>}
        <h3 className="movie-card__title">{title}</h3>
        {overview && <p className="movie-card__overview">{overview}</p>}
      </div>
      <div className="movie-card__footer">
        <button
          className="btn btn--primary btn--sm"
          onClick={e => { e.stopPropagation(); navigate(path); }}
        >
          Voir la disponibilité
        </button>
      </div>
    </div>
  );
}
