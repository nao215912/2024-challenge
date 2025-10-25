export class ScoreKeeper {
  private currentScore = 0;
  private bestScore = 0;

  constructor(initialBestScore = 0) {
    this.bestScore = initialBestScore;
  }

  get score(): number {
    return this.currentScore;
  }

  get best(): number {
    return this.bestScore;
  }

  reset(): void {
    this.currentScore = 0;
  }

  addPoints(points: number): void {
    this.currentScore += points;
    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
    }
  }
}
