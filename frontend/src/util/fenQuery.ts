let fenForThisLoad: string | undefined | null = null;

function stripFenFromUrl(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('fen')) {
    return;
  }
  params.delete('fen');
  const search = params.toString();
  const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}

export function consumeFenParam(): string | undefined {
  if (fenForThisLoad !== null) {
    return fenForThisLoad;
  }
  const params = new URLSearchParams(window.location.search);
  const fen = params.get('fen') || undefined;
  stripFenFromUrl();
  fenForThisLoad = fen;
  return fen;
}

export function stripFenParam(): void {
  stripFenFromUrl();
  fenForThisLoad = undefined;
}
