import { describe, expect, it } from "vitest";

import { GameEngine } from "./engine";

function createDeterministicRandom(sequence: number[]): () => number {
  let index = 0;
  return () => {
    const fallback = sequence[sequence.length - 1] ?? 0;
    const value = sequence[index] ?? fallback;
    index += 1;
    return value;
  };
}

describe("GameEngine", () => {
  it("左方向への移動で結合しスコアを加算する", () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0]) });
    engine.setGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const result = engine.move("left");

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(engine.score).toBe(4);
    // 結合後のマスに 4、空きマスの最初に新しい 2 が配置される
    expect(engine.getGridValues()[0]).toEqual([4, 2, 0, 0]);
    expect(engine.tiles.some((tile) => tile.pendingRemoval)).toBe(true);

    engine.cleanupMergedTiles();
    expect(engine.tiles.every((tile) => !tile.pendingRemoval)).toBe(true);
  });

  it("同一方向で 2 回以上結合しない", () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0]) });
    engine.setGrid([
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    engine.move("left");
    engine.cleanupMergedTiles();

    expect(engine.score).toBe(4);
    expect(engine.getGridValues()[0]).toEqual([4, 2, 2, 0]);
  });

  it("移動できない場合はゲームオーバーになる", () => {
    const engine = new GameEngine();
    engine.setGrid([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);

    const result = engine.move("left");

    expect(result.moved).toBe(false);
    expect(engine.gameOver).toBe(true);
  });
});
