export function createDeterministicRandom(sequence: number[]): () => number {
  let index = 0;
  return () => {
    const fallback = sequence[sequence.length - 1] ?? 0;
    const value = sequence[index] ?? fallback;
    index += 1;
    return value;
  };
}
