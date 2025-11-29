<template>
  <div
    class="tile"
    :class="[valueClass, { 'is-new': tile.isNew, 'is-merged': tile.isMerged }]"
    :style="tileStyle"
  >
    <span v-if="tile.value">{{ tile.value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Tile } from "@/logic/GameLogic";

const props = defineProps<{
  tile: Tile;
}>();

// 位置 → transform へ変換（絶対配置）
const tileStyle = computed(() => {
  const size = 80;
  const gap = 10;
  const x = props.tile.col * (size + gap) + gap;
  const y = props.tile.row * (size + gap) + gap;
  return {
    transform: `translate(${x}px, ${y}px)`,
  };
});

const valueClass = computed(() =>
  props.tile.value ? `n${props.tile.value}` : "empty"
);
</script>

<style scoped>
.tile {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 28px;
  color: #776e65;
  transition: transform 120ms ease-in-out;
}

/* 値なしは透明にしておいてもOKだが、今回はタイルは必ず値持ち */
.empty {
  opacity: 0;
}

/* アニメーション */
.is-new {
  animation: pop 200ms ease-out;
}

.is-merged {
  animation: merge 200ms ease-out;
}

@keyframes pop {
  0% {
    transform: scale(0) translate(var(--x, 0), var(--y, 0));
  }
  80% {
    transform: scale(1.1) translate(var(--x, 0), var(--y, 0));
  }
  100% {
    transform: scale(1) translate(var(--x, 0), var(--y, 0));
  }
}

@keyframes merge {
  0% {
    transform: scale(1) translate(var(--x, 0), var(--y, 0));
  }
  50% {
    transform: scale(1.2) translate(var(--x, 0), var(--y, 0));
  }
  100% {
    transform: scale(1) translate(var(--x, 0), var(--y, 0));
  }
}

/* 色設定 */
.n2 {
  background: #eee4da;
}
.n4 {
  background: #ede0c8;
}
.n8 {
  background: #f2b179;
  color: #f9f6f2;
}
.n16 {
  background: #f59563;
  color: #f9f6f2;
}
.n32 {
  background: #f67c5f;
  color: #f9f6f2;
}
.n64 {
  background: #f65e3b;
  color: #f9f6f2;
}
.n128 {
  background: #edcf72;
  color: #f9f6f2;
  font-size: 22px;
}
.n256 {
  background: #edcc61;
  color: #f9f6f2;
  font-size: 22px;
}
.n512 {
  background: #edc850;
  color: #f9f6f2;
  font-size: 22px;
}
.n1024 {
  background: #edc53f;
  color: #f9f6f2;
  font-size: 18px;
}
.n2048 {
  background: #edc22e;
  color: #f9f6f2;
  font-size: 18px;
}
</style>
