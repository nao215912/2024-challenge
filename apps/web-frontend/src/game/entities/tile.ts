import { Position } from "../types/position";

export class Tile {
  previousRow: number | null = null;
  previousCol: number | null = null;
  isNew = false;
  justMerged = false;
  mergedThisTurn = false;
  pendingRemoval = false;

  constructor(
    public readonly id: number,
    public value: number,
    position: Position,
  ) {
    this.row = position.row;
    this.col = position.col;
  }

  row: number;
  col: number;

  get position(): Position {
    return { row: this.row, col: this.col };
  }

  markAsNew(): void {
    this.isNew = true;
  }

  prepareForTurn(): void {
    this.previousRow = this.row;
    this.previousCol = this.col;
    this.justMerged = false;
    this.mergedThisTurn = false;
    this.pendingRemoval = false;
    if (this.isNew) {
      this.isNew = false;
    }
  }

  storeCurrentAsPrevious(): void {
    this.previousRow = this.row;
    this.previousCol = this.col;
  }

  moveTo(position: Position): void {
    this.row = position.row;
    this.col = position.col;
  }

  markMerged(): void {
    this.justMerged = true;
    this.mergedThisTurn = true;
  }

  markPendingRemoval(): void {
    this.pendingRemoval = true;
  }

  doubleValue(): number {
    this.value *= 2;
    return this.value;
  }
}
