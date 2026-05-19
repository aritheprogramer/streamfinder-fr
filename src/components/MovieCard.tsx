import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../api/tmdb';
import type { Movie } from '../types';

interface Props {
  movie: Movie;
}

export function MovieCard({ movie }: Props) {
  const navigate = useNavigate();
  const poster = getPosterUrl(movie.poster_path, 'w342');
  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const overview = movie.overview
    ? movie.overview.length > 120
      ? movie.overview.slice(0, 120) + '…'
      : movie.overview
    : null;

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card__poster-wrap">
        {poster ? (
          <img src={poster} alt={movie.title} className="movie-card__poster" loading="lazy" />
        ) : (
          <div className="movie-card__no-poster">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Pas d'affiche</span>
          </div>
        )}
        <div className="movie-card__overlay" />
      </div>
      <div className="movie-card__body">
        <div className="movie-card__year">{year}</div>
        <h3 className="movie-card__title">{movie.title}</h3>
        {overview && <p className="movie-card__overview">{overview}</p>}
      </div>
      <div className="movie-card__footer">
        <button
          className="btn btn--primary btn--sm"
          onClick={e => {
            e.stopPropagation();
            navigate(`/movie/${movie.id}`);
          }}
        >
          Voir la disponibilité
        </button>
      </div>
    </div>
  );
}
