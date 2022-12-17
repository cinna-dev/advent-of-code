import executeWithPrompt from "../lib/executeWithPrompt";

// --- Day 3: Rucksack Reorganization ---
// One Elf has the important job of loading all of the rucksacks with supplies for the jungle journey.
// Unfortunately, that Elf didn't quite follow the packing instructions,
// and so a few items now need to be rearranged.
//
// Each rucksack has two large compartments.
// All items of a given type are meant to go into exactly one of the two compartments.
// The Elf that did the packing failed to follow this rule for exactly one item type per rucksack.
//
//   The Elves have made a list of all of the items currently in each rucksack (your puzzle input),
//   but they need your help finding the errors.
//   Every item type is identified by a single lowercase or uppercase letter
//   (that is, a and A refer to different types of items).
//
// The list of items for each rucksack is given as characters all on a single line.
// A given rucksack always has the same number of items in each of its two compartments,
// so the first half of the characters represent items in the first compartment,
// while the second half of the characters represent items in the second compartment.
//
//   For example, suppose you have the following list of contents from six rucksacks:
//
// vJrwpWtwJgWrhcsFMMfFFhFp
// jqHRNqRjqzjGDLGLrsFMfFZSrLrFZsSL
// PmmdzqPrVvPwwTWBwg
// wMqvLMZHhHMvwLHjbvcjnnSBnvTQFn
// ttgJtRGJQctTZtZT
// CrZsJsPPZsGzwwsLwLmpwMDw

// - The first rucksack contains the items vJrwpWtwJgWrhcsFMMfFFhFp,
// which means its first compartment contains the items vJrwpWtwJgWr,
// while the second compartment contains the items hcsFMMfFFhFp.
// The only item type that appears in both compartments is lowercase p.
// - The second rucksack's compartments contain jqHRNqRjqzjGDLGL and rsFMfFZSrLrFZsSL.
// The only item type that appears in both compartments is uppercase L.
// - The third rucksack's compartments contain PmmdzqPrV and vPwwTWBwg;
// the only common item type is uppercase P.
// - The fourth rucksack's compartments only share item type v.
// - The fifth rucksack's compartments only share item type t.
// - The sixth rucksack's compartments only share item type s.

// To help prioritize item rearrangement, every item type can be converted to a priority:
//
// - Lowercase item types a through z have priorities 1 through 26.
// - Uppercase item types A through Z have priorities 27 through 52.

// In the above example, the priority of the item type that appears in both compartments of each rucksack
// is 16 (p), // 38 (L), 42 (P), 22 (v), 20 (t), and 19 (s); the sum of these is 157.
//
// Find the item type that appears in both compartments of each rucksack.
// What is the sum of the priorities of those item types?

// ---------------------------------------------------------------------------------------------------------------------

interface Sumable {
  sum: number

  sumItems(): void
}

export class RucksackOrganizer implements Sumable {
  private _rucksacks: Rucksack[] = [];

  constructor(private items: string) {
    this.organize();
  }

  private _sum = 0;

  get sum(): number {
    return this._sum;
  }

  static getPriority(item: string): number {
    return item === item.toUpperCase()
      ? item.charCodeAt(0) - 38
      : item.charCodeAt(0) - 96;
  }

  sumItems() {
    for (const rucksack of this._rucksacks) {
      rucksack.sumItems();
      this._sum += rucksack.sum;
    }
  }

  private organize(): void {
    this._rucksacks =
      this.items
        .trim()
        .split('\n')
        .reduce<Rucksack[]>((acc, item) =>
          [
            ...acc,
            new Rucksack([
              item.substring(0, item.length * 0.5),
              item.substring(item.length * 0.5, item.length)
            ])
          ], []);
  }
}

class Rucksack implements Sumable {
  constructor(
    private _compartments: [string, string]
  ) {
  }

  private _sum = 0;

  get sum(): number {
    return this._sum;
  }

  sumItems() {
    let [compartment1, compartment2] = this._compartments;
    let newCompartment1 = compartment1

    for (const char of compartment1.split('')) {
      if (compartment2.includes(char)) {
        // remove all occurrences of item in 2nd compartment
        compartment2 = compartment2
          .split('')
          .filter(item => item !== char)
          .join('');
        // add item to 1st compartment
        newCompartment1 += char;
        this._sum += RucksackOrganizer.getPriority(char);
      }
    }
    this._compartments = [newCompartment1, compartment2];
  }
}


executeWithPrompt(__dirname, (items) => {
  const rucksackOrganizer = new RucksackOrganizer(items);
  rucksackOrganizer.sumItems();
  const result = rucksackOrganizer.sum;
  console.log(result);
});
