<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { GameEngine, Tile, type Direction } from '@/game';

defineOptions({
  name: 'GameBoard',
});

interface Props {
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 4,
});

const game = ref<GameEngine>(new GameEngine({ size: props.size }));
const tiles = computed(() => game.value.tiles);
const score = computed(() => game.value.score);
const bestScore = computed(() => game.value.bestScore);
const gameOver = computed(() => game.value.gameOver);

// タイル背景色のマッピング
const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-[#eee4da]',
    4: 'bg-[#ede0c8]',
    8: 'bg-[#f2b179]',
    16: 'bg-[#f59563]',
    32: 'bg-[#f67c5f]',
    64: 'bg-[#f65e3b]',
    128: 'bg-[#edcf72]',
    256: 'bg-[#edcc61]',
    512: 'bg-[#edc850]',
    1024: 'bg-[#edc53f]',
    2048: 'bg-[#edc22e]',
  };
  return colors[value] || 'bg-[#3c3a32]';
};

// タイル文字色
const getTileTextColor = (value: number): string => {
  return value <= 4 ? 'text-[#776e65]' : 'text-white';
};

// タイル位置のスタイル計算
const getTilePosition = (tile: Tile) => {
  const cellSize = 100 / props.size;
  return {
    left: `${tile.col * cellSize}%`,
    top: `${tile.row * cellSize}%`,
    width: `${cellSize}%`,
    height: `${cellSize}%`,
  };
};

// タイルのクラス
const getTileClasses = (tile: Tile) => {
  return [
    'absolute',
    'flex',
    'items-center',
    'justify-center',
    'font-bold',
    'rounded-lg',
    'transition-all',
    'duration-200',
    getTileColor(tile.value),
    getTileTextColor(tile.value),
    {
      'scale-110': tile.isNew,
      'scale-125': tile.justMerged,
    },
  ];
};

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

// タッチ操作
const touchStartX = ref(0);
const touchStartY = ref(0);

const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0];
  if (touch) {
    touchStartX.value = touch.clientX;
    touchStartY.value = touch.clientY;
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0];
  if (!touch) return;

  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;
  const minSwipeDistance = 30;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 横方向のスワイプ
    if (Math.abs(deltaX) > minSwipeDistance) {
      move(deltaX > 0 ? 'right' : 'left');
    }
  } else {
    // 縦方向のスワイプ
    if (Math.abs(deltaY) > minSwipeDistance) {
      move(deltaY > 0 ? 'down' : 'up');
    }
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
    <!-- ヘッダー -->
    <div class="w-full max-w-md mb-4">
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
      <div class="flex items-center justify-between">
        <p class="text-sm text-[#776e65]">Join the tiles, get to <strong>2048!</strong></p>
        <button
          @click="restart"
          class="bg-[#8f7a66] text-white px-4 py-2 rounded font-bold hover:bg-[#9f8a76] transition-colors"
        >
          New Game
        </button>
      </div>
    </div>

    <!-- ゲームボード -->
    <div
      class="relative bg-[#bbada0] rounded-lg p-2 w-full max-w-md aspect-square"
      :style="{ touchAction: 'none' }"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
      tabindex="0"
      role="application"
      aria-label="2048 Game Board"
    >
      <!-- グリッド背景 -->
      <div
        class="grid gap-2 w-full h-full"
        :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }"
      >
        <div v-for="i in size * size" :key="i" class="bg-[#cdc1b4] rounded-lg" />
      </div>

      <!-- タイル -->
      <div class="absolute inset-2">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          :class="getTileClasses(tile)"
          :style="getTilePosition(tile)"
        >
          <span :class="tile.value >= 1024 ? 'text-3xl' : 'text-4xl'">
            {{ tile.value }}
          </span>
        </div>
      </div>

      <!-- ゲームオーバーオーバーレイ -->
      <div
        v-if="gameOver"
        class="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center"
      >
        <div class="text-center">
          <p class="text-5xl font-bold text-[#776e65] mb-4">Game Over!</p>
          <button
            @click="restart"
            class="bg-[#8f7a66] text-white px-6 py-3 rounded-lg font-bold text-xl hover:bg-[#9f8a76] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- 操作説明 -->
    <div class="mt-4 text-center text-sm text-[#776e65] max-w-md">
      <p><strong>How to play:</strong> Use arrow keys or swipe to move tiles.</p>
      <p>When two tiles with the same number touch, they merge into one!</p>
    </div>

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
