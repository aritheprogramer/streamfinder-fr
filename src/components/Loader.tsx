interface Props {
  message?: string;
}

export function Loader({ message = 'Chargement…' }: Props) {
  return (
    <div className="loader">
      <div className="loader__spinner" />
      <p className="loader__message">{message}</p>
    </div>
  );
}
