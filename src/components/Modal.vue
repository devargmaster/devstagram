<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const onConfirm = () => {
  emit('confirm');
};

const onCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <h2 class="modal-title">
        <slot name="title"></slot>
      </h2>
      <p class="modal-message">
        <slot name="message"></slot>
      </p>
      <div class="flex justify-end">
        <button @click="onCancel"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
          Cancelar
        </button>
        <button @click="onConfirm"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>



