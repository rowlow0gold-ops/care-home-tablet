/**
 * Per-shift caregiver session. The JWT is intentionally NOT persisted to disk
 * — when the app closes, the next person has to enter their PIN. (Matches
 * Home Instead / Tsukui behaviour.)
 *
 * For "switch user without restart" we simply call `clear()` and route to /pin.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  branchId: string;
}

export const useSessionStore = defineStore("session", () => {
  const token = ref<string | null>(null);
  const expiresAt = ref<number | null>(null); // unix seconds
  const user = ref<SessionUser | null>(null);

  const expired = computed(() => {
    if (!expiresAt.value) return true;
    return Date.now() / 1000 >= expiresAt.value;
  });

  function set(t: string, ttlSeconds: number, u: SessionUser) {
    token.value = t;
    expiresAt.value = Math.floor(Date.now() / 1000) + ttlSeconds - 60; // 1min slop
    user.value = u;
  }

  function clear() {
    token.value = null;
    expiresAt.value = null;
    user.value = null;
  }

  return { token, expiresAt, user, expired, set, clear };
});
