import executeWithPrompt from "../lib/executeWithPrompt";


const R = require('ramda');
const chalk = require('chalk');

// --- Day 8: Treetop Tree House ---
//
// The expedition comes across a peculiar patch of tall trees all planted carefully in a grid.
// The Elves explain that a previous expedition planted these trees as a reforestation effort.
// Now, they're curious if this would be a good location for a tree house.
//
// First, determine whether there is enough tree cover here to keep a tree house hidden.
// To do this, you need to count the number of trees
// that are visible from outside the grid when looking directly along a row or column.
//
// The Elves have already launched a quadcopter to generate a map with the height of each tree (your puzzle input).
// For example:
//
//   30373
//   25512
//   65332
//   33549
//   35390
//
//,Each tree is represented as a single digit whose value is its height,
// where 0 is the shortest and 9 is the tallest.
//
//   A tree is visible if all the other trees between it and an edge of the grid are shorter than it.
//   Only consider trees in the same row or column; that is, only look up, down, left, or right from any given tree.
//
//   All the trees around the edge of the grid are visible - since they are already on the edge,
//   there are no trees to block the view. In this example, that only leaves the interior nine trees to consider:
//
// - The top-left 5 is visible from the left and top.
//   (It isn't visible from the right or bottom since other trees of height 5 are in the way.)
// - The top-middle 5 is visible from the top and right.
// - The top-right 1 is not visible from any direction; for it to be visible,
//   there would need to only be trees of height 0 between it and an edge.
// - The left-middle 5 is visible, but only from the right.
// - The center 3 is not visible from any direction; for it to be visible,
//   there would need to be only trees of at most height 2 between it and an edge.
// - The right-middle 3 is visible from the right.
// -  In the bottom row, the middle 5 is visible, but the 3 and 4 are not.
//   With 16 trees visible on the edge and another 5 visible in the interior,
//   a total of 21 trees are visible in this arrangement.
//
//   Consider your map; how many trees are visible from outside the grid?
//
// Your puzzle answer was 1796.
//
// The first half of this puzzle is complete! It provides one gold star: *
//
// --- Part Two ---
//
// Content with the amount of tree cover available,
// the Elves just need to know the best spot to build their tree house:
// they would like to be able to see a lot of trees.
//
// To measure the viewing distance from a given tree, look up, down, left, and right from that tree;
// stop if you reach an edge or at the first tree that is the same height or taller than the tree under consideration.
// (If a tree is right on the edge, at least one of its viewing distances will be zero.)
//
// The Elves don't care about distant trees taller than those found by the rules above;
// the proposed tree house has large eaves to keep it dry,
// so they wouldn't be able to see higher than the tree house anyway.
//
// In the example above, consider the middle 5 in the second row:
//
// 30373
// 25512
// 65332
// 33549
// 35390
//
// - Looking up, its view is not blocked; it can see 1 tree (of height 3).
// - Looking left, its view is blocked immediately; it can see only 1 tree (of height 5, right next to it).
// - Looking right, its view is not blocked; it can see 2 trees.
// - Looking down, its view is blocked eventually; it can see 2 trees
//   (one of height 3, then the tree of height 5 that blocks its view).
// - A tree's scenic score is found by multiplying together its viewing distance in each of the four directions.
//   For this tree, this is 4 (found by multiplying 1 * 1 * 2 * 2).
//
// However, you can do even better: consider the tree of height 5 in the middle of the fourth row:
//
// 30373
// 25512
// 65332
// 33549
// 35390
//
// - Looking up, its view is blocked at 2 trees (by another tree with a height of 5).
// - Looking left, its view is not blocked; it can see 2 trees.
// - Looking down, its view is also not blocked; it can see 1 tree.
// - Looking right, its view is blocked at 2 trees (by a massive tree of height 9).
// - This tree's scenic score is 8 (2 * 2 * 1 * 2); this is the ideal spot for the tree house.
//
// Consider each tree on your map. What is the highest scenic score possible for any tree?

/** [x, y] */
type Coordinates = [number, number]

const Utils = {
  padNum(num: number, length: number): string {
    return String(num).padStart(length, '0');
  },
  padNumWhitespace(num: number, length: number): string {
    return String(num).padStart(length, ' ');
  }
};

class Tree {
  constructor(
    private _size: number,
    private _coordinates: Coordinates,
  ) {}

  get size(): number {
    return this._size;
  }

  get coordinates(): Coordinates {
    return this._coordinates;
  }

}

type SizeGrid = number[][]

class TreeGrid {
  private _grid: Tree[][] = [];

  constructor(private _sizeGrid: SizeGrid) {
    this._plantTrees();
  }

  get visibleTrees(): Tree[] {
    return this._grid.reduce((acc, row) =>
        [...acc, ...row.filter(tree => this.hasAnyVisibility(tree))]
      , []);
  }

  get visibleTreesMap() {
    return chalk.red(this._grid.map(row =>
        row.map(tree => this.hasAnyVisibility(tree) ? chalk.green(tree.size) : chalk.red(tree.size)).join('')
      ).join('\n')
    );
  }

