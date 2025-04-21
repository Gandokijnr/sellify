<script setup>
import LandingPage from "@/components/landingpage/LandingPage.vue";
import SelifyLoader from "@/components/common/SelifyLoader.vue"; // Adjust path as needed
import { ref } from "vue";
</script>

<template>
  <SelifyLoader>
    <template #logo-text>selify</template>
    <LandingPage />
  </SelifyLoader>
</template>
