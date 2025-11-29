<template>
  <div class="game">
    <ScoreBoard :score="score" @reset="onReset" />

    <div class="grid" ref="gridRef">
      <!-- 背景セル -->
      <div class="grid-background">
        <div
          v-for="n in size * size"
          :key="n"
          class="grid-cell"
        ></div>
      </div>

      <!-- タイル -->
      <Tile
        v-for="tile in tiles"
        :key="tile.id"
        :tile="tile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useSwipe } from "@vueuse/core";

import { useGameStore } from "@/stores/gameStore";
import Tile from "@/components/Tile.vue";
import ScoreBoard from "./ScoreBoard.vue";

const store = useGameStore();
const { tiles, size, score } = storeToRefs(store);

function doMove(dir: "left" | "right" | "up" | "down") {
  store.move(dir);
}

// キーボード操作
function handleKey(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") doMove("left");
  if (e.key === "ArrowRight") doMove("right");
  if (e.key === "ArrowUp") doMove("up");
  if (e.key === "ArrowDown") doMove("down");
}

onMounted(() => {
  window.addEventListener("keydown", handleKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKey);
});

// スワイプ操作（VueUse）
const gridRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!gridRef.value) return;
  useSwipe(gridRef, {
    threshold: 40,
    onSwipeEnd(_, direction) {
      if (direction === "left") doMove("left");
      if (direction === "right") doMove("right");
      if (direction === "up") doMove("up");
      if (direction === "down") doMove("down");
    },
  });
});

function onReset() {
  store.reset();
}
</script>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 4x4 + gap 10px + tile 80px => 80*4 + 10*5 = 370 */
.grid {
  position: relative;
  width: 370px;
  height: 370px;
  background: #bbada0;
  border-radius: 6px;
  margin-top: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

.grid-background {
  position: absolute;
  inset: 0;
  padding: 10px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 80px;
  gap: 10px;
}

.grid-cell {
  background: #cdc1b4;
  border-radius: 4px;
}
</style>
