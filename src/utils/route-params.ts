export function lerIdRotaPositivo(valor: string | undefined): number | null {
  if (!valor || !/^\d+$/.test(valor)) return null;
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function lerIdRotaTexto(valor: string | undefined): string | null {
  return valor && /^[A-Za-z0-9_-]{1,128}$/.test(valor) ? valor : null;
}
