import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    setError(null);
    try {
      await signUp(email, password);
      navigate('/profile?welcome=1');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du compte.';
      setError(msg.includes('already') ? 'Un compte existe déjà avec cet email.' : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Comptes non configurés</h1>
          <p className="auth-card__sub">Supabase n'est pas configuré. Consultez le README.</p>
          <Link to="/" className="btn btn--primary" style={{ display: 'inline-flex', marginTop: 16 }}>Retour</Link>
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
        <h1 className="auth-card__title">Créer un compte</h1>
        <p className="auth-card__sub">Enregistrez vos plateformes et filtrez les résultats</p>

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
              placeholder="6 caractères minimum"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer le mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn--primary auth-submit" disabled={loading}>
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-card__switch">
          Déjà un compte ?{' '}
          <Link to="/login" className="link-btn">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
