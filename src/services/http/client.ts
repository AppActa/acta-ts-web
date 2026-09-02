export type HttpClientOptions = RequestInit & {
  token?: string;
};

export async function httpClient<T>(
  input: RequestInfo | URL,
  options: HttpClientOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  headers.set("Content-Type", "application/json");

  const response = await fetch(input, { ...options, headers });

  if (!response.ok) {
    throw new Error(`Falha na requisição: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