  get viewDistanceTreesMap() {
    return chalk.greenBright(this._grid.map(row =>
        row.map(tree => this.getViewDistanceScore(tree)).join(' ')
      ).join('\n')
    );
  }

  get viewDistanceTrees(): string[][] {
    return this._grid.map(row =>
      row.map(tree => this.getViewDistanceScore(tree))
    );
  }

  get highestScenicScore(): number {
    return this.viewDistanceTrees.flat().reduce((acc, sceneScore) =>
      Number(sceneScore) > acc ? Number(sceneScore) : acc, 0);
  }

  getTree(coordinates: Coordinates): Tree | undefined {
    const [x, y] = coordinates;
    return this._grid[y]?.[x];
  }

  hasNeighbor(tree: Tree, direction: 'top' | 'bottom' | 'left' | 'right'): boolean {
    let [x, y] = tree.coordinates;
    switch (direction) {
      case 'top': {
        return !!this.getTree([x, y - 1])?.size;
      }
      case 'bottom': {
        return !!this.getTree([x, y + 1])?.size;
      }
      case 'left': {
        return !!this.getTree([x - 1, y])?.size;
      }
      case 'right': {
        return !!this.getTree([x + 1, y])?.size;
      }
      default:
        return false;
    }
  }

  isNeighborVisible(tree: Tree, direction: 'top' | 'bottom' | 'left' | 'right'): boolean {
    let [x, y] = tree.coordinates;
    switch (direction) {
      case 'top': {
        return (
          this.getTree([x, y - 1])?.size ?? -1
        ) < tree.size;
      }
      case 'bottom': {
        return (
          this.getTree([x, y + 1])?.size ?? -1
        ) < tree.size;
      }
      case 'left': {
        return (
          this.getTree([x - 1, y])?.size ?? -1
        ) < tree.size;
      }
      case 'right': {
        return (
          this.getTree([x + 1, y])?.size ?? -1
        ) < tree.size;
      }
      default:
        return false;
    }
  }

  getNeighborTree(tree: Tree, direction: 'top' | 'bottom' | 'left' | 'right'): Tree | undefined {
    let [x, y] = tree.coordinates;
    switch (direction) {
      case 'top': {
        return this.getTree([x, y - 1]);
      }
      case 'bottom': {
        return this.getTree([x, y + 1]);
      }
      case 'left': {
        return this.getTree([x - 1, y]);
      }
      case 'right': {
        return this.getTree([x + 1, y]);
      }
      default:
        return undefined;
    }
  }

  isVisibleInDirection(tree: Tree, direction: 'top' | 'bottom' | 'left' | 'right') {
    let neighborTree: Tree | undefined = this.getNeighborTree(tree, direction);
    while (neighborTree) {
      const isVisible = tree.size > neighborTree.size;
      if (!isVisible) return false;
      neighborTree = this.getNeighborTree(neighborTree, direction);
    }
    return true;
  }

  getViewDistanceInDirection(tree: Tree, direction: 'top' | 'bottom' | 'left' | 'right') {
    let neighborTree: Tree | undefined = this.getNeighborTree(tree, direction);
    let index = 0;
    while (neighborTree) {
      const isVisible: boolean = tree.size > neighborTree.size;
      if (isVisible) index++;
      else return ++index;
      neighborTree = this.getNeighborTree(neighborTree, direction);
    }
    return index;
  }

  getViewDistances(tree: Tree): {
    top: number
    bottom: number
    left: number
    right: number
  } {
    return {
      top: this.getViewDistanceInDirection(tree, 'top'),
      bottom: this.getViewDistanceInDirection(tree, 'bottom'),
      left: this.getViewDistanceInDirection(tree, 'left'),
      right: this.getViewDistanceInDirection(tree, 'right')
    };
  }

  getViewDistanceScore(tree: Tree): string {
    const viewDistances = this.getViewDistances(tree);
    const { top, bottom, left, right } = viewDistances;
    return Utils.padNumWhitespace(top * bottom * left * right, 2);
  }

  getVisibility(tree: Tree): {
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
  } {
    return {
      top: this.isVisibleInDirection(tree, 'top'),
      bottom: this.isVisibleInDirection(tree, 'bottom'),
      left: this.isVisibleInDirection(tree, 'left'),
      right: this.isVisibleInDirection(tree, 'right')
    };
  }

  hasAnyVisibility(tree: Tree): boolean {
    const visibility = this.getVisibility(tree);
    let isVisible = false;
    for (const isDirectionVisible of Object.values(visibility)) {
      isVisible ||= isDirectionVisible;
    }
    return isVisible;
  }

  private _plantTrees() {
    this._grid = this._sizeGrid
      .map<Tree[]>((row, rowIndex) =>
        row.map<Tree>((size, index) =>
          new Tree(size, [index, rowIndex])
        )
      );
  }
}

// ---------------------------------------------------------------------------------------------------------------------

executeWithPrompt(__dirname, (text): void => {
  const grid = R.pipe(
    R.split('\n'),
    R.map(R.split('')),
  )(text);

  const treeGrid = new TreeGrid(grid);

  console.log(treeGrid.visibleTreesMap);
  console.log(treeGrid.viewDistanceTreesMap);
  console.log(treeGrid.highestScenicScore);
});
