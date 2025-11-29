// src/store/gameStore.ts
import { defineStore } from "pinia";
import { GameLogic, type Direction, type Tile } from "../logic/GameLogic";

export const useGameStore = defineStore("game", {
  state: () => ({
    logic: new GameLogic(),
  }),

  getters: {
    tiles(state): Tile[] {
      return state.logic.tiles;
    },
    size(state): number {
      return state.logic.size;
    },
    score(state): number {
      return state.logic.score;
    },
  },

  actions: {
    move(direction: Direction) {
      this.logic.move(direction);
    },
    reset() {
      this.logic.reset();
    },
  },
});
