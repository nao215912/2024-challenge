import { describe, expect, it } from "vitest";

import { GameEngine } from "../engine";
import { createDeterministicRandom } from "./test-helpers";

describe("GameEngine 左方向の移動", () => {
  it("結合してスコアを加算し新しいタイルを生成する", () => {
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
    expect(result.addedTile?.value).toBe(2);
    expect(engine.getGridValues()[0]).toEqual([4, 2, 0, 0]);
    expect(engine.tiles.some((tile) => tile.pendingRemoval)).toBe(true);

    engine.cleanupMergedTiles();
    expect(engine.tiles.every((tile) => !tile.pendingRemoval)).toBe(true);
  });

  it("同一方向の移動で 1 回のみ結合する", () => {
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
});

