import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function UserMenu() {
  const { user, signOut, isConfigured } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isConfigured) return null;

  if (!user) {
    return (
      <div className="header-auth">
        <button className="btn btn--ghost btn--sm" onClick={() => navigate('/login')}>Se connecter</button>
        <button className="btn btn--primary btn--sm" onClick={() => navigate('/signup')}>S'inscrire</button>
      </div>
    );
  }

  const initials = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu__trigger" onClick={() => setOpen(o => !o)}>
        <div className="user-avatar">{initials}</div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="user-menu__dropdown">
          <div className="user-menu__email">{user.email}</div>
          <div className="user-menu__divider" />
          <button className="user-menu__item" onClick={() => { navigate('/profile'); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            Mes plateformes
          </button>
          <div className="user-menu__divider" />
          <button className="user-menu__item user-menu__item--danger" onClick={() => { signOut(); setOpen(false); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
