import { useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <button className="header__logo" onClick={() => navigate('/')} aria-label="Accueil">
        <svg className="header__logo-icon" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#e50914" />
          <polygon points="12,8 26,16 12,24" fill="white" />
        </svg>
        <span className="header__logo-text">StreamFinder</span>
        <span className="header__logo-badge">FR</span>
      </button>
      <div className="header__right">
        <UserMenu />
      </div>
    </header>
  );
}
