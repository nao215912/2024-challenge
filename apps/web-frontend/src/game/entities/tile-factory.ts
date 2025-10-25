import { Position } from '../types/position';

import { Tile } from './tile';

export class TileFactory {
  private nextId = 0;

  create(value: number, position: Position): Tile {
    const tile = new Tile(this.nextId, value, position);
    this.nextId += 1;
    return tile;
  }

  reset(): void {
    this.nextId = 0;
  }
}
