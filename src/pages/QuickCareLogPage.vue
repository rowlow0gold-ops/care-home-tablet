<template>
  <q-page padding>
    <q-btn flat icon="arrow_back" label="어르신" @click="$router.back()" class="q-mb-md" />

    <q-card flat bordered class="q-pa-md">
      <div class="text-h5 q-mb-md">케어 기록</div>

      <q-select
        v-model="category"
        :options="categories"
        label="구분"
        outlined
        class="q-mb-md"
      />

      <q-input
        v-model="body"
        type="textarea"
        label="내용"
        outlined
        autogrow
        rows="6"
        placeholder="예: 점심 식사량 80%, 식후 안색 양호, 30분 산책"
      />

      <q-toggle
        v-model="flagged"
        label="이상 징후 / 보고 필요 (지점장 텔레그램 즉시 전송)"
        color="negative"
        class="q-mt-md"
      />

      <q-banner v-if="error" class="bg-negative text-white q-mt-md">{{ error }}</q-banner>

      <div class="q-mt-md row justify-end">
        <q-btn
          unelevated
          color="primary"
          icon="save"
          label="저장"
          size="lg"
          :loading="saving"
          :disable="!body"
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

const categories = ["식사", "투약", "배설", "위생", "활동", "이상징후", "기타"];
const category = ref(categories[0]);
const body = ref("");
const flagged = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

async function save() {
  if (saving.value || !body.value) return;
  saving.value = true;
  error.value = null;
  try {
    await api.postCareLog(session.token!, {
      resident_id: id,
      category: category.value,
      body: body.value,
      flagged: flagged.value,
    });
    $q.notify({ type: "positive", message: "저장되었습니다" });
    router.push(`/residents/${id}`);
  } catch (err: any) {
    error.value = err?.message ?? "저장 실패";
  } finally {
    saving.value = false;
  }
}
</script>
