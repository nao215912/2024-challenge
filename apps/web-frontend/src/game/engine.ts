export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  row: number;
  col: number;
}

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  previousRow: number | null;
  previousCol: number | null;
  isNew: boolean;
  justMerged: boolean;
  mergedThisTurn: boolean;
  pendingRemoval: boolean;
}

interface Vector {
  x: number;
  y: number;
}

interface Traversals {
  rows: number[];
  cols: number[];
}

export interface MoveSummary {
  moved: boolean;
  scoreGained: number;
  addedTile: Tile | null;
}

const DEFAULT_SIZE = 4;

export class GameEngine {
  readonly size: number;
  tiles: Tile[] = [];
  grid: (Tile | null)[][];
  score = 0;
  bestScore: number;
  nextId = 0;
  gameOver = false;
  private readonly randomFn: () => number;

  constructor(options?: { size?: number; bestScore?: number; random?: () => number }) {
    this.size = options?.size ?? DEFAULT_SIZE;
    this.bestScore = options?.bestScore ?? 0;
    this.randomFn = options?.random ?? Math.random;
    this.grid = createEmptyGrid(this.size);
  }

  reset(): void {
    this.grid = createEmptyGrid(this.size);
    this.tiles = [];
    this.score = 0;
    this.gameOver = false;
    this.nextId = 0;
    this.addStartingTiles();
  }

  move(direction: Direction): MoveSummary {
    if (this.gameOver) {
      return { moved: false, scoreGained: 0, addedTile: null };
    }

    this.prepareTiles();

    const vector = getVector(direction);
    const traversals = buildTraversals(this.size, vector);

    let moved = false;
    let scoreGained = 0;

    for (const row of traversals.rows) {
      for (const col of traversals.cols) {
        const tile = this.getCell({ row, col });
        if (!tile) {
          continue;
        }

        const positions = this.findFarthestPosition({ row, col }, vector);
        const next = positions.next;
        const nextTile = next ? this.getCell(next) : null;

        if (
          next &&
          nextTile &&
          nextTile.value === tile.value &&
          !nextTile.mergedThisTurn
        ) {
          const mergedValue = this.mergeTiles(tile, nextTile);
          scoreGained += mergedValue;
          moved = true;
        } else {
          this.moveTile(tile, positions.farthest);
          if (positions.farthest.row !== row || positions.farthest.col !== col) {
            moved = true;
          }
        }
      }
    }

    let addedTile: Tile | null = null;
    if (moved) {
      this.score += scoreGained;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
      }
      addedTile = this.addRandomTile();
      if (!this.movesAvailable()) {
        this.gameOver = true;
      }
    } else if (!this.movesAvailable()) {
      this.gameOver = true;
    }

