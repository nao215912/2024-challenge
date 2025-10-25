import { describe, expect, it } from "vitest";

import { GameEngine } from "../engine";
import { createDeterministicRandom } from "./test-helpers";

describe("GameEngine 右方向の移動", () => {
  it("結合後にスコアを加算し 4 のタイルを生成できる", () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0.99]) });
    engine.setGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const result = engine.move("right");

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(engine.score).toBe(4);
    expect(result.addedTile).not.toBeNull();
    expect(result.addedTile?.value).toBe(4);
    expect(result.addedTile?.row).toBe(0);
    expect(result.addedTile?.col).toBe(0);
    expect(engine.getGridValues()[0]).toEqual([4, 0, 0, 4]);
  });

  it("移動のみで結合が発生しないケースを処理する", () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0]) });
    engine.setGrid([
      [2, 0, 0, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const result = engine.move("right");

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(0);
    expect(engine.score).toBe(0);
    const grid = engine.getGridValues();
    expect(grid[0][2]).toBe(2);
    expect(grid[0][3]).toBe(4);
    expect(grid.flat().filter((value) => value > 0)).toHaveLength(3);
  });
});
