<script setup>
import LandingPage from "@/components/landingpage/LandingPage.vue";
import PageSeo from "@/components/seo/PageSeo.vue";
</script>

<template>
  <PageSeo
    pageName="home"
    structuredDataType="home"
  />
  <SelifyLoader
    :initialShow="true"
    :autoStart="true"
    @complete="handleLoadComplete"
  >
    <LandingPage />
  </SelifyLoader>
</template>