    return { moved, scoreGained, addedTile };
  }

  cleanupMergedTiles(): boolean {
    const originalLength = this.tiles.length;
    this.tiles = this.tiles.filter((tile) => !tile.pendingRemoval);
    return this.tiles.length !== originalLength;
  }

  addRandomTile(): Tile | null {
    const cells = this.availableCells();
    if (cells.length === 0) {
      return null;
    }
    const cellIndex = Math.floor(this.randomFn() * cells.length);
    const cell = cells[Math.min(cellIndex, cells.length - 1)] ?? cells[0];
    if (!cell) {
      return null;
    }
    const value = this.randomFn() < 0.9 ? 2 : 4;
    const tile = this.createTile(value, cell.row, cell.col);
    tile.isNew = true;
    this.setCell(cell, tile);
    this.tiles.push(tile);
    return tile;
  }

  movesAvailable(): boolean {
    return this.availableCells().length > 0 || this.tileMatchesAvailable();
  }

  getGridValues(): number[][] {
    return this.grid.map((row) => row.map((tile) => (tile ? tile.value : 0)));
  }

  /**
   * テスト用: 任意のグリッドを読み込む
   */
  setGrid(values: number[][]): void {
    if (values.length !== this.size || values.some((row) => row.length !== this.size)) {
      throw new Error(`grid size must be ${this.size}x${this.size}`);
    }
    this.grid = createEmptyGrid(this.size);
    this.tiles = [];
    this.score = 0;
    this.gameOver = false;
    for (let row = 0; row < this.size; row += 1) {
      const rowValues = values[row] ?? [];
      for (let col = 0; col < this.size; col += 1) {
        const value = rowValues[col] ?? 0;
        if (value > 0) {
          const tile = this.createTile(value, row, col);
          tile.isNew = false;
          this.setCell({ row, col }, tile);
          this.tiles.push(tile);
        }
      }
    }
  }

  private addStartingTiles(): void {
    for (let i = 0; i < 2; i += 1) {
      this.addRandomTile();
    }
  }

  private prepareTiles(): void {
    for (const tile of this.tiles) {
      tile.previousRow = tile.row;
      tile.previousCol = tile.col;
      tile.justMerged = false;
      tile.mergedThisTurn = false;
      tile.pendingRemoval = false;
      if (tile.isNew) {
        tile.isNew = false;
      }
    }
  }

  private moveTile(tile: Tile, position: Position): void {
    if (tile.row === position.row && tile.col === position.col) {
      return;
    }
    this.setCell({ row: tile.row, col: tile.col }, null);
    tile.previousRow = tile.row;
    tile.previousCol = tile.col;
    tile.row = position.row;
    tile.col = position.col;
    this.setCell(position, tile);
  }

  private mergeTiles(source: Tile, target: Tile): number {
    this.setCell({ row: source.row, col: source.col }, null);
    source.previousRow = source.row;
    source.previousCol = source.col;
    source.row = target.row;
    source.col = target.col;
    source.pendingRemoval = true;
    target.previousRow = target.row;
    target.previousCol = target.col;
    target.value *= 2;
    target.justMerged = true;
    target.mergedThisTurn = true;
    this.setCell({ row: target.row, col: target.col }, target);
    return target.value;
  }

  private availableCells(): Position[] {
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

  private tileMatchesAvailable(): boolean {
    for (let row = 0; row < this.size; row += 1) {
      for (let col = 0; col < this.size; col += 1) {
        const tile = this.getCell({ row, col });
        if (!tile) {
          continue;
        }
        const vectors: Vector[] = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];
        for (const vector of vectors) {
          const rowNeighbor = row + vector.y;
          const colNeighbor = col + vector.x;
          if (this.withinBounds(rowNeighbor, colNeighbor)) {
            const neighbor = this.getCell({ row: rowNeighbor, col: colNeighbor });
            if (neighbor && neighbor.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private findFarthestPosition(start: Position, vector: Vector): { farthest: Position; next: Position | null } {
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

  private withinBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  private createTile(value: number, row: number, col: number): Tile {
    const tile: Tile = {
      id: this.nextId,
      value,
      row,
      col,
      previousRow: null,
      previousCol: null,
      isNew: false,
      justMerged: false,
      mergedThisTurn: false,
      pendingRemoval: false,
    };
    this.nextId += 1;
    return tile;
  }

  private getCell(position: Position): Tile | null {
    const row = this.grid[position.row];
    if (!row) {
      return null;
    }
    return row[position.col] ?? null;
  }

  private setCell(position: Position, tile: Tile | null): void {
    const row = this.grid[position.row];
    if (!row) {
      return;
    }
    row[position.col] = tile;
  }
}

function createEmptyGrid(size: number): (Tile | null)[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
}

function getVector(direction: Direction): Vector {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}

function buildTraversals(size: number, vector: Vector): Traversals {
  const rows = Array.from({ length: size }, (_, index) => index);
  const cols = Array.from({ length: size }, (_, index) => index);

  if (vector.y === 1) {
    rows.reverse();
  }
  if (vector.x === 1) {
    cols.reverse();
  }

  return { rows, cols };
}
