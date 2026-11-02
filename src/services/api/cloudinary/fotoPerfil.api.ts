import { env } from "../../../config/env";

const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export class FotoPerfilUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FotoPerfilUploadError";
  }
}

export async function enviarFotoPerfilCloudinary(arquivo: File): Promise<string> {
  const cloudName = env.cloudinaryCloudName.trim();
  const uploadPreset = env.cloudinaryUploadPreset.trim();
  if (!cloudName) throw new FotoPerfilUploadError("Informe VITE_CLOUDINARY_CLOUD_NAME no .env.local e reinicie o servidor.");
  if (!uploadPreset) throw new FotoPerfilUploadError("Informe um preset unsigned em VITE_CLOUDINARY_UPLOAD_PRESET no .env.local e reinicie o servidor.");
  if (!/^[\w-]+$/.test(cloudName)) throw new FotoPerfilUploadError("VITE_CLOUDINARY_CLOUD_NAME tem formato inválido.");
  if (!arquivo.type.startsWith("image/")) throw new FotoPerfilUploadError("Selecione um arquivo de imagem.");
  if (arquivo.size > TAMANHO_MAXIMO) throw new FotoPerfilUploadError("A imagem deve ter no máximo 10 MB.");

  const dados = new FormData();
  dados.set("file", arquivo);
  dados.set("upload_preset", uploadPreset);
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

  const resultado: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const mensagemApi = typeof resultado === "object" && resultado !== null && "error" in resultado
      && typeof resultado.error === "object" && resultado.error !== null
      && "message" in resultado.error && typeof resultado.error.message === "string"
      ? resultado.error.message
      : "O Cloudinary recusou o envio.";
    throw new FotoPerfilUploadError(`${mensagemApi} Confira se o preset permite uploads unsigned.`);
  }
  if (typeof resultado !== "object" || resultado === null || !("secure_url" in resultado)
    || typeof resultado.secure_url !== "string" || !resultado.secure_url.startsWith("https://")) {
    throw new FotoPerfilUploadError("O Cloudinary retornou um endereço de imagem inválido.");
  }
  return resultado.secure_url;
}
