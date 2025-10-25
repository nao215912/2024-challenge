import { describe, expect, it } from "vitest";

import { GameEngine } from "../engine";
import { createDeterministicRandom } from "./test-helpers";

describe("GameEngine 初期化とリセット", () => {
  it("reset で 2 つの初期タイルを生成する", () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0.5, 0.45, 0.1]) });

    engine.reset();

    expect(engine.tiles).toHaveLength(2);
    const grid = engine.getGridValues();
    expect(grid[0][0]).toBe(2);
    expect(grid[1][3]).toBe(2);
    expect(engine.score).toBe(0);
    expect(engine.gameOver).toBe(false);
  });

  it("リセット時にスコアを初期化しベストスコアを保持する", () => {
    const engine = new GameEngine({
      bestScore: 0,
      random: createDeterministicRandom([0, 0.99, 0, 0.5, 0.45, 0.1]),
    });
    engine.setGrid([
      [64, 64, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    engine.move("left");
    expect(engine.score).toBe(128);
    expect(engine.bestScore).toBe(128);

    engine.reset();

    expect(engine.score).toBe(0);
    expect(engine.bestScore).toBe(128);
    expect(engine.tiles).toHaveLength(2);
    expect(engine.gameOver).toBe(false);
  });
});
