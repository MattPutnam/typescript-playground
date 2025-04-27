// A demonstration of performing arithmetic in the type system.

// The type system narrows the type as far as it can:
let a = 3; // type of a is `number`
const b = 3; // typeof b is `3`

// This also applies to data structures and their fields:
const arr1 = [1, 2, 3]; // type of arr1 is `number[]`, since we could add to it via push
const arr2 = [1, 2, 3] as const; // typeof arr2 is `readonly [1, 2, 3]`
const length1 = arr1.length; // type of length1 is `number`
const length2 = arr2.length; // type of length2 is `3`

// We will use the fact that a readonly array's length is readable as a number
// at compile time to avoid having to implement Peano arithmetic or something similar

// Part 1: addition
// Plan:
//   - from a number N, generate an array of length N
//   - concatenate two arrays
//   - read off the length
// Concepts:
//   - If A is an array type, it can be spread
//   - Can pattern match array types to pluck elements

/** Gets the length of an array */
type Length<A extends any[]> = A["length"];

/** Pads an array to the given length */
type Pad<N extends number, A extends any[] = []> =
  Length<A> extends N ? A : Pad<N, [...A, 0]>;

/** Concatenates two arrays */
type Concat<A extends any[], B extends any[]> =
  B extends [infer Head, ...infer Tail] ? Concat<[...A, Head], Tail> : A;

/** Adds two numbers */
type Add<A extends number, B extends number> = Length<Concat<Pad<A>, Pad<B>>>;
type AddTest = Add<5, 17>; // type of AddTest is `22`

// Part 2: subtraction
// Plan:
//   - implement Pop to remove one element
//   - start from Pad<A>, pop B times
//   - read off length
//   - will not represent negative numbers; 2-4=0 in this system
// Concepts:
//   - counting iterations via a growing array
//   - helper type

/** Pops a single element from the end of an array */
type Pop<A extends any[]> = A extends [...infer Rest, any] ? Rest : [];

type SubHelper<A extends any[], B extends number, Counter extends any[]> =
  Length<Counter> extends B ? Length<A> : SubHelper<Pop<A>, B, [...Counter, 0]>;
/** Substracts two numbers */
type Subtract<A extends number, B extends number> = SubHelper<Pad<A>, B, []>;
type SubtractTest = Subtract<15, 8>; // type of SubtractTest is `7`;

// Part 3: multiplication
// Plan:
//   - for A * B, add A to itself B-1 times
// Concepts:
//   - to count to n-1, just start counter at 1
//   - typescript lacks type hints, so MulHelper trips resolving that the Add call
//     resolves to a number. Nevertheless Multiply works somehow.

type MulHelper<A extends number, B extends number, R extends number, Counter extends any[]> =
  // @ts-expect-error
  Length<Counter> extends B ? R : MulHelper<A, B, Add<A, R>, [...Counter, 0]>;
/** Multiplies two numbers */
type Multiply<A extends number, B extends number> =
  A extends 0 ? 0 :
  B extends 0 ? 0 :
  MulHelper<A, B, A, [0]>;
type MultiplyTest = Multiply<7, 13>; // type of MultiplyTest = 91

// Part 4: division
// Plan:
//   - don't have fraction type, so this will be integer division
//   - for A / B, see how many times we have to subtract B from A to get less than B
//      - if we hit B, add 1
//   - DivHelper also fails to resolve that Subtract results in a number

/** Less than */
type LT<A extends number, B extends number> = Subtract<B, A> extends 0 ? false : true;

type DivHelper<A extends number, B extends number, Counter extends any[]> =
  B extends A ? Length<[...Counter, 0]> :
  LT<A, B> extends true ? Length<Counter> :
  // @ts-expect-error
  DivHelper<Subtract<A, B>, B, [...Counter, 0]>;
/** Divides two numbers */
type Divide<A extends number, B extends number> = DivHelper<A, B, []>;
type DivideTest = Divide<21, 3>; // type of DivideTest is `7`
type DivideTest2 = Divide<20, 3>; // type of DivideTest2 is `6`

// Part 5: world's jankiest primality test
// Plan:
//   - special case up to 3
//   - special case even numbers
//   - trial division of odd numbers up to sqrt(n)

/** Tests if A divides B evenly */
type Divides<A extends number, B extends number> =
  B extends 0 ? false :
  A extends B ? true :
  // @ts-expect-error
  Divides<A, Subtract<B, A>>;
type DividesTest = Divides<3, 21>; // typeof DividesTest = true
type DividesTest2 = Divides<3, 22>; // typeof DividesTest2 = false

type IsEven<N extends number> = Divides<2, N>;
type IsEvenTest = IsEven<482>; // typeof IsEvenTest = true

type TrialDivision<N extends number, D extends number> =
  // if D > sqrt(N), we didn't find a divisor
  // @ts-expect-error
  LT<N, Multiply<D, D>> extends true ? true :
  // if D divides N, N is not prime
  Divides<D, N> extends true ? false :
  // recurse
  // @ts-expect-error
  TrialDivision<N, Add<D, 2>>;

type IsPrime<N extends number> =
  N extends 0 ? false :
  N extends 1 ? false :
  N extends 2 ? true :
  N extends 3 ? true :
  IsEven<N> extends true ? false :
  TrialDivision<N, 3>

type IsPrimeTest1 = IsPrime<7>; // true
type IsPrimeTest2 = IsPrime<91>; // false
type IsPrimeTest3 = IsPrime<257>; // true
