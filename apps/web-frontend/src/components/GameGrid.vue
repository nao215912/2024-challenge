<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { Tile, type Direction } from '@/game';

defineOptions({
  name: 'GameGrid',
});

interface Props {
  tiles: Tile[];
  size: number;
  gameOver: boolean;
}

interface Emits {
  (e: 'restart'): void;
  (e: 'move', direction: Direction): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

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
  // gap-2 = 0.5rem = 8px
  const gap = 8;

  // calc()を使用してグリッドセルと同じサイズと位置を計算
  // セルサイズ = (100% - gap合計) / セル数
  const cellSize = `calc((100% - ${(props.size - 1) * gap}px) / ${props.size})`;

  // セル位置 = (セルサイズ + gap) * インデックス
  const left = `calc((${cellSize} + ${gap}px) * ${tile.col})`;
  const top = `calc((${cellSize} + ${gap}px) * ${tile.row})`;

  return {
    left,
    top,
    width: cellSize,
    height: cellSize,
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
      'scale-105': tile.isNew,
      'scale-110': tile.justMerged,
    },
  ];
};

// タッチ操作
const touchStartX: Ref<number> = ref(0);
const touchStartY: Ref<number> = ref(0);

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
      emit('move', deltaX > 0 ? 'right' : 'left');
    }
  } else {
    // 縦方向のスワイプ
    if (Math.abs(deltaY) > minSwipeDistance) {
      emit('move', deltaY > 0 ? 'down' : 'up');
    }
  }
};
</script>

<template>
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
    <div class="grid gap-2 w-full h-full" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
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
          @click="emit('restart')"
          class="bg-[#8f7a66] text-white px-6 py-3 rounded-lg font-bold text-xl hover:bg-[#9f8a76] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>
