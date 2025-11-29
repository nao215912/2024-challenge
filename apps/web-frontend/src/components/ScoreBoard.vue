<template>
  <div class="score-box">
    <div class="label">SCORE</div>
    <div class="value">{{ score }}</div>
    <button class="reset" @click="onReset">RESET</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
}>();

const emit = defineEmits<{
  (e: "reset"): void;
}>();

function onReset() {
  emit("reset");
}
</script>

<style scoped>
.score-box {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.label {
  font-size: 12px;
  color: #eee4da;
}
.value {
  background: #bbada0;
  padding: 6px 12px;
  border-radius: 4px;
  color: #f9f6f2;
  font-weight: bold;
  min-width: 60px;
  text-align: right;
}
.reset {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  background: #8f7a66;
  color: #f9f6f2;
  font-size: 12px;
}
.reset:hover {
  filter: brightness(1.1);
}
</style>
