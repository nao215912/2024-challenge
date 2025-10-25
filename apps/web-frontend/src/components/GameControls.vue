<script setup lang="ts">
defineOptions({
  name: 'GameControls',
});

interface Emits {
  (e: 'restart'): void;
}

defineEmits<Emits>();
</script>

<template>
  <div class="w-full max-w-md flex items-center justify-between">
    <p class="text-sm text-[#776e65]">Join the tiles, get to <strong>2048!</strong></p>
    <button
      @click="$emit('restart')"
      class="bg-[#8f7a66] text-white px-4 py-2 rounded font-bold hover:bg-[#9f8a76] transition-colors"
    >
      New Game
    </button>
  </div>
</template>
