import executeWithPrompt from "../lib/executeWithPrompt";

// --- Day 5: Supply Stacks ---
// The expedition can depart as soon as the final supplies have been unloaded from the ships.
// Supplies are stored in stacks of marked crates,
// but because the needed supplies are buried under many other crates, the crates need to be rearranged.
//
//   The ship has a giant cargo crane capable of moving crates between stacks.
//   To ensure none of the crates get crushed or fall over,
//   the crane operator will rearrange them in a series of carefully-planned steps.
//   After the crates are rearranged, the desired crates will be at the top of each stack.
//
//   The Elves don't want to interrupt the crane operator during this delicate procedure,
//   but they forgot to ask her which crate will end up where,
//   and they want to be ready to unload them as soon as possible, so they can embark.
//
// They do, however, have a drawing of the starting stacks of crates
// and the rearrangement procedure (your puzzle input). For example:
//
//     [D]
// [N] [C]
// [Z] [M] [P]
//  1   2   3
//
// move 1 from 2 to 1
// move 3 from 1 to 3
// move 2 from 2 to 1
// move 1 from 1 to 2
//
// In this example, there are three stacks of crates.
// Stack 1 contains two crates: crate Z is on the bottom, and crate N is on top.
// Stack 2 contains three crates; from bottom to top, they are crates M, C, and D.
// Finally, stack 3 contains a single crate, P.
//
//   Then, the rearrangement procedure is given.
//   In each step of the procedure, a quantity of crates is moved from one stack to a different stack.
//   In the first step of the above rearrangement procedure,
//   one crate is moved from stack 2 to stack 1, resulting in this configuration:
//
// [D]
// [N] [C]
// [Z] [M] [P]
//  1   2   3
//
// In the second step, three crates are moved from stack 1 to stack 3.
// Crates are moved one at a time,
// so the first crate to be moved (D) ends up below the second and third crates:
//
//         [Z]
//         [N]
//     [C] [D]
//     [M] [P]
//  1   2   3
//
// Then, both crates are moved from stack 2 to stack 1. Again,
// because crates are moved one at a time, crate C ends up below crate M:
//
//         [Z]
//         [N]
// [M]     [D]
// [C]     [P]
//  1   2   3
//
// Finally, one crate is moved from stack 1 to stack 2:
//
//         [Z]
//         [N]
//         [D]
// [C] [M] [P]
//  1   2   3
//
// The Elves just need to know which crate will end up on top of each stack;
// in this example, the top crates are C in stack 1, M in stack 2, and Z in stack 3,
// so you should combine these together and give the Elves the message CMZ.
//
//   After the rearrangement procedure completes, what crate ends up on top of each stack?

// ---------------------------------------------------------------------------------------------------------------------

class Instruction {
  private readonly _count: number;
  private readonly _from: number;
  private readonly _to: number;

  static parse(text: string): Instruction {
    const config =
      text
        .match(/move (?<count>\d+) from (?<from>\d+) to (?<to>\d+)/)
        ?.groups
      ?? {};

    return new this(config);
  }

  constructor({ count = 0, from = 0, to = 0 }) {
    this._count = count;
    this._from = from;
    this._to = to;
  }

  get count(): number {
    return this._count;
  }

  get from(): number {
    return this._from;
  }

  get to(): number {
    return this._to;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class Crate {
  constructor(public id: string) {
  }

  toString(): string {
    return `[${this.id}]`;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class Supplies {
  static parse(strings: string[]): Supplies {
    const instance = new this();

    strings
      .map((row) =>
        row
          .match(/([\w+]|    )/g)
          ?.forEach((input, index) => {
            if (input !== '    ') {
              instance.addCrate(new Crate(input), index);
            }
          }));

    return instance;
  }

  private _crates: Crate[][] = [];

  get crates(): Crate[][] {
    return this._crates;
  }

  addCrate(crate: Crate, stack: number): void {
    if (this._crates[stack]) {
      this._crates[stack]?.push(crate);
    } else {
      this._crates[stack] = [crate];
    }
  }

  moveCrate(instruction: Instruction): void {
    const to = instruction.to - 1;
    const from = instruction.from - 1;
    const count = instruction.count;
    for (let i = 0; i < count; i++) {
      const crate: Crate | undefined = this._crates[from]?.pop();
      if (crate) {
        if (!this._crates[to]) {
          this._crates[to] = [];
        }
        this._crates[to].push(crate);
      }
    }
  }

  moveCrates(instructions: Instruction[]): void {
    for (const instruction of instructions) {
      this.moveCrate(instruction);
    }
  }

  toString() {
    return this._crates
      .map(stack => stack
        .toString()
        .replaceAll(',', ' ') + '\n'
      ).join('');
  }

  getLastCrateOfEachStack() {
    return this._crates
      .map(stack => stack.at(-1)?.id)
      .join('');
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class Parser {
  static parse(text: string) {
    const [suppliesText, instructionsText]: string[] = text.split('\n\n');

    let suppliesRows: string[] = suppliesText.split('\n');
    const indexes: string[] = suppliesRows.splice(suppliesRows.length - 1);
    const columnCount: number = Number(indexes[0].split(' ').at(-1) ?? 0);
    // fill in columns
    suppliesRows = suppliesRows.reduce<string[]>((acc, row) => {
      const items: string[] = [...row.match(/(\[\w]|    )/g) ?? []];
      const fillInColumns: number = columnCount - (items?.length ?? 0);
      if (fillInColumns > 0) {
        for (let i = 0; i < fillInColumns; i++) {
          items.push('    ');
        }
      }
      return [...acc, items.join('')];
    }, []).reverse();

    const supplies: Supplies = Supplies.parse(suppliesRows);

    const instructions: Instruction[] =
      instructionsText
        .split('\n')
        .map((instructionText) => Instruction.parse(instructionText));

    return { supplies, instructions };
  }
}

// ---------------------------------------------------------------------------------------------------------------------

executeWithPrompt(__dirname, (text): void => {
  const { instructions, supplies } = Parser.parse(text);
  console.log(supplies.toString());
  supplies.moveCrates(instructions);
  console.log(supplies.toString());
  console.log(supplies.getLastCrateOfEachStack())
});
