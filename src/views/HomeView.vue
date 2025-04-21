<script setup>
import LandingPage from "@/components/landingpage/LandingPage.vue";
import { ref } from "vue";
</script>

<template>
  <SelifyLoader
    :initialShow="true"
    :autoStart="true"
    @complete="handleLoadComplete"
  >
    <template #logo-text>selify</template>
    <LandingPage />
  </SelifyLoader>
</template>
