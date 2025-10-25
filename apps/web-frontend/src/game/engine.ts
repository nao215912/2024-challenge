import { GameGrid } from './game-grid';
import { ScoreKeeper } from './score-keeper';
import { Tile } from './tile';
import { TileFactory } from './tile-factory';
import { TileSlider } from './tile-slider';
import type { Direction } from './direction';
import type { MoveSummary } from './/move-summary';
import type { Position } from './position';

const DEFAULT_SIZE = 4;

export class GameEngine {
  readonly size: number;
  tiles: Tile[] = [];
  gameOver = false;

  private readonly grid: GameGrid;
  private readonly randomFn: () => number;
  private readonly tileFactory = new TileFactory();
  private readonly scoreKeeper: ScoreKeeper;
  private readonly tileSlider = new TileSlider();

  constructor(options?: { size?: number; bestScore?: number; random?: () => number }) {
    this.size = options?.size ?? DEFAULT_SIZE;
    this.randomFn = options?.random ?? Math.random;
    this.grid = new GameGrid(this.size);
    this.scoreKeeper = new ScoreKeeper(options?.bestScore ?? 0);
  }

  get score(): number {
    return this.scoreKeeper.score;
  }

  get bestScore(): number {
    return this.scoreKeeper.best;
  }

  reset(): void {
    this.grid.reset();
    this.tiles = [];
    this.scoreKeeper.reset();
    this.gameOver = false;
    this.tileFactory.reset();
    this.addStartingTiles();
  }

  move(direction: Direction): MoveSummary {
    if (this.gameOver) {
      return { moved: false, scoreGained: 0, addedTile: null };
    }

    this.prepareTiles();

    const result = this.tileSlider.slide(this.grid, direction);

    let addedTile: Tile | null = null;
    if (result.moved) {
      this.scoreKeeper.addPoints(result.scoreGained);
      addedTile = this.addRandomTile();
      if (!this.movesAvailable()) {
        this.gameOver = true;
      }
    } else if (!this.movesAvailable()) {
      this.gameOver = true;
    }

    return { moved: result.moved, scoreGained: result.scoreGained, addedTile };
  }

  cleanupMergedTiles(): boolean {
    const originalLength = this.tiles.length;
    this.tiles = this.tiles.filter((tile) => !tile.pendingRemoval);
    return this.tiles.length !== originalLength;
  }

  addRandomTile(): Tile | null {
    const cells = this.grid.availableCells();
    if (cells.length === 0) {
      return null;
    }

    const cellIndex = Math.floor(this.randomFn() * cells.length);
    const position = cells[Math.min(cellIndex, cells.length - 1)] ?? cells[0];
    if (!position) {
      return null;
    }

    const value = this.randomFn() < 0.9 ? 2 : 4;
    const tile = this.createTile(value, position, { markAsNew: true });
    return tile;
  }

  movesAvailable(): boolean {
    return this.grid.availableCells().length > 0 || this.grid.tileMatchesAvailable();
  }

  getGridValues(): number[][] {
    return this.grid.getValues();
  }

  /**
   * テスト用: 任意のグリッドを読み込む
   */
  setGrid(values: number[][]): void {
    if (values.length !== this.size || values.some((row) => row.length !== this.size)) {
      throw new Error(`grid size must be ${this.size}x${this.size}`);
    }

    this.grid.reset();
    this.tiles = [];
    this.scoreKeeper.reset();
    this.gameOver = false;
    this.tileFactory.reset();

    for (let row = 0; row < this.size; row += 1) {
      const rowValues = values[row] ?? [];
      for (let col = 0; col < this.size; col += 1) {
        const value = rowValues[col] ?? 0;
        if (value > 0) {
          this.createTile(value, { row, col });
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
      tile.prepareForTurn();
    }
  }

  private createTile(value: number, position: Position, options?: { markAsNew?: boolean }): Tile {
    const tile = this.tileFactory.create(value, position);
    if (options?.markAsNew) {
      tile.markAsNew();
    }
    this.grid.setCell(position, tile);
    this.tiles.push(tile);
    return tile;
  }
}
