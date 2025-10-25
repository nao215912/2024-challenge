<script setup lang="ts">
import { ref, computed, nextTick, type ComponentPublicInstance } from 'vue';
import { useElementSize, useSwipe } from '@vueuse/core';
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

// グリッドサイズの監視（VueUse）
const gridRef = ref<HTMLElement>();
const { width: containerWidth } = useElementSize(gridRef);

// タイル色
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

const getTileTextColor = (value: number): string => {
  return value <= 4 ? 'text-[#776e65]' : 'text-white';
};

// タイル位置とサイズの計算
const gap = 8; // gap-2 = 8px

const cellSize = computed(() => {
  const totalGap = (props.size - 1) * gap;
  return (containerWidth.value - totalGap) / props.size;
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

// DOM参照とアニメーション管理
const bodyRefs = new Map<number, HTMLElement>();
const animatedOnce = new Set<number>();

const setBodyRef = (el: Element | ComponentPublicInstance | null, tile: Tile) => {
  const element = el as HTMLElement | null;

  if (element) {
    bodyRefs.set(tile.id, element);

    // マウント直後に1回だけアニメーションクラスを付与
    if (!animatedOnce.has(tile.id)) {
      nextTick(() => {
        if (tile.isNew) {
          element.classList.add('is-new');
          tile.isNew = false;
        }
        if (tile.justMerged) {
          element.classList.add('is-merged');
          tile.justMerged = false;
        }
        animatedOnce.add(tile.id);
      });
    }
  } else {
    bodyRefs.delete(tile.id);
    animatedOnce.delete(tile.id);
  }
};

// アニメーション終了時の処理
const handleAnimEnd = (tileId: number, event: AnimationEvent) => {
  if (event.animationName === 'pop-in' || event.animationName === 'merge-bounce') {
    const element = bodyRefs.get(tileId);
    if (element) {
      element.classList.remove('is-new', 'is-merged');
    }
  }
};

// スワイプ操作（VueUse）
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
    if (dir) {
      emit('move', dir);
    }
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

    <!-- タイル (外: translate / 内: scale) -->
    <div class="absolute inset-2">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="tile-translate absolute rounded-lg"
        :style="getTranslateStyle(tile)"
      >
        <div
          :ref="(el: any) => setBodyRef(el, tile)"
          class="tile-scale flex h-full w-full items-center justify-center font-bold rounded-lg transition-transform duration-150 ease-in-out"
          :class="[getTileColor(tile.value), getTileTextColor(tile.value)]"
          @animationend="(e: AnimationEvent) => handleAnimEnd(tile.id, e as AnimationEvent)"
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
/* 外側は “移動のみ” を担当（transform: translate） */
.tile-translate {
  transition: transform 150ms ease-in-out;
  will-change: transform;
}

/* 内側は “拡大縮小のみ” を担当（transform: scale） */
.tile-scale {
  transform: scale(1);
  will-change: transform;
}

/* 出現アニメ（scale のみ動かす） */
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

/* 合成アニメ（scale のみ動かす） */
.is-merged {
  animation: merge-bounce 180ms ease-in-out both;
}
@keyframes merge-bounce {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
