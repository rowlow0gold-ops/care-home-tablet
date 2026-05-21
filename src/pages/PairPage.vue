<template>
  <q-page class="row items-center justify-center bg-grey-1">
    <q-card class="q-pa-lg" style="width: 480px; max-width: 95vw">
      <div class="text-h5 text-primary q-mb-xs">케어닥 태블릿</div>
      <div class="text-subtitle2 text-grey-7 q-mb-lg">
        시설장이 발급한 8자리 페어링 코드를 입력하세요.
      </div>

      <q-form @submit="onPair" class="q-gutter-md">
        <q-input
          v-model="code"
          label="페어링 코드"
          mask="AAAAAAAA"
          autogrow
          input-class="text-h4 text-center tracking-widest"
          maxlength="8"
          :rules="[(v) => v.length === 8 || '8자 입력']"
          autofocus
        />

        <q-input
          v-model="label"
          label="이 태블릿 이름"
          hint="예: 강남센터 1층 스테이션"
          :rules="[(v) => !!v || '이름을 입력하세요']"
        />

        <q-btn
          type="submit"
          color="primary"
          label="페어링"
          class="full-width"
          size="lg"
          :loading="loading"
        />
      </q-form>

      <q-banner v-if="error" class="bg-negative text-white q-mt-md">
        {{ error }}
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "../lib/api";
import { useDeviceStore } from "../stores/device";

const code = ref("");
const label = ref("");
const loading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();
const device = useDeviceStore();
const $q = useQuasar();

async function onPair() {
  if (loading.value) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await api.claim(code.value.toUpperCase(), label.value);
    await device.save({
      deviceToken: res.device_token,
      deviceId: res.device_id,
      branchId: res.branch_id,
      branchName: res.branch_name,
    });
    $q.notify({ type: "positive", message: `${res.branch_name} 페어링 완료` });
    router.replace("/pin");
  } catch (err: any) {
    error.value =
      (err?.body as any)?.message ??
      err?.message ??
      "코드가 올바르지 않거나 만료되었습니다.";
  } finally {
    loading.value = false;
  }
}
</script>
