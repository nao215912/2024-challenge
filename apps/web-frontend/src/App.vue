<template>
  <div class="app">
    <h1 class="title">2048</h1>
    <GameBoard />
  </div>
</template>

<script setup lang="ts">
import GameBoard from "@/components/GameBoard.vue";
</script>

<style>
body {
  margin: 0;
  background: #faf8ef;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
}

.title {
  margin-bottom: 16px;
  color: #776e65;
}
</style>
