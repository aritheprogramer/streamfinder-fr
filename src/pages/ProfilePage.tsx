import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllMovieProvidersFR, getAllTVProvidersFR, getLogoUrl } from '../api/tmdb';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import type { WatchProvider, UserProvider } from '../types';

export function ProfilePage() {
  const { user, userProviders, saveProviders, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';

  const [allProviders, setAllProviders] = useState<WatchProvider[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    // Load all available providers in France
    Promise.all([getAllMovieProvidersFR(), getAllTVProvidersFR()])
      .then(([movies, tv]) => {
        const merged = new Map<number, WatchProvider>();
        [...movies.results, ...tv.results].forEach(p => {
          if (!merged.has(p.provider_id)) merged.set(p.provider_id, p);
        });
        const sorted = Array.from(merged.values()).sort((a, b) => a.display_priority - b.display_priority);
        setAllProviders(sorted);
      })
      .catch(() => setError('Impossible de charger la liste des plateformes.'))
      .finally(() => setLoadingProviders(false));
  }, [user, navigate]);

  // Pre-select saved providers
  useEffect(() => {
    setSelected(new Set(userProviders.map(p => p.provider_id)));
  }, [userProviders]);

  const toggle = (provider: WatchProvider) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(provider.provider_id)) next.delete(provider.provider_id);
      else next.add(provider.provider_id);
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const toSave: UserProvider[] = allProviders
        .filter(p => selected.has(p.provider_id))
        .map(p => ({ provider_id: p.provider_id, provider_name: p.provider_name, logo_path: p.logo_path }));
      await saveProviders(toSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="search-page">
        <div className="error-box">
          <p>Supabase n'est pas configuré. Consultez le README pour la procédure d'installation.</p>
        </div>
      </div>
    );
  }

  if (loadingProviders) return <div className="search-page"><Loader message="Chargement des plateformes…" /></div>;

  const filtered = searchFilter.trim()
    ? allProviders.filter(p => p.provider_name.toLowerCase().includes(searchFilter.toLowerCase()))
    : allProviders;

  return (
    <div className="search-page">
      <div className="profile-page">
        <div className="profile-page__header">
          <button className="btn btn--ghost btn--sm" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour
          </button>

          <div className="profile-page__title-block">
            {isWelcome && (
              <div className="profile-welcome">
                🎉 Bienvenue ! Sélectionnez vos plateformes pour activer le filtre personnalisé.
              </div>
            )}
            <h1 className="profile-page__title">Mes plateformes</h1>
            <p className="profile-page__sub">
              Sélectionnez les services auxquels vous êtes abonné(e) en France.
              <br />
              <strong>{selected.size}</strong> plateforme{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}.
            </p>
          </div>

          <div className="profile-page__actions">
            {error && <p className="profile-error">{error}</p>}
            <button
              className={`btn ${saved ? 'btn--outline' : 'btn--primary'}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="profile-search">
          <input
            type="text"
            className="form-input"
            placeholder="Filtrer les plateformes…"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
          />
        </div>

        <div className="providers-grid">
          {filtered.map(p => {
            const logo = getLogoUrl(p.logo_path, 'w92');
            const isSelected = selected.has(p.provider_id);
            return (
              <button
                key={p.provider_id}
                className={`provider-toggle ${isSelected ? 'provider-toggle--selected' : ''}`}
                onClick={() => toggle(p)}
              >
                {logo
                  ? <img src={logo} alt={p.provider_name} className="provider-toggle__logo" />
                  : <div className="provider-toggle__fallback">{p.provider_name.slice(0, 2).toUpperCase()}</div>
                }
                <span className="provider-toggle__name">{p.provider_name}</span>
                {isSelected && <span className="provider-toggle__check">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="profile-page__save-bottom">
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : `Enregistrer (${selected.size} plateforme${selected.size > 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  );
}
