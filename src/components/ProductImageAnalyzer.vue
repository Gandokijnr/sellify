<template>
  <div class="max-w-3xl mx-auto p-5">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 text-center">Product Image Analysis</h2>
    
    <p class="text-center text-gray-600 mb-6">
      Take a photo or upload an image of your product, and our AI will help identify and describe it.
    </p>
    
    <!-- Image Capture Component -->
    <ImageCapture 
      @results-ready="handleAnalysisResults"
      @edit-results="handleEditResults"
    />
    
    <!-- Results Editor (appears when editing) -->
    <div v-if="isEditing" class="mt-8 bg-gray-100 p-5 rounded-lg shadow-sm">
      <h3 class="text-xl font-medium mb-4">Edit Product Details</h3>
      <form @submit.prevent="saveEditedResults">
        <div class="mb-4">
          <label for="title" class="block font-medium mb-1.5 text-gray-700">Title</label>
          <input 
            id="title" 
            v-model="editingResults.title" 
            type="text" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-4">
          <label for="category" class="block font-medium mb-1.5 text-gray-700">Category</label>
          <input 
            id="category" 
            v-model="editingResults.category" 
            type="text" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-4">
          <label for="subCategory" class="block font-medium mb-1.5 text-gray-700">Sub-Category</label>
          <input 
            id="subCategory" 
            v-model="editingResults.subCategory" 
            type="text" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-4">
          <label for="color" class="block font-medium mb-1.5 text-gray-700">Color</label>
          <input 
            id="color" 
            v-model="editingResults.color" 
            type="text" 
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div class="mb-4">
          <label for="description" class="block font-medium mb-1.5 text-gray-700">Description</label>
          <textarea 
            id="description" 
            v-model="editingResults.description" 
            rows="5"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y"
          ></textarea>
        </div>
        
        <div class="flex justify-end gap-3 mt-5">
          <button 
            type="button" 
            class="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" 
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="px-5 py-2.5 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ImageCapture from './ImageCapture.vue';

export default {
  name: 'ProductImageAnalyzer',
  components: {
    ImageCapture
  },
  emits: ['product-analyzed'],
  
  setup(props, { emit }) {
    const isEditing = ref(false);
    const editingResults = ref(null);
    const finalResults = ref(null);
    
    // Handle results from the image analysis
    const handleAnalysisResults = (results) => {
      console.log('Analysis results received:', results);
      finalResults.value = { ...results };
      emit('product-analyzed', finalResults.value);
    };
    
    // Handle when user wants to edit the results
    const handleEditResults = (results) => {
      editingResults.value = { ...results };
      isEditing.value = true;
    };
    
    // Save the edited results
    const saveEditedResults = () => {
      finalResults.value = { ...editingResults.value };
      emit('product-analyzed', finalResults.value);
      isEditing.value = false;
    };
    
    // Cancel editing
    const cancelEditing = () => {
      isEditing.value = false;
      editingResults.value = null;
    };
    
    return {
      isEditing,
      editingResults,
      handleAnalysisResults,
      handleEditResults,
      saveEditedResults,
      cancelEditing
    };
  }
};
</script>

<style scoped>
.product-analyzer-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.analyzer-title {
  font-size: 28px;
  margin-bottom: 16px;
  color: #333;
  text-align: center;
}

.analyzer-description {
  text-align: center;
  color: #666;
  margin-bottom: 24px;
}

.results-editor {
  margin-top: 30px;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea.form-control {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}
</style>
