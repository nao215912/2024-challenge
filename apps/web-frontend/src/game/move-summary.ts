import { Tile } from './tile';

export interface MoveSummary {
  moved: boolean;
  scoreGained: number;
  addedTile: Tile | null;
}
