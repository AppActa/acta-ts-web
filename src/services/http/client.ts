import { auth } from "../../lib/firebase";

export type HttpClientOptions = RequestInit;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly mensagens: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function httpClient<T>(
  input: RequestInfo | URL,
  options: HttpClientOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const requestOptions = options;
  const user = auth.currentUser;

  if (!user || !user.emailVerified || !user.email) {
    throw new ApiError("Entre com uma conta cujo e-mail foi confirmado para continuar.", 401);
  }

  let tokenResult = await user.getIdTokenResult();
  if (user.emailVerified && tokenResult.claims.email_verified !== true) {
    tokenResult = await user.getIdTokenResult(true);
  }
  if (tokenResult?.claims.email_verified !== true) {
    throw new ApiError("Não foi possível confirmar seu e-mail. Atualize a confirmação e tente novamente.", 401);
  }
  const url = String(input);
  const metodo = options.method ?? "GET";

  if (
    typeof requestOptions.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    headers.set("Authorization", `Bearer ${tokenResult.token}`);
    response = await fetch(input, { ...requestOptions, headers });
    if (response.status === 401) {
      tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.email_verified === true) {
        headers.set("Authorization", `Bearer ${tokenResult.token}`);
        response = await fetch(input, { ...requestOptions, headers });
      }
    }
  } catch (cause) {
    throw cause;
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const mensagens = body && typeof body === "object" && "mensagens" in body &&
      Array.isArray(body.mensagens) ? body.mensagens.filter((item): item is string => typeof item === "string") : [];
    const mensagensSeguras = response.status === 400 || response.status === 409 || response.status === 422
      ? mensagens.map((mensagem) => mensagem.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "e-mail informado").replace(/\b\d{11,14}\b/g, "documento informado"))
      : mensagens;
    throw new ApiError(mensagensSeguras.join(" ") || "Não foi possível concluir sua solicitação. Tente novamente.", response.status, mensagensSeguras);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
