<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GameEngine, type Direction } from '@/game';
import GameHeader from '@/components/GameHeader.vue';
import GameControls from '@/components/GameControls.vue';
import GameGrid from '@/components/GameGrid.vue';
import GameInstructions from '@/components/GameInstructions.vue';

defineOptions({
  name: 'GameView',
});

const GRID_SIZE = 4;

const game = ref<GameEngine>(new GameEngine({ size: GRID_SIZE }));
const tiles = computed(() => game.value.tiles);
const score = computed(() => game.value.score);
const bestScore = computed(() => game.value.bestScore);
const gameOver = computed(() => game.value.gameOver);

// 移動処理
const move = (direction: Direction) => {
  const result = game.value.move(direction);
  if (result.moved) {
    // アニメーション後にマージされたタイルを削除
    setTimeout(() => {
      game.value.cleanupMergedTiles();
    }, 200);
  }
};

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
    move(direction);
  }
};

// リスタート
const restart = () => {
  game.value.reset();
};

// ライフサイクル
onMounted(() => {
  game.value.reset();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#faf8ef] p-4">
    <GameHeader :score="score" :best-score="bestScore" />

    <GameControls class="mb-4" @restart="restart" />

    <GameGrid
      :tiles="tiles"
      :size="GRID_SIZE"
      :game-over="gameOver"
      @move="move"
      @restart="restart"
    />

    <GameInstructions />

    <!-- アクセシビリティ用のライブリージョン -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      <span v-if="gameOver">Game Over. Your score is {{ score }}.</span>
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
