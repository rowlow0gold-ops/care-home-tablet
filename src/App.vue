<template>
  <q-layout view="hHh lpR fFf">
    <router-view />
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useDeviceStore } from "./stores/device";
import { useRouter } from "vue-router";

const device = useDeviceStore();
const router = useRouter();

onMounted(async () => {
  await device.hydrate();
  if (!device.paired) {
    router.replace("/pair");
  }
});
</script>
