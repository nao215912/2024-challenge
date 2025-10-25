import { describe, expect, it } from 'vitest';

import { GameEngine } from '../engine';

describe('GameEngine ゲームオーバー判定', () => {
  it('移動できない場合にゲームオーバーになる', () => {
    const engine = new GameEngine();
    engine.setGrid([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);

    const result = engine.move('left');

    expect(result.moved).toBe(false);
    expect(engine.gameOver).toBe(true);
  });

  it('他の方向に移動可能な場合はゲームオーバーにならない', () => {
    const engine = new GameEngine();
    engine.setGrid([
      [2, 4, 8, 16],
      [2, 16, 8, 4],
      [32, 64, 32, 64],
      [128, 256, 128, 256],
    ]);

    const result = engine.move('left');

    expect(result.moved).toBe(false);
    expect(engine.gameOver).toBe(false);
    expect(engine.movesAvailable()).toBe(true);
  });
});
