interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="error-box">
      <svg className="error-box__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="error-box__message">{message}</p>
      {onRetry && (
        <button className="btn btn--outline btn--sm" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
