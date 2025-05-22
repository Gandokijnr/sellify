<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { chatService } from '@/services/chatService';
import { ArrowDownCircle, Bell } from 'lucide-vue-next';

const toast = useToast();
const deferredPrompt = ref(null);
const showInstallButton = ref(false);
const showNotificationButton = ref(false);
const isIOS = ref(false);
const isDesktop = ref(false);
const dismissedInstall = ref(false);
const dismissedNotification = ref(false);

onMounted(async () => {
  // Detect if the app can be installed (not already installed)
  isIOS.value = checkIfIOS();
  isDesktop.value = checkIfDesktop();
  
  // For iOS, we'll show different instructions
  if (isIOS.value) {
    // Check if the app is already in standalone mode
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      showInstallButton.value = true;
    }
  }
  
  // For desktop, we'll show the install button if not in standalone mode
  if (isDesktop.value) {
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      showInstallButton.value = !dismissedInstall.value;
    }
  }
  
  // Check for PWA installation prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallButton.value = !dismissedInstall.value;
  });

  // Check notification permission status
  if ('Notification' in window) {
    const permission = await Notification.permission;
    showNotificationButton.value = permission === 'default' && !dismissedNotification.value;
  }

  // Handle installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    showInstallButton.value = false;
  });
});

// Function to check if the app is running on iOS
const checkIfIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Function to check if the app is running on desktop
const checkIfDesktop = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return !(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
};

const installPWA = async () => {
  if (!deferredPrompt.value) {
    return;
  }

  deferredPrompt.value.prompt();
  const { outcome } = await deferredPrompt.value.userChoice;

  if (outcome === 'accepted') {
    toast.success('Thank you for installing Selify!');
    // After installation, prompt for notifications
    requestNotifications();
  }

  deferredPrompt.value = null;
  showInstallButton.value = false;
};

const cancelInstall = () => {
  dismissedInstall.value = true;
  showInstallButton.value = false;
  toast.info('Installation dismissed. You can install the app later from the menu.', {
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
  });
};

const requestNotifications = async () => {
  try {
    const granted = await chatService.requestNotificationPermission();
    if (granted) {
      const subscription = await chatService.subscribeToPush();
      if (subscription) {
        toast.success('Notifications enabled! You\'ll receive updates for new messages.', {
          timeout: 5000,
          closeOnClick: true,
          pauseOnFocusLoss: true,
        });
      }
    }
    showNotificationButton.value = false;
  } catch (error) {
    console.error('Error enabling notifications:', error);
    toast.error('Could not enable notifications. Please try again.');
  }
};

const cancelNotifications = () => {
  dismissedNotification.value = true;
  showNotificationButton.value = false;
  toast.info('Notifications dismissed. You can enable them later from the settings.');
};
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-4">
    <div v-if="showInstallButton" class="flex space-x-2 items-center bg-teal-500 rounded">
      <button
        @click="installPWA"
        class="text-white px-4 py-3 rounded-lg shadow-lg hover:bg-teal-600 transition-colors flex items-center flex-1"
      >
        <ArrowDownCircle class="h-5 w-5 mr-2" />
        <span>
          {{ isIOS ? 'Install on iOS' : isDesktop ? 'Install on Desktop' : 'Install App' }}
        </span>
      </button>
      <button
        @click="cancelInstall"
        class=" text-white px-3 py-3 rounded-lg shadow-lg hover:bg-white transition-colors"
        title="Dismiss"
      >
        <span>✕</span>
      </button>
    </div>

    <div v-if="showNotificationButton" class="flex space-x-2 items-center bg-teal-500 rounded">
      <button
        @click="requestNotifications"
        class="bg-teal-500 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-teal-600 transition-colors flex items-center flex-1"
      >
        <Bell class="h-5 w-5 mr-2" />
        <span>Enable Notifications</span>
      </button>
      <button
        @click="cancelNotifications"
        class="text-white px-3 py-3 rounded-lg shadow-lg hover:bg-white transition-colors"
        title="Dismiss"
      >
        <span>✕</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-install-container {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 999;
}

.pwa-install-button {
  display: flex;
  align-items: center;
  background-color: #0D9488;
  color: white;
  padding: 5px 20px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.pwa-install-button:hover {
  background-color: #0F766E;
  transform: translateY(-2px);
}
</style>
