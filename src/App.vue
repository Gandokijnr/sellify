<template>
  <div class="min-h-screen bg-gray-50">
    <router-view class="md:pb-0 pb-[70px]" />
    <MobileNavBar />
    <PwaInstall />
  </div>
</template>

<script setup>
import MobileNavBar from '@/components/common/MobileNavBar.vue';
import PwaInstall from '@/components/pwa/PwaInstall.vue';
</script>
