import type { Position } from './position';
import type { Vector } from './direction';

import { Tile } from './tile';

export interface TraversalOrder {
  rows: number[];
  cols: number[];
}

export class GameGrid {
  private cells: (Tile | null)[][];

  constructor(public readonly size: number) {
    this.cells = GameGrid.createEmptyGrid(size);
  }

  reset(): void {
    this.cells = GameGrid.createEmptyGrid(this.size);
  }

  getValues(): number[][] {
    return this.cells.map((row) => row.map((tile) => (tile ? tile.value : 0)));
  }

  getCell(position: Position): Tile | null {
    const row = this.cells[position.row];
    if (!row) {
      return null;
    }
    return row[position.col] ?? null;
  }

  setCell(position: Position, tile: Tile | null): void {
    const row = this.cells[position.row];
    if (!row) {
      return;
    }
    row[position.col] = tile;
  }

  clearCell(position: Position): void {
    this.setCell(position, null);
  }

  moveTile(tile: Tile, position: Position): boolean {
    if (tile.row === position.row && tile.col === position.col) {
      return false;
    }
    const currentPosition = tile.position;
    this.clearCell(currentPosition);
    tile.storeCurrentAsPrevious();
    tile.moveTo(position);
    this.setCell(position, tile);
    return true;
  }

  mergeTiles(source: Tile, target: Tile): number {
    const sourcePosition = source.position;
    const targetPosition = target.position;
    this.clearCell(sourcePosition);

    source.storeCurrentAsPrevious();
    source.moveTo(targetPosition);
    source.markPendingRemoval();

    target.storeCurrentAsPrevious();
    const mergedValue = target.doubleValue();
    target.markMerged();
    this.setCell(targetPosition, target);

    return mergedValue;
  }

  availableCells(): Position[] {
    const cells: Position[] = [];
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        if (!this.getCell({ row, col })) {
          cells.push({ row, col });
        }
      }
    }
    return cells;
  }

  tileMatchesAvailable(): boolean {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.getCell({ row, col });
        if (!tile) {
          continue;
        }
        const neighbors: Vector[] = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];
        for (const vector of neighbors) {
          const neighborRow = row + vector.y;
          const neighborCol = col + vector.x;
          if (this.withinBounds(neighborRow, neighborCol)) {
            const neighbor = this.getCell({ row: neighborRow, col: neighborCol });
            if (neighbor && neighbor.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  findFarthestPosition(
    start: Position,
    vector: Vector
  ): { farthest: Position; next: Position | null } {
    let previous: Position = { row: start.row, col: start.col };
    let row = start.row + vector.y;
    let col = start.col + vector.x;

    while (this.withinBounds(row, col) && !this.getCell({ row, col })) {
      previous = { row, col };
      row += vector.y;
      col += vector.x;
    }

    const next = this.withinBounds(row, col) ? { row, col } : null;
    return { farthest: previous, next };
  }

  getTraversalOrder(vector: Vector): TraversalOrder {
    const rows = Array.from({ length: this.size }, (_, index) => index);
    const cols = Array.from({ length: this.size }, (_, index) => index);

    if (vector.y === 1) {
      rows.reverse();
    }
    if (vector.x === 1) {
      cols.reverse();
    }

    return { rows, cols };
  }

  withinBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  private static createEmptyGrid(size: number): (Tile | null)[][] {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  }
}
