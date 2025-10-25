export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vector {
  x: number;
  y: number;
}

export function getVector(direction: Direction): Vector {
  switch (direction) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}
