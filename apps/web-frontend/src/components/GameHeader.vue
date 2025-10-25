<script setup lang="ts">
defineOptions({
  name: 'GameHeader',
});

interface Props {
  score: number;
  bestScore: number;
}

defineProps<Props>();
</script>

<template>
  <div class="w-full max-w-md">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-5xl font-bold text-[#776e65]">2048</h1>
      <div class="flex gap-2">
        <div class="bg-[#bbada0] px-4 py-2 rounded text-center min-w-20">
          <div class="text-xs text-[#eee4da] uppercase">Score</div>
          <div class="text-2xl font-bold text-white">{{ score }}</div>
        </div>
        <div class="bg-[#bbada0] px-4 py-2 rounded text-center min-w-20">
          <div class="text-xs text-[#eee4da] uppercase">Best</div>
          <div class="text-2xl font-bold text-white">{{ bestScore }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
