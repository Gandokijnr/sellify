<template>
  <div v-if="updateAvailable" class="fixed bottom-4 right-4 z-50 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate__animated animate__fadeInUp">
    <div class="p-4 flex items-start">
      <div class="flex-shrink-0 p-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Update Available!</h3>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <p>A new version of Selify is available. Refresh now to get the latest features and improvements.</p>
        </div>
        <div class="mt-4 flex">
          <button 
            type="button" 
            @click="updateNow" 
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Update Now (recommended)
          </button>
          <button 
            type="button" 
            @click="dismiss" 
            class="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpdateNotification',
  data() {
    return {
      updateAvailable: false,
      version: null
    }
  },
  mounted() {
    // Listen for the custom event fired when an update is available
    window.addEventListener('appUpdateAvailable', this.handleUpdateAvailable);
    
    // Check if there's already a notification that was dismissed but not applied
    const lastDismissed = localStorage.getItem('update_dismissed_time');
    const lastDismissedVersion = localStorage.getItem('update_dismissed_version');
    
    if (lastDismissed) {
      const timeSinceDismiss = Date.now() - parseInt(lastDismissed);
      // If it's been less than 24 hours since dismissal, don't show again
      if (timeSinceDismiss < 24 * 60 * 60 * 1000) {
        this.updateAvailable = false;
      } else {
        // It's been more than 24 hours, show the notification again
        this.updateAvailable = true;
        this.version = lastDismissedVersion || 'new version';
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('appUpdateAvailable', this.handleUpdateAvailable);
  },
  methods: {
    handleUpdateAvailable(event) {
      this.updateAvailable = true;
      if (event.detail && event.detail.version) {
        this.version = event.detail.version;
      }
    },
    updateNow() {
      // Clear any dismissed status
      localStorage.removeItem('update_dismissed_time');
      localStorage.removeItem('update_dismissed_version');
      
      // Send message to the service worker to skip waiting
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // The page will reload automatically when the service worker takes control
    },
    dismiss() {
      this.updateAvailable = false;
      
      // Store the dismissal time and version
      localStorage.setItem('update_dismissed_time', Date.now().toString());
      if (this.version) {
        localStorage.setItem('update_dismissed_version', this.version);
      }
    }
  }
}
</script>
