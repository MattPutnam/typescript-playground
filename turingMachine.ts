// Proving that the typescript type system is Turing complete by implementing
// a Turing machine

// type Bit = 0 | 1;

/**
 * Representation of the tape
 * `left` represents the state of the tape to the left of the head, so the
 * element closest to the tape is in the rightmost position. This is so that
 * the full tape can be read as [...left, head, ...right]
 */
type Tape = {
  left: Bit[];
  head: Bit;
  right: Bit[];
};

type EmptyTape = {
  left: [];
  head: 0;
  right: [];
}

/** Operation to write a bit and move to the left */
type WriteAndMoveLeft<T extends Tape, ToWrite extends Bit> =
  T["left"] extends [...infer Rest extends Bit[], infer Head extends Bit] ?
  {
    left: Rest,
    head: Head,
    right: [ToWrite, ...T["right"]]
  } :
  {
    left: [],
    head: 0,
    right: [ToWrite, ...T["right"]]
  };

/** Operation to write a bit and move to the right */
type WriteAndMoveRight<T extends Tape, ToWrite extends Bit> =
  T["right"] extends [infer Head extends Bit, ...infer Rest extends Bit[]] ?
  {
    left: [...T["left"], ToWrite],
    head: Head,
    right: Rest
  } :
  {
    left: [...T["left"], ToWrite],
    head: 0,
    right: []
  };

type Direction = "L" | "R";

/**
 * Representation of a state. States will be identified by their index in an
 * array of states. Each state is a function from bit value to:
 * [bit to write, direction to move, state index number to go to]
 * -1 will be the HALT state
 */
type State = {
  [b in Bit]: [Bit, Direction, number];
};

type HALT = -1;

/**
 * Representation of the Turing machine
 */
type TuringMachine<
  States extends State[],
  T extends Tape = EmptyTape,
  CurrentState extends number = 0
> =
  CurrentState extends HALT ? T :
  States[CurrentState][T["head"]] extends [
    infer ToWrite extends Bit,
    infer Dir extends Direction,
    infer NextState extends number
  ] ? TuringMachine<
    States,
    Dir extends "L" ? WriteAndMoveLeft<T, ToWrite> : WriteAndMoveRight<T, ToWrite>,
    NextState
  > : T;

// Proof via busy beavers:
// https://en.wikipedia.org/wiki/Busy_beaver

type A = 0;
type B = 1;
type C = 2;
type D = 3;

type BusyBeaver3_2 = [
  {
    0: [1, "R", B],
    1: [1, "R", HALT]
  },
  {
    0: [0, "R", C],
    1: [1, "R", B]
  },
  {
    0: [1, "L", C],
    1: [1, "L", A]
  }
]

type BusyBeaver3_2Test = TuringMachine<BusyBeaver3_2>
/*
type BusyBeaver3_2Test = {
    left: [1, 1, 1];
    head: 1;
    right: [1, 1];
}
*/

type BusyBeaver4_2 = [
  {
    0: [1, "R", B],
    1: [1, "L", B]
  },
  {
    0: [1, "L", A],
    1: [0, "L", C],
  },
  {
    0: [1, "R", HALT],
    1: [1, "L", D],
  },
  {
    0: [1, "R", D],
    1: [0, "R", A]
  }
];

type BusyBeaver4_2Test = TuringMachine<BusyBeaver4_2>;
/*
type BusyBeaver4_2Test = {
    left: [1];
    head: 0;
    right: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
}
*/
