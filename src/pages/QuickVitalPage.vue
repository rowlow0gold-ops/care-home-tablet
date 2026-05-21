<template>
  <q-page padding>
    <q-btn flat icon="arrow_back" label="어르신" @click="$router.back()" class="q-mb-md" />

    <q-card flat bordered class="q-pa-md">
      <div class="text-h5 q-mb-md">활력징후 측정</div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <q-input v-model.number="hr" type="number" label="심박수 (BPM)" outlined input-class="text-h4" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model.number="spo2" type="number" label="SpO₂ (%)" outlined input-class="text-h4" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model.number="bpSys" type="number" label="수축기 혈압" outlined input-class="text-h4" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model.number="bpDia" type="number" label="이완기 혈압" outlined input-class="text-h4" />
        </div>
        <div class="col-12">
          <q-input v-model.number="tempC" type="number" step="0.1" label="체온 (°C)" outlined input-class="text-h4" />
        </div>
        <div class="col-12">
          <q-input v-model="note" type="textarea" label="메모 (선택)" outlined autogrow />
        </div>
      </div>

      <q-banner v-if="error" class="bg-negative text-white q-mt-md">{{ error }}</q-banner>

      <div class="q-mt-md row justify-end">
        <q-btn
          unelevated
          color="primary"
          icon="save"
          label="저장"
          size="lg"
          :loading="saving"
          @click="save"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "../lib/api";
import { useSessionStore } from "../stores/session";

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const session = useSessionStore();
const $q = useQuasar();

const hr = ref<number | null>(null);
const spo2 = ref<number | null>(null);
const bpSys = ref<number | null>(null);
const bpDia = ref<number | null>(null);
const tempC = ref<number | null>(null);
const note = ref("");
const saving = ref(false);
const error = ref<string | null>(null);

async function postOne(kind: string, value: number | null) {
  if (value === null || Number.isNaN(value)) return;
  await api.postVital(session.token!, {
    resident_id: id,
    kind,
    value,
    note: note.value || null,
  });
}

async function save() {
  if (saving.value) return;
  saving.value = true;
  error.value = null;
  try {
    await Promise.all([
      postOne("heart_rate", hr.value),
      postOne("spo2", spo2.value),
      postOne("blood_pressure_systolic", bpSys.value),
      postOne("blood_pressure_diastolic", bpDia.value),
      postOne("temperature_celsius", tempC.value),
    ]);
    $q.notify({ type: "positive", message: "저장되었습니다" });
    router.push(`/residents/${id}`);
  } catch (err: any) {
    error.value = err?.message ?? "저장 실패";
  } finally {
    saving.value = false;
  }
}
</script>
