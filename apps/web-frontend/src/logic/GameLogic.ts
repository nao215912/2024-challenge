// src/logic/GameLogic.ts

export type Direction = "left" | "right" | "up" | "down";

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew: boolean;
  isMerged: boolean;
}

let uid = 0;

function createTile(
  value: number,
  row: number,
  col: number,
  opts?: Partial<Pick<Tile, "isNew" | "isMerged">>
): Tile {
  return {
    id: uid++,
    value,
    row,
    col,
    isNew: opts?.isNew ?? false,
    isMerged: opts?.isMerged ?? false,
  };
}

export class GameLogic {
  size: number;
  tiles: Tile[] = [];
  score = 0;

  constructor(size = 4) {
    this.size = size;
    this.reset();
  }

  reset() {
    this.tiles = [];
    this.score = 0;
    this.addRandomTile();
    this.addRandomTile();
  }

  private randomEmptyCell(): { row: number; col: number } | null {
    const occupied = new Set(
      this.tiles.map((t) => `${t.row},${t.col}`)
    );
    const empties: { row: number; col: number }[] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const key = `${r},${c}`;
        if (!occupied.has(key)) {
          empties.push({ row: r, col: c });
        }
      }
    }
    if (!empties.length) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }

  private addRandomTile() {
    const cell = this.randomEmptyCell();
    if (!cell) return;
    const value = Math.random() < 0.9 ? 2 : 4;
    this.tiles.push(
      createTile(value, cell.row, cell.col, { isNew: true })
    );
  }

  move(direction: Direction) {
    // フラグリセット
    this.tiles.forEach((t) => {
      t.isNew = false;
      t.isMerged = false;
    });

    const beforeSnapshot = this.snapshot();

    if (direction === "left") this.moveLeft();
    if (direction === "right") this.moveRight();
    if (direction === "up") this.moveUp();
    if (direction === "down") this.moveDown();

    const afterSnapshot = this.snapshot();

    // 盤面に変化がなければタイル追加しない
    if (!this.hasChanged(beforeSnapshot, afterSnapshot)) {
      return;
    }

    this.addRandomTile();
  }

  private snapshot() {
    return this.tiles
      .map((t) => ({ row: t.row, col: t.col, value: t.value }))
      .sort((a, b) =>
        a.row === b.row
          ? a.col - b.col
          : a.row - b.row
      );
  }

  private hasChanged(
    before: { row: number; col: number; value: number }[],
    after: { row: number; col: number; value: number }[]
  ): boolean {
    if (before.length !== after.length) return true;
    for (let i = 0; i < before.length; i++) {
      const b = before[i];
      const a = after[i];
      if (
        b.row !== a.row ||
        b.col !== a.col ||
        b.value !== a.value
      ) {
        return true;
      }
    }
    return false;
  }

  private moveLeft() {
    for (let r = 0; r < this.size; r++) {
      this.compactRowLeft(r);
    }
  }

  private moveRight() {
    for (let r = 0; r < this.size; r++) {
      this.compactRowRight(r);
    }
  }

  private moveUp() {
    for (let c = 0; c < this.size; c++) {
      this.compactColUp(c);
    }
  }

  private moveDown() {
    for (let c = 0; c < this.size; c++) {
      this.compactColDown(c);
    }
  }

  private compactRowLeft(row: number) {
    const rowTiles = this.tiles
      .filter((t) => t.row === row)
      .sort((a, b) => a.col - b.col);

    let targetCol = 0;
    let i = 0;

    while (i < rowTiles.length) {
      const current = rowTiles[i];
      if (
        i + 1 < rowTiles.length &&
        rowTiles[i + 1].value === current.value
      ) {
        const next = rowTiles[i + 1];
        // merge
        current.col = targetCol;
        current.value *= 2;
        current.isMerged = true;
        this.score += current.value;

        // next タイル削除
        this.tiles = this.tiles.filter((t) => t !== next);

        i += 2;
      } else {
        current.col = targetCol;
        current.isMerged = false;
        i += 1;
      }
      current.row = row;
      targetCol++;
    }
  }

  private compactRowRight(row: number) {
    const rowTiles = this.tiles
      .filter((t) => t.row === row)
      .sort((a, b) => b.col - a.col);

    let targetCol = this.size - 1;
    let i = 0;

    while (i < rowTiles.length) {
      const current = rowTiles[i];
      if (
        i + 1 < rowTiles.length &&
        rowTiles[i + 1].value === current.value
      ) {
        const next = rowTiles[i + 1];
        current.col = targetCol;
        current.value *= 2;
        current.isMerged = true;
        this.score += current.value;

        this.tiles = this.tiles.filter((t) => t !== next);

        i += 2;
      } else {
        current.col = targetCol;
        current.isMerged = false;
        i += 1;
      }
      current.row = row;
      targetCol--;
    }
  }

  private compactColUp(col: number) {
    const colTiles = this.tiles
      .filter((t) => t.col === col)
      .sort((a, b) => a.row - b.row);

    let targetRow = 0;
    let i = 0;

    while (i < colTiles.length) {
      const current = colTiles[i];
      if (
        i + 1 < colTiles.length &&
        colTiles[i + 1].value === current.value
      ) {
        const next = colTiles[i + 1];
        current.row = targetRow;
        current.value *= 2;
        current.isMerged = true;
        this.score += current.value;

        this.tiles = this.tiles.filter((t) => t !== next);

        i += 2;
      } else {
        current.row = targetRow;
        current.isMerged = false;
        i += 1;
      }
      current.col = col;
      targetRow++;
    }
  }

  private compactColDown(col: number) {
    const colTiles = this.tiles
      .filter((t) => t.col === col)
      .sort((a, b) => b.row - a.row);

    let targetRow = this.size - 1;
    let i = 0;

    while (i < colTiles.length) {
      const current = colTiles[i];
      if (
        i + 1 < colTiles.length &&
        colTiles[i + 1].value === current.value
      ) {
        const next = colTiles[i + 1];
        current.row = targetRow;
        current.value *= 2;
        current.isMerged = true;
        this.score += current.value;

        this.tiles = this.tiles.filter((t) => t !== next);

        i += 2;
      } else {
        current.row = targetRow;
        current.isMerged = false;
        i += 1;
      }
      current.col = col;
      targetRow--;
    }
  }
}
