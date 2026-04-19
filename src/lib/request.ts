const TOKEN_KEY = "rpl_token";

type RequestOptions = {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  headers?: Record<string, string>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request<T = any>({ url, method, body, headers = {} }: RequestOptions): Promise<T> {
  const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const token = stored ? JSON.parse(stored) : null;

  const reqHeaders: Record<string, string> = { ...headers };

  if (token?.accessToken) {
    reqHeaders["Authorization"] = `${token.tokenType} ${token.accessToken}`;
  }

  if (body !== undefined && !reqHeaders["Content-Type"]) {
    reqHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { method, headers: reqHeaders, body });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem("sessionExpired", "true");
      window.location.href = "/login";
    }
    throw { status: 401, err: { detail: "Unauthorized" } };
  }

  let data: unknown;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw { status: res.status, err: data };
  }

  return data as T;
}
