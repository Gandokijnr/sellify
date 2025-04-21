<script setup>
import LandingPage from "@/components/landingpage/LandingPage.vue";
</script>

<template>
  <SelifyLoader
    :initialShow="true"
    :autoStart="true"
    @complete="handleLoadComplete"
  >
    <LandingPage />
  </SelifyLoader>
</template>
