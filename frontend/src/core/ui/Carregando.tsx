export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="carregando" role="status">
      <span className="carregando__roda" aria-hidden="true" />
      {texto}
    </div>
  );
}
