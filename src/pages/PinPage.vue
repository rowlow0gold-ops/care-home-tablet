<template>
  <q-page class="row items-center justify-center bg-grey-1">
    <q-card class="q-pa-lg" style="width: 420px; max-width: 95vw">
      <div class="text-h5 text-primary q-mb-xs">
        {{ device.pair?.branchName ?? "" }}
      </div>
      <div class="text-subtitle2 text-grey-7 q-mb-lg">
        본인의 이메일과 4자리 PIN을 입력하세요.
      </div>

      <q-input
        v-model="email"
        label="이메일"
        type="email"
        autocomplete="username"
        class="q-mb-md"
      />

      <div class="text-h3 text-center q-py-md tracking-widest">
        {{ pinDisplay }}
      </div>

      <div class="row q-col-gutter-sm">
        <div v-for="n in keys" :key="n" class="col-4">
          <q-btn
            v-if="n !== 'del' && n !== 'go'"
            :label="n"
            outline
            class="pin-key full-width"
            color="grey-9"
            @click="press(String(n))"
          />
          <q-btn
            v-else-if="n === 'del'"
            icon="backspace"
            outline
            class="pin-key full-width"
            color="grey-7"
            @click="del"
          />
          <q-btn
            v-else
            icon="arrow_forward"
            color="primary"
            unelevated
            class="pin-key full-width"
            :loading="loading"
            :disable="pin.length < 4"
            @click="submit"
          />
        </div>
      </div>

      <q-banner v-if="error" class="bg-negative text-white q-mt-md">
        {{ error }}
      </q-banner>

      <div class="q-mt-md">
        <q-btn flat dense size="sm" color="grey-7" label="기기 페어링 해제" @click="unpair" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "../lib/api";
import { useDeviceStore } from "../stores/device";
import { useSessionStore } from "../stores/session";

const email = ref("");
const pin = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();
const device = useDeviceStore();
const session = useSessionStore();
const $q = useQuasar();

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "go"];

const pinDisplay = computed(() => {
  // bullets for filled, dots for empty
  return [..."•".repeat(pin.value.length), ..."○".repeat(Math.max(0, 4 - pin.value.length))].join(" ");
});

function press(n: string) {
  if (pin.value.length >= 8) return;
  pin.value += n;
}
function del() {
  pin.value = pin.value.slice(0, -1);
}

async function submit() {
  if (loading.value || pin.value.length < 4) return;
  if (!device.pair) {
    router.replace("/pair");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const res = await api.pinLogin(device.pair.deviceToken, email.value, pin.value);
    session.set(res.access_token, res.expires_in, {
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      role: res.user.role,
      tenantId: res.user.tenant_id,
      branchId: res.user.branch_id,
    });
    $q.notify({ type: "positive", message: `${res.user.name}님 환영합니다` });
    router.replace("/");
  } catch (err: any) {
    pin.value = "";
    error.value =
      err?.status === 401
        ? "이메일이나 PIN이 올바르지 않습니다."
        : err?.message ?? "로그인 실패";
  } finally {
    loading.value = false;
  }
}

async function unpair() {
  $q.dialog({
    title: "페어링 해제",
    message: "이 태블릿을 페어링 해제하시겠습니까? 시설장이 새 코드를 발급해야 다시 사용할 수 있습니다.",
    cancel: true,
    ok: { label: "해제", color: "negative" },
  }).onOk(async () => {
    await device.clear();
    session.clear();
    router.replace("/pair");
  });
}
</script>
