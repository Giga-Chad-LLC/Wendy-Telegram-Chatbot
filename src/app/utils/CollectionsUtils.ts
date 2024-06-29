
/**
 * Slices an array of messages [0..N-1] into 2 slices:
 * 1) [0..K)
 * 2) [K..N)
 *
 * Where K is the provided number `firstGroupSize`.
 *
 * @param items array to slice
 * @param firstGroupSize the size of the first group
 * @private
 */
export function sliceArrayInGroupsByK<T>({ items, firstGroupSize }: SplitParams<T>): SplitResult<T> {
  if (items.length < firstGroupSize) {
    return {
      firstGroup: items.slice(),
      secondGroup: [],
    };
  }
  else {
    return {
      firstGroup:  items.slice(0, firstGroupSize),
      secondGroup: items.slice(firstGroupSize),
    };
  }
}

type SplitParams<T> = {
  items: T[],
  firstGroupSize: number,
}

type SplitResult<T> = {
  firstGroup: T[],
  secondGroup: T[],
}
