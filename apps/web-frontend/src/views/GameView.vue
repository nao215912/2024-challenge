<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Direction } from '@/game';
import { useGameStore } from '@/stores/game';
import GameHeader from '@/components/GameHeader.vue';
import GameControls from '@/components/GameControls.vue';
import GameGrid from '@/components/GameGrid.vue';
import GameInstructions from '@/components/GameInstructions.vue';

defineOptions({
  name: 'GameView',
});

// Store
const gameStore = useGameStore();

// キーボード操作
const handleKeydown = (event: KeyboardEvent) => {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const direction = keyMap[event.key];
  if (direction) {
    event.preventDefault();
    gameStore.move(direction);
  }
};

// ライフサイクル
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#faf8ef] p-4">
    <GameHeader :score="gameStore.score" :best-score="gameStore.bestScore" />

    <GameControls class="mb-4" @restart="gameStore.reset" />

    <GameGrid
      :tiles="gameStore.tiles"
      :size="gameStore.size"
      :game-over="gameStore.gameOver"
      @move="gameStore.move"
      @restart="gameStore.reset"
      @animation-complete="gameStore.cleanupMergedTiles"
    />

    <GameInstructions />

    <!-- アクセシビリティ用のライブリージョン -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      <span v-if="gameStore.gameOver">Game Over. Your score is {{ gameStore.score }}.</span>
    </div>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
