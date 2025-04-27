// Proving that the typescript type system is Turing complete by implementing
// Rule 110: https://en.wikipedia.org/wiki/Rule_110

type Bit = 0 | 1;

/** Apply the rule to a trip of bits */
type Apply<A extends [Bit, Bit, Bit]> =
  A extends [1, 1, 1] ? 0 :
  A extends [1, 1, 0] ? 1 :
  A extends [1, 0, 1] ? 1 :
  A extends [1, 0, 0] ? 0 :
  A extends [0, 1, 1] ? 1 :
  A extends [0, 1, 0] ? 1 :
  A extends [0, 0, 1] ? 1 : 0;

/**
 * Helper function that iterates across a row. Rule 110 only grows to the left,
 * so this terminates with a single value. For rules that grow both ways, the
 * last line would be:
 * [Apply<Prev, Cur, 0>, Apply<Cur, 0, 0>]
 * but we see that [0, 0, 1] and [0, 0, 0] both generate 0
 */
type RowIterator<Prev extends Bit, Cur extends Bit, Rest extends Bit[]> =
  Rest extends [infer Head extends Bit, ...infer Tail extends Bit[]] ?
  [Apply<[Prev, Cur, Head]>, ...RowIterator<Cur, Head, Tail>] :
  [Apply<[Prev, Cur, 0]>]

/**
 * Takes a row and generates the next row
 */
type NextRow<A extends Bit[]> =
  A extends [infer B extends Bit, ...infer Tail extends Bit[]] ?
  [Apply<[0, 0, B]>, ...RowIterator<0, B, Tail>] :
  [];

/**
 * Iterates NextRow a given number of times
 */
type Iterate<Start extends Bit[], N extends number, Result extends Bit[][] = []> =
  Result["length"] extends N ?
  Result :
  Iterate<NextRow<Start>, N, [...Result, Start]>

type Test = Iterate<[1], 10>;

