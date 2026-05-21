/**
 * Tiny API client. Reads the API base from a build-time env var.
 * Auth: pass token explicitly (we keep two layers — device token + caregiver JWT).
 */
const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  "https://care.minhojan-world.site";

export interface ApiError extends Error {
  status: number;
  body?: unknown;
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = new Error(`API ${res.status} ${res.statusText}`) as ApiError;
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      // non-JSON body, ignore
    }
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // === pairing flow (no auth) ===
  claim(code: string, label: string) {
    return request<{
      device_token: string;
      device_id: string;
      branch_id: string;
      branch_name: string;
    }>("/api/v1/devices/claim", {
      method: "POST",
      body: JSON.stringify({ code, label }),
    });
  },

  // === pin login (no auth — device_token + PIN IS the credential) ===
  pinLogin(deviceToken: string, email: string, pin: string) {
    return request<{
      access_token: string;
      expires_in: number;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        tenant_id: string;
        branch_id: string;
      };
    }>("/api/v1/auth/pin", {
      method: "POST",
      body: JSON.stringify({ device_token: deviceToken, email, pin }),
    });
  },

  // === authed (caregiver JWT) ===
  residents(token: string) {
    return request<
      Array<{
        id: string;
        full_name: string;
        sex: string;
        birth_date: string;
        care_grade: string | null;
        room_number: string | null;
        status: string;
      }>
    >("/api/v1/residents", { token });
  },
  resident(token: string, id: string) {
    return request<{
      id: string;
      full_name: string;
      sex: string;
      birth_date: string;
      care_grade: string | null;
      room_number: string | null;
      admitted_on: string;
      status: string;
    }>(`/api/v1/residents/${id}`, { token });
  },
  postVital(
    token: string,
    payload: { resident_id: string; kind: string; value: number; note?: string | null },
  ) {
    return request("/api/v1/vitals", {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  postCareLog(
    token: string,
    payload: { resident_id: string; category: string; body: string; flagged?: boolean },
  ) {
    return request("/api/v1/care-logs", {
      token,
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
