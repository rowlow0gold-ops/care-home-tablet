/**
 * Device-level state. Pinia store backed by Tauri's @tauri-apps/plugin-store,
 * which persists encrypted-at-rest on iOS/Android keychain when possible.
 *
 * The `deviceToken` is the long-lived credential a branch manager hands to
 * this tablet during pairing. It DOES NOT expire — it's revocable from HQ.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { Store } from "@tauri-apps/plugin-store";

interface PairInfo {
  deviceToken: string;
  deviceId: string;
  branchId: string;
  branchName: string;
}

let backing: Store | null = null;
async function backingStore() {
  if (!backing) backing = await Store.load("device.dat");
  return backing;
}

export const useDeviceStore = defineStore("device", () => {
  const pair = ref<PairInfo | null>(null);
  const hydrated = ref(false);
  const paired = computed(() => pair.value !== null);

  async function hydrate() {
    try {
      const s = await backingStore();
      const v = (await s.get<PairInfo>("pair")) ?? null;
      pair.value = v;
    } catch {
      pair.value = null;
    } finally {
      hydrated.value = true;
    }
  }

  async function save(info: PairInfo) {
    pair.value = info;
    const s = await backingStore();
    await s.set("pair", info);
    await s.save();
  }

  async function clear() {
    pair.value = null;
    const s = await backingStore();
    await s.delete("pair");
    await s.save();
  }

  return { pair, hydrated, paired, hydrate, save, clear };
});
