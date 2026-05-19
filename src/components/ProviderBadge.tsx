import { getLogoUrl } from '../api/tmdb';
import type { WatchProvider } from '../types';

interface Props {
  provider: WatchProvider;
  link?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProviderBadge({ provider, link, size = 'md' }: Props) {
  const logo = getLogoUrl(provider.logo_path, 'w92');

  const content = (
    <div className={`provider-badge provider-badge--${size}`}>
      {logo ? (
        <img src={logo} alt={provider.provider_name} className="provider-badge__logo" />
      ) : (
        <div className="provider-badge__fallback">
          {provider.provider_name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="provider-badge__name">{provider.provider_name}</span>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="provider-badge__link">
        {content}
      </a>
    );
  }

  return content;
}
