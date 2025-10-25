<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useElementSize, useSwipe } from '@vueuse/core';
import { Tile, type Direction } from '@/game';

defineOptions({ name: 'GameGrid' });

interface Props {
  tiles: Tile[];
  size: number;
  gameOver: boolean;
}
interface Emits {
  (e: 'restart'): void;
  (e: 'move', direction: Direction): void;
  (e: 'animationComplete'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// === サイズ計算 ===
const gridRef = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(gridRef);
const gap = 8; // gap-2 = 8px
const cellSize = computed(() => {
  const cw = containerWidth.value || 0;
  const totalGap = (props.size - 1) * gap;
  const size = (cw - totalGap) / props.size;
  return Number.isFinite(size) && size > 0 ? size : 0; // NaN防止
});
const getTranslateStyle = (tile: Tile) => {
  const left = tile.col * (cellSize.value + gap);
  const top = tile.row * (cellSize.value + gap);
  return {
    transform: `translate(${left}px, ${top}px)`,
    width: `${cellSize.value}px`,
    height: `${cellSize.value}px`,
  };
};

// === 色 ===
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
const getTileTextColor = (value: number) => (value <= 4 ? 'text-[#776e65]' : 'text-white');

// === アニメ順序制御 ===
const appearing = ref<Set<number>>(new Set());
const merging = ref<Set<number>>(new Set());
const mergeQueue = ref<Set<number>>(new Set());
const inFlight = ref(0);

const ensureAppearOnce = (tile: Tile) => {
  if (tile.isNew && !appearing.value.has(tile.id)) {
    appearing.value.add(tile.id);
    inFlight.value++;
    nextTick(() => (tile.isNew = false));
  }
};

const maybeStartMerge = (tileId: number) => {
  if (mergeQueue.value.has(tileId)) {
    mergeQueue.value.delete(tileId);
    merging.value.add(tileId);
    inFlight.value++;
  }
};

const tileAnimClass = (tile: Tile) => {
  if (tile.isNew) ensureAppearOnce(tile);
  if (tile.justMerged) {
    mergeQueue.value.add(tile.id);
    nextTick(() => (tile.justMerged = false));
  }
  return {
    'is-new': appearing.value.has(tile.id),
    'is-merged': merging.value.has(tile.id),
  };
};

const onMoveStart = () => {
  inFlight.value++;
};
const onMoveEnd = (tileId: number) => {
  maybeStartMerge(tileId);
  inFlight.value = Math.max(0, inFlight.value - 1);
  maybeEmitAnimationComplete();
};
const onAnimEnd = (tileId: number) => {
  if (appearing.value.delete(tileId)) inFlight.value = Math.max(0, inFlight.value - 1);
  if (merging.value.delete(tileId)) inFlight.value = Math.max(0, inFlight.value - 1);
  maybeEmitAnimationComplete();
};
const maybeEmitAnimationComplete = () => {
  if (
    inFlight.value === 0 &&
    mergeQueue.value.size === 0 &&
    appearing.value.size === 0 &&
    merging.value.size === 0
  ) {
    nextTick(() => emit('animationComplete'));
  }
};

// moveイベント
const handleMove = (direction: Direction) => {
  emit('move', direction);
};

// スワイプ操作
const { direction: swipeDirection } = useSwipe(gridRef, {
  threshold: 30,
  onSwipe() {
    const directionMap: Record<string, Direction> = {
      left: 'left',
      right: 'right',
      up: 'up',
      down: 'down',
    };
    const dir = directionMap[swipeDirection.value];
    if (dir) handleMove(dir);
  },
});
</script>

<template>
  <div
    ref="gridRef"
    class="relative bg-[#bbada0] rounded-lg p-2 w-full max-w-md aspect-square overflow-hidden"
    :style="{ touchAction: 'none' }"
  >
    <!-- 背景 -->
    <div class="grid gap-2 w-full h-full" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
      <div v-for="i in size * size" :key="i" class="bg-[#cdc1b4] rounded-lg" />
    </div>

    <!-- タイル -->
    <div class="absolute inset-2">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="tile-translate absolute rounded-lg"
        :style="getTranslateStyle(tile)"
        @transitionrun="onMoveStart"
        @transitionend="() => onMoveEnd(tile.id)"
      >
        <div
          class="tile-scale flex h-full w-full items-center justify-center font-bold rounded-lg transition-transform duration-150 ease-in-out"
          :class="[
            getTileColor(tile.value),
            getTileTextColor(tile.value),
            tileAnimClass(tile),
          ]"
          @animationend="() => onAnimEnd(tile.id)"
        >
          <span :class="tile.value >= 1024 ? 'text-3xl' : 'text-4xl'">{{ tile.value }}</span>
        </div>
      </div>
    </div>

    <!-- Game Over -->
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

<style scoped>
.tile-translate {
  transition: transform 150ms ease-in-out;
  will-change: transform;
}
.tile-scale {
  transform: scale(1);
  will-change: transform;
}

/* 出現アニメ */
.is-new {
  animation: pop-in 150ms ease-out both;
}
@keyframes pop-in {
  0% {
    transform: scale(0.5);
    opacity: 0.6;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 合成アニメ */
.is-merged {
  animation: merge-bounce 160ms ease-in-out both;
}
@keyframes merge-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}
</style>
