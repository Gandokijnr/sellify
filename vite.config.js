import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import { splitVendorChunkPlugin } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    // Only include devTools in development mode
    process.env.NODE_ENV === 'development' ? vueDevTools() : null,
    tailwindcss(),
    splitVendorChunkPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    // Fix for Firebase v11.6.0 package resolution
    dedupe: ['firebase']
  },
  optimizeDeps: {
    // Force include problematic dependencies
    include: ['firebase']
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          // Remove firebase from manual chunks
          'ui': ['vue-toastification', 'animate.css'],
        },
        // Ensure chunk sizes are reasonable
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Generate sourcemaps only in dev mode
    sourcemap: process.env.NODE_ENV !== 'production',
    // Handle commonjs dependencies
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
});
