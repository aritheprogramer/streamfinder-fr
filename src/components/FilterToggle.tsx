import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function FilterToggle() {
  const { user, filterActive, setFilterActive, userProviders, isConfigured } = useAuth();
  const navigate = useNavigate();

  if (!isConfigured) return null;

  if (!user) {
    return (
      <div className="filter-toggle filter-toggle--locked">
        <span className="filter-toggle__icon">🔒</span>
        <span className="filter-toggle__label">
          <button className="link-btn" onClick={() => navigate('/login')}>Connectez-vous</button>
          {' '}pour filtrer par vos plateformes
        </span>
      </div>
    );
  }

  if (userProviders.length === 0) {
    return (
      <div className="filter-toggle filter-toggle--locked">
        <span className="filter-toggle__icon">📺</span>
        <span className="filter-toggle__label">
          <button className="link-btn" onClick={() => navigate('/profile')}>Configurez vos plateformes</button>
          {' '}pour activer ce filtre
        </span>
      </div>
    );
  }

  return (
    <label className={`filter-toggle ${filterActive ? 'filter-toggle--active' : ''}`}>
      <div
        className={`toggle-switch ${filterActive ? 'toggle-switch--on' : ''}`}
        onClick={() => setFilterActive(!filterActive)}
        role="switch"
        aria-checked={filterActive}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setFilterActive(!filterActive)}
      >
        <div className="toggle-switch__knob" />
      </div>
      <span className="filter-toggle__label">
        {filterActive ? (
          <>Mes plateformes seulement <span className="filter-toggle__count">({userProviders.length})</span></>
        ) : (
          'Filtrer par mes plateformes'
        )}
      </span>
    </label>
  );
}
