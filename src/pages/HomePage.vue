<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5">{{ greeting }}, {{ session.user?.name }}</div>
        <div class="text-subtitle2 text-grey-7">
          {{ device.pair?.branchName }} · 오늘 담당 어르신
        </div>
      </div>
      <q-space />
      <q-btn flat round icon="logout" color="grey-7" @click="logout">
        <q-tooltip>다른 직원으로 전환</q-tooltip>
      </q-btn>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="50px" />
    </q-inner-loading>

    <q-banner v-if="error" class="bg-negative text-white q-mb-md">
      {{ error }}
    </q-banner>

    <div class="row q-col-gutter-md">
      <div v-for="r in residents" :key="r.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="resident-card cursor-pointer"
          @click="$router.push(`/residents/${r.id}`)"
        >
          <q-card-section>
            <div class="row items-center">
              <q-avatar :color="r.sex === 'male' ? 'blue-1' : 'pink-1'" text-color="grey-9">
                {{ r.full_name.charAt(0) }}
              </q-avatar>
              <div class="q-ml-md">
                <div class="text-h6">{{ r.full_name }}</div>
                <div class="text-caption text-grey-7">
                  <template v-if="r.room_number">{{ r.room_number }}호 · </template>
                  {{ r.care_grade ? `장기요양 ${r.care_grade}등급` : "등급 미부여" }}
                </div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense icon="favorite" color="negative" label="활력" @click.stop="$router.push(`/residents/${r.id}/vital`)" />
            <q-btn flat dense icon="edit_note" color="primary" label="기록" @click.stop="$router.push(`/residents/${r.id}/care-log`)" />
          </q-card-actions>
        </q-card>
      </div>

      <div v-if="!loading && residents.length === 0" class="col-12 q-pa-xl text-center text-grey-7">
        담당 어르신이 없습니다.
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api";
import { useDeviceStore } from "../stores/device";
import { useSessionStore } from "../stores/session";

const residents = ref<Awaited<ReturnType<typeof api.residents>>>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const session = useSessionStore();
const device = useDeviceStore();
const router = useRouter();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return "야간 근무 수고하십니다";
  if (h < 12) return "안녕하세요";
  if (h < 18) return "안녕하세요";
  return "저녁 근무 수고하십니다";
});

async function load() {
  if (!session.token) return;
  loading.value = true;
  try {
    residents.value = await api.residents(session.token);
  } catch (err: any) {
    if (err?.status === 401) {
      session.clear();
      router.replace("/pin");
    } else {
      error.value = err?.message ?? "어르신 목록을 불러오지 못했습니다.";
    }
  } finally {
    loading.value = false;
  }
}

function logout() {
  session.clear();
  router.replace("/pin");
}

onMounted(load);
</script>
