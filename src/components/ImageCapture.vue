<template>
  <div class="image-capture-container">
    <!-- Tab navigation -->
    <div class="tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'upload' }" 
        @click="activeTab = 'upload'"
      >
        Upload Image
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'camera' }" 
        @click="initCamera"
      >
        Take Photo
      </button>
    </div>

    <!-- Upload tab content -->
    <div v-if="activeTab === 'upload'" class="tab-content">
      <div 
        class="dropzone"
        @dragover.prevent="highlightDropZone"
        @dragleave.prevent="unhighlightDropZone"
        @drop.prevent="handleDrop"
        :class="{ 'highlight': isHighlighted }"
      >
        <div v-if="!previewImage" class="upload-prompt">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Drag & drop an image or click to browse</p>
          <input 
            type="file" 
            ref="fileInput" 
            accept="image/*" 
            @change="handleFileSelect" 
            class="file-input"
          />
          <button class="browse-btn" @click="triggerFileInput">Browse Files</button>
        </div>
        <div v-else class="preview-container">
          <img :src="previewImage" alt="Preview" class="preview-image" />
          <div class="preview-controls">
            <button class="control-btn" @click="clearImage">
              <i class="fas fa-times"></i> Clear
            </button>
            <button class="control-btn analyze-btn" @click="analyzeImage" :disabled="isAnalyzing">
              <i class="fas fa-magic"></i> {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera tab content -->
    <div v-if="activeTab === 'camera'" class="tab-content">
      <div class="camera-container">
        <video 
          v-if="isCameraActive && !previewImage" 
          ref="videoElement" 
          autoplay 
          playsinline
          class="camera-feed"
        ></video>
        <div v-else-if="previewImage" class="preview-container">
          <img :src="previewImage" alt="Captured" class="preview-image" />
          <div class="preview-controls">
            <button class="control-btn" @click="clearImage">
              <i class="fas fa-times"></i> Clear
            </button>
            <button class="control-btn analyze-btn" @click="analyzeImage" :disabled="isAnalyzing">
              <i class="fas fa-magic"></i> {{ isAnalyzing ? 'Analyzing...' : 'Analyze' }}
            </button>
          </div>
        </div>
        <div v-else class="camera-placeholder">
          <p>Camera initialization...</p>
        </div>
      </div>
      <div v-if="isCameraActive && !previewImage" class="camera-controls">
        <button class="capture-btn" @click="captureImage">
          <i class="fas fa-camera"></i>
        </button>
      </div>
    </div>

    <!-- Analysis results -->
    <div v-if="analysisResults" class="analysis-results">
      <h3>Product Analysis</h3>
      <div class="result-item" v-if="analysisResults.title">
        <span class="label">Title:</span> 
        <span class="value">{{ analysisResults.title }}</span>
      </div>
      <div class="result-item" v-if="analysisResults.brand">
        <span class="label">Brand:</span> 
        <span class="value">{{ analysisResults.brand }}</span>
      </div>
      <div class="result-item" v-if="analysisResults.category">
        <span class="label">Category:</span> 
        <span class="value">{{ analysisResults.category }}</span>
      </div>
      <div class="result-item" v-if="analysisResults.color">
        <span class="label">Color:</span> 
        <span class="value">{{ analysisResults.color }}</span>
      </div>
      <div class="result-item" v-if="analysisResults.description">
        <span class="label">Description:</span> 
        <span class="value">{{ analysisResults.description }}</span>
      </div>
      <div class="result-actions">
        <button class="action-btn" @click="useResults">
          <i class="fas fa-check"></i> Use These Results
        </button>
        <button class="action-btn secondary" @click="editResults">
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';
import { analyzeProductImageWithTensorflow } from '@/firebase/ai';

export default {
  name: 'ImageCapture',
  emits: ['results-ready', 'edit-results'],
  
  setup(props, { emit }) {
    const activeTab = ref('upload');
    const previewImage = ref(null);
    const isHighlighted = ref(false);
    const fileInput = ref(null);
    const videoElement = ref(null);
    const isCameraActive = ref(false);
    const stream = ref(null);
    const isAnalyzing = ref(false);
    const analysisResults = ref(null);
    
    // File upload handling
    const highlightDropZone = () => {
      isHighlighted.value = true;
    };
    
    const unhighlightDropZone = () => {
      isHighlighted.value = false;
    };
    
    const handleDrop = (e) => {
      isHighlighted.value = false;
      const file = e.dataTransfer.files[0];
      if (file && file.type.match('image.*')) {
        handleImageFile(file);
      }
    };
    
    const triggerFileInput = () => {
      fileInput.value.click();
    };
    
    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageFile(file);
      }
    };
    
    const handleImageFile = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.value = e.target.result;
        analysisResults.value = null; // Clear previous results
      };
      reader.readAsDataURL(file);
    };
    
    // Camera handling
    const initCamera = async () => {
      activeTab.value = 'camera';
      try {
        if (!isCameraActive.value) {
          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'environment' // Use back camera on mobile
            }
          };
          
          stream.value = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoElement.value) {
            videoElement.value.srcObject = stream.value;
            isCameraActive.value = true;
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please make sure you have granted camera permissions.');
      }
    };
    
    const captureImage = () => {
      if (!isCameraActive.value) return;
      
      const canvas = document.createElement('canvas');
      const video = videoElement.value;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      previewImage.value = canvas.toDataURL('image/jpeg');
      analysisResults.value = null; // Clear previous results
    };
    
    const clearImage = () => {
      previewImage.value = null;
      analysisResults.value = null;
    };
    
    // Image analysis
    const analyzeImage = async () => {
      if (!previewImage.value) return;
      
      isAnalyzing.value = true;
      try {
        // Call the TensorFlow.js analysis function
        const results = await analyzeProductImageWithTensorflow(previewImage.value);
        analysisResults.value = results;
      } catch (error) {
        console.error('Analysis error:', error);
        alert('Error analyzing image. Please try again.');
      } finally {
        isAnalyzing.value = false;
      }
    };
    
    // Result handling
    const useResults = () => {
      emit('results-ready', analysisResults.value);
    };
    
    const editResults = () => {
      emit('edit-results', analysisResults.value);
    };
    
    // Cleanup
    onUnmounted(() => {
      if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop());
      }
    });
    
    return {
      activeTab,
      previewImage,
      isHighlighted,
      fileInput,
      videoElement,
      isCameraActive,
      isAnalyzing,
      analysisResults,
      highlightDropZone,
      unhighlightDropZone,
      handleDrop,
      triggerFileInput,
      handleFileSelect,
      initCamera,
      captureImage,
      clearImage,
      analyzeImage,
      useResults,
      editResults
    };
  }
};
</script>

<style scoped>
.image-capture-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eaeaea;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #3498db;
  border-bottom: 3px solid #3498db;
}

.tab-content {
  padding: 20px;
}

.dropzone {
  border: 2px dashed #e0e0e0;
  border-radius: 6px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s;
}

.dropzone.highlight {
  border-color: #3498db;
  background-color: rgba(52, 152, 219, 0.05);
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-prompt i {
  font-size: 48px;
  color: #bbbbbb;
}

.file-input {
  display: none;
}

.browse-btn {
  background-color: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-btn:hover {
  background-color: #2980b9;
}

.camera-container {
  aspect-ratio: 4/3;
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.camera-feed, .preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  display: flex;
  justify-content: center;
  padding: 15px 0;
}

.capture-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.capture-btn i {
  font-size: 24px;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.control-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.analyze-btn {
  background-color: #3498db;
  color: white;
}

.analysis-results {
  padding: 20px;
  border-top: 1px solid #eaeaea;
}

.result-item {
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  display: inline-block;
  min-width: 100px;
}

.result-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-btn {
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.secondary {
  background-color: #95a5a6;
}

.camera-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #777;
}
</style>
