import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion.';
      setError(msg.includes('Invalid') ? 'Email ou mot de passe incorrect.' : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Comptes non configurés</h1>
          <p className="auth-card__sub">Supabase n'est pas configuré. Consultez le README pour la procédure d'installation.</p>
          <Link to="/" className="btn btn--primary" style={{ display: 'inline-flex', marginTop: 16 }}>Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
            <rect width="48" height="48" rx="12" fill="#e50914" />
            <polygon points="18,12 38,24 18,36" fill="white" />
          </svg>
        </div>
        <h1 className="auth-card__title">Se connecter</h1>
        <p className="auth-card__sub">Accédez à vos plateformes et filtres personnalisés</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-card__switch">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="link-btn">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
