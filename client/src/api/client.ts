const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/** Thrown when the network request itself fails (server not running, no internet, CORS, etc.) —
 *  distinct from a real API error response, so callers can fall back to local/offline mode. */
export class ApiUnreachableError extends Error {
  constructor() {
    super("Could not reach the LearnPath API");
    this.name = "ApiUnreachableError";
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown; accessToken?: string | null };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, accessToken, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: "include", // send/receive the refresh-token cookie
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiUnreachableError();
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}
