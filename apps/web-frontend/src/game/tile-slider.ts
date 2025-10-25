import type { Direction, Vector } from './direction';
import { getVector } from './direction';
import type { GameGrid } from './game-grid';
import type { Tile } from './tile';

export interface SlideResult {
  moved: boolean;
  scoreGained: number;
}

/**
 * 2048ゲームのタイルスライド処理を担当
 * 指定された方向にタイルをスライドさせ、マージ可能なタイルを結合する
 */
export class TileSlider {
  slide(grid: GameGrid, direction: Direction): SlideResult {
    const vector = getVector(direction);
    const traversals = grid.getTraversalOrder(vector);

    let moved = false;
    let scoreGained = 0;

    for (const row of traversals.rows) {
      for (const col of traversals.cols) {
        const tile = grid.getCell({ row, col });
        if (!tile) {
          continue;
        }

        const result = this.slideTile(grid, tile, vector);
        if (result.moved) {
          moved = true;
        }
        scoreGained += result.scoreGained;
      }
    }

    return { moved, scoreGained };
  }

  private slideTile(grid: GameGrid, tile: Tile, vector: Vector): SlideResult {
    const positions = grid.findFarthestPosition(tile.position, vector);
    const next = positions.next;
    const nextTile = next ? grid.getCell(next) : null;

    // マージ可能な場合
    if (next && nextTile && nextTile.value === tile.value && !nextTile.mergedThisTurn) {
      const mergedValue = grid.mergeTiles(tile, nextTile);
      return { moved: true, scoreGained: mergedValue };
    }

    // 移動のみ
    const tileMoved = grid.moveTile(tile, positions.farthest);
    return { moved: tileMoved, scoreGained: 0 };
  }
}
