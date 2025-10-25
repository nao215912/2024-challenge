import { describe, expect, it } from 'vitest';

import { GameEngine } from '../engine';
import { createDeterministicRandom } from './test-helpers';

describe('GameEngine 左方向の移動', () => {
  it('結合してスコアを加算し新しいタイルを生成する', () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0]) });
    engine.setGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const result = engine.move('left');

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(engine.score).toBe(4);
    expect(result.addedTile?.value).toBe(2);
    expect(engine.getGridValues()[0]).toEqual([4, 2, 0, 0]);
    expect(engine.tiles.some((tile) => tile.pendingRemoval)).toBe(true);

    engine.cleanupMergedTiles();
    expect(engine.tiles.every((tile) => !tile.pendingRemoval)).toBe(true);
  });

  it('同一方向の移動で 1 回のみ結合する', () => {
    const engine = new GameEngine({ random: createDeterministicRandom([0, 0]) });
    engine.setGrid([
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    engine.move('left');
    engine.cleanupMergedTiles();

    expect(engine.score).toBe(4);
    expect(engine.getGridValues()[0]).toEqual([4, 2, 2, 0]);
  });

  it('結合後のタイルはクリーンアップ前に復活しない', () => {
    const engine = new GameEngine({
      random: createDeterministicRandom([0, 0, 0, 0]),
    });
    engine.setGrid([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    engine.move('left');
    const pendingIds = engine.tiles.filter((tile) => tile.pendingRemoval).map((tile) => tile.id);
    expect(pendingIds).toHaveLength(1);

    engine.move('left');

    const pendingAfterSecondMove = engine.tiles
      .filter((tile) => tile.pendingRemoval)
      .map((tile) => tile.id);

    expect(pendingAfterSecondMove).toContain(pendingIds[0]);
    expect(
      engine.tiles.some((tile) => tile.id === pendingIds[0] && tile.pendingRemoval === false)
    ).toBe(false);
  });

  it('後続の移動でもグリッド状態が失われない', () => {
    const engine = new GameEngine({
      random: createDeterministicRandom([0, 0, 0, 0]),
    });
    engine.setGrid([
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    engine.move('left');
    // 結合後、新しいタイル(値2)が追加される
    expect(engine.getGridValues()[0]).toEqual([4, 4, 2, 0]);

    engine.move('right');
    // 右に移動すると、4+4=8、2は右端へ、さらに新しいタイルが追加される
    expect(engine.getGridValues()[0]).toEqual([2, 0, 8, 2]);
  });
});
