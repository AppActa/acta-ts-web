import { env } from "../../../config/env";

const PRESET_FOTO_PERFIL = "novoteste";
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export class FotoPerfilUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FotoPerfilUploadError";
  }
}

export async function enviarFotoPerfilCloudinary(arquivo: File): Promise<string> {
  const cloudName = env.cloudinaryCloudName.trim();
  if (!cloudName) throw new FotoPerfilUploadError("Cloudinary não está configurado para este site.");
  if (!arquivo.type.startsWith("image/")) throw new FotoPerfilUploadError("Selecione um arquivo de imagem.");
  if (arquivo.size > TAMANHO_MAXIMO) throw new FotoPerfilUploadError("A imagem deve ter no máximo 10 MB.");

  const dados = new FormData();
  dados.set("file", arquivo);
  dados.set("upload_preset", PRESET_FOTO_PERFIL);
  dados.set("folder", "fotos");

  let resposta: Response;
  try {
    resposta = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST",
      body: dados,
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new FotoPerfilUploadError("Não foi possível enviar a imagem. Verifique sua conexão e tente novamente.");
  }

  if (!resposta.ok) throw new FotoPerfilUploadError("O Cloudinary não aceitou a imagem. Tente outra foto.");
  const resultado: unknown = await resposta.json().catch(() => null);
  if (typeof resultado !== "object" || resultado === null || !("secure_url" in resultado)
    || typeof resultado.secure_url !== "string" || !resultado.secure_url.startsWith("https://")) {
    throw new FotoPerfilUploadError("O Cloudinary retornou um endereço de imagem inválido.");
  }
  return resultado.secure_url;
}
