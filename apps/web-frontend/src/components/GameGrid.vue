<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Tile, type Direction } from '@/game';

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

// 色
const getTileColor = (v: number) => {
  const c: Record<number, string> = {
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
  return c[v] || 'bg-[#3c3a32]';
};
const getTileTextColor = (v: number) => {
  if (v === 2 || v === 4) return 'text-[#776e65]'; // 黒文字
  return 'text-white'; // その他は白
};

// サイズ・位置
const gridRef = ref<HTMLElement | null>(null);
const containerSize = ref(0);
const gap = 8;
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!gridRef.value) return;
  observer = new ResizeObserver(([entry]) => (containerSize.value = entry.contentRect.width));
  observer.observe(gridRef.value);
});
onBeforeUnmount(() => observer?.disconnect());

const cellSize = computed(() => {
  const totalGap = (props.size - 1) * gap;
  return (containerSize.value - totalGap) / props.size;
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

// DOM参照とアニメ付与
const tileRefs = new Map<number, HTMLElement>(); // 外側(translate) の div
const bodyRefs = new Map<number, HTMLElement>(); // 内側(scale) の div
const animatedOnce = new Set<number>(); // マウント直後の重複防止

const setTileRef = (el: HTMLElement | null, tile: Tile) => {
  if (el) tileRefs.set(tile.id, el);
  else tileRefs.delete(tile.id);
};
const setBodyRef = (el: HTMLElement | null, tile: Tile) => {
  if (el) {
    bodyRefs.set(tile.id, el);
    // マウント直後に1回だけアニメ用クラスを付与（“2アクション”防止）
    if (!animatedOnce.has(tile.id)) {
      nextTick(() => {
        // isNew / justMerged はエンジンが付ける前提
        if (tile.isNew) {
          el.classList.add('is-new');
          tile.isNew = false;
        }
        if (tile.justMerged) {
          el.classList.add('is-merged');
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

// アニメ終了でクラス除去（次回に備える）
const handleAnimEnd = (tileId: number, e: AnimationEvent) => {
  if (e.animationName === 'pop-in' || e.animationName === 'merge-bounce') {
    const el = bodyRefs.get(tileId);
    if (!el) return;
    el.classList.remove('is-new', 'is-merged');
  }
};

// タッチ
const touchStartX = ref(0),
  touchStartY = ref(0);
const handleTouchStart = (e: TouchEvent) => {
  const t = e.touches[0];
  if (!t) return;
  touchStartX.value = t.clientX;
  touchStartY.value = t.clientY;
};
const handleTouchEnd = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - touchStartX.value,
    dy = t.clientY - touchStartY.value;
  const min = 30;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > min) emit('move', dx > 0 ? 'right' : 'left');
  } else {
    if (Math.abs(dy) > min) emit('move', dy > 0 ? 'down' : 'up');
  }
};
</script>

<template>
  <div
    ref="gridRef"
    class="relative bg-[#bbada0] rounded-lg p-2 w-full max-w-md aspect-square overflow-hidden"
    :style="{ touchAction: 'none' }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
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
        :ref="(el) => setTileRef(el, tile)"
        class="tile-translate absolute rounded-lg"
        :style="getTranslateStyle(tile)"
      >
        <div
          :ref="(el) => setBodyRef(el, tile)"
          class="tile-scale flex h-full w-full items-center justify-center font-bold rounded-lg transition-transform duration-150 ease-in-out"
          :class="[getTileColor(tile.value), getTileTextColor(tile.value)]"
          @animationend="(e) => handleAnimEnd(tile.id, e)"
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
