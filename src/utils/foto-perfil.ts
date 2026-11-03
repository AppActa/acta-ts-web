export function validarUrlFotoPerfil(valor: string | null | undefined): string | null {
  if (!valor?.trim()) return null;
  try {
    const url = new URL(valor.trim());
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
