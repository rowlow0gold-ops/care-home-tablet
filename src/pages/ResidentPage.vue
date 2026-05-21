<template>
  <q-page padding>
    <q-btn flat icon="arrow_back" label="목록" @click="$router.push('/')" class="q-mb-md" />

    <q-card v-if="resident" flat bordered>
      <q-card-section>
        <div class="text-h4">{{ resident.full_name }}</div>
        <div class="text-subtitle1 text-grey-7">
          <template v-if="resident.room_number">{{ resident.room_number }}호 · </template>
          {{ resident.sex === "male" ? "남" : resident.sex === "female" ? "여" : "기타" }} ·
          {{ resident.care_grade ? `장기요양 ${resident.care_grade}등급` : "등급 미부여" }}
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          입소일 {{ resident.admitted_on }}
        </div>
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-sm-6">
        <q-btn
          unelevated
          color="negative"
          icon="favorite"
          label="활력 측정"
          size="xl"
          class="full-width"
          style="height: 120px"
          @click="$router.push(`/residents/${id}/vital`)"
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-btn
          unelevated
          color="primary"
          icon="edit_note"
          label="케어 기록"
          size="xl"
          class="full-width"
          style="height: 120px"
          @click="$router.push(`/residents/${id}/care-log`)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { api } from "../lib/api";
import { useSessionStore } from "../stores/session";

const route = useRoute();
const id = route.params.id as string;
const resident = ref<Awaited<ReturnType<typeof api.resident>> | null>(null);
const session = useSessionStore();

onMounted(async () => {
  if (!session.token) return;
  try {
    resident.value = await api.resident(session.token, id);
  } catch {
    // handled by router guard on next nav
  }
});
</script>
