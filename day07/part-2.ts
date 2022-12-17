import executeWithPrompt from "../lib/executeWithPrompt";
import {inspect} from 'util'

// --- Day 7: No Space Left On Device ---
// You can hear birds chirping and raindrops hitting leaves as the expedition proceeds.
// Occasionally, you can even hear much louder sounds in the distance;
// how big do the animals get out here, anyway?
//
//   The device the Elves gave you has problems with more than just its communication system.
//   You try to run a system update:
//
//   $ system-update --please --pretty-please-with-sugar-on-top
//   Error: No space left on device
//
// Perhaps you can delete some files to make space for the update?
//
//   You browse around the filesystem to assess the situation and save the resulting terminal output
//   (your puzzle input). For example:
//
// ```
// $ cd /
// $ ls
// dir a
// 14848514 b.txt
// 8504156 c.dat
// dir d
// $ cd a
// $ ls
// dir e
// 29116 f
// 2557 g
// 62596 h.lst
// $ cd e
// $ ls
// 584 i
// $ cd ..
// $ cd ..
// $ cd d
// $ ls
// 4060174 j
// 8033020 d.log
// 5626152 d.ext
// 7214296 k
// ```
//
// The filesystem consists of a tree of files (plain data) and directories
// (which can contain other directories or files).
// The outermost directory is called `/`. You can navigate around the filesystem,
// moving into or out of directories and listing the contents of the directory you're currently in.
//
// Within the terminal output, lines that begin with $ are commands you executed,
// very much like some modern computers:
//
// - `cd` means change directory. This changes which directory is the current directory,
//   but the specific result depends on the argument:
//   - `cd x` moves in one level: it looks in the current directory
//     for the directory named `x` and makes it the current directory.
//     cd .. moves out one level: it finds the directory that contains the current directory,
//     then makes that directory the current directory.
//   - `cd /` switches the current directory to the outermost directory, `/`.
// - `ls` means list. It prints out all the files and directories immediately contained by the current directory:
//   - `123 abc` means that the current directory contains a file named `abc` with size `123`.
//   - `dir xyz` means that the current directory contains a directory named `xyz`.
//
//   Given the commands and output in the example above,
//   you can determine that the filesystem looks visually like this:
//
// - / (dir)
//   - a (dir)
//     - e (dir)
//       - i (file, size=584)
//     - f (file, size=29116)
//     - g (file, size=2557)
//     - h.lst (file, size=62596)
//   - b.txt (file, size=14848514)
//   - c.dat (file, size=8504156)
//   - d (dir)
//     - j (file, size=4060174)
//     - d.log (file, size=8033020)
//     - d.ext (file, size=5626152)
//     - k (file, size=7214296)
//
// Here, there are four directories: / (the outermost directory), a and d (which are in /),
// and e (which is in a). These directories also contain files of various sizes.
//
//   Since the disk is full,
//   your first step should probably be to find directories that are good candidates for deletion.
//   To do this, you need to determine the total size of each directory.
//   The total size of a directory is the sum of the sizes of the files it contains, directly or indirectly.
//   (Directories themselves do not count as having any intrinsic size.)
//
// The total sizes of the directories above can be found as follows:
//
// - The total size of directory e is 584 because it contains a single file i of size 584 and no other directories.
// - The directory a has total size 94853 because it contains files f (size 29116),
//   g (size 2557), and h.lst (size 62596), plus file i indirectly (a contains e which contains i).
// - Directory d has total size 24933642.
// - As the outermost directory, / contains every file. Its total size is 48381165,
//   the sum of the size of every file.
//
// To begin, find all the directories with a total size of at most 100000,
// then calculate the sum of their total sizes. In the example above, these directories are a and e;
// the sum of their total sizes is 95437 (94853 + 584).
// (As in this example, this process can count files more than once!)
//
// Find all the directories with a total size of at most 100000.
// What is the sum of the total sizes of those directories?
//
//   To begin, get your puzzle input.

// ---------------------------------------------------------------------------------------------------------------------

// Your puzzle answer was 1915606.
//
// The first half of this puzzle is complete! It provides one gold star: *
//
// --- Part Two ---
// Now, you're ready to choose a directory to delete.
//
// The total disk space available to the filesystem is 70000000.
// To run the update, you need unused space of at least 30000000.
// You need to find a directory you can delete that will free up enough space to run the update.
//
//   In the example above,
//   the total size of the outermost directory (and thus the total amount of used space) is 48381165;
//   this means that the size of the unused space must currently be 21618835,
//   which isn't quite the 30000000 required by the update.
//   Therefore, the update still requires a directory with total size of at least 8381165
//   to be deleted before it can run.
//
// To achieve this, you have the following options:
//
// - Delete directory e, which would increase unused space by 584.
// - Delete directory a, which would increase unused space by 94853.
// - Delete directory d, which would increase unused space by 24933642.
// - Delete directory /, which would increase unused space by 48381165.
//
// Directories e and a are both too small; deleting them would not free up enough space.
// However, directories d and / are both big enough! Between these, choose the smallest:
// d, increasing unused space by 24933642.
//
// Find the smallest directory that, if deleted,
// would free up enough space on the filesystem to run the update.
// What is the total size of that directory?

// ---------------------------------------------------------------------------------------------------------------------
class DiskSpace {
  private static MAX = 70000000;
  private static used: 0;

  static get free(): number {
    return this.MAX - this.used;
  }
};

abstract class SystemEntity {
  protected constructor(
    protected _name: string = '',
    protected _parent: Directory | null = null,
  ) {
  }

  protected _size: number = 0;

  get size(): number {
    return this._size;
  }

  get name(): string {
    return this._name;
  }

  get path(): string {
    let path = this._name === '/' ? '' : this._name;
    if (this.hasParent()) {
      path += '/' + this._parent.path;
    }
    return path;
  }

  hasParent(): this is { _parent: Directory } {
    return !!this._parent;
  }

  abstract toString<T>(config?: Record<string, unknown>): string;
}

// ---------------------------------------------------------------------------------------------------------------------

class File extends SystemEntity {
  static isFile(entity: SystemEntity | null): entity is Directory {
    return (!!entity) && ('_ext' in entity);
  }

  constructor(
    name: string,
    private _ext: string | undefined,
    protected _size: number,
    parent: Directory | null,
  ) {
    super(name, parent);
    super._size = _size;
  }

  get ext(): string | undefined {
    return this._ext;
  }

  toString(config?: { size: boolean }): string {
    let end = '';
    end = config?.size ? ' ' + this._size : end;
    return `${this.name}${this._ext ? ('.' + this._ext) : ''}${end}`;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class Directory extends SystemEntity {
  static isDirectory(entity: SystemEntity | null): entity is Directory {
    return (!!entity) && ('children' in entity);
  }

  constructor(
    name: string,
    parent?: Directory | null,
    private _children: SystemEntity[] = []
  ) {
    super(name, parent);
  }

  get parent(): Directory | null {
    return this._parent;
  }

  get size(): number {
    return this._children
      .reduce((size, entity) => size + entity.size, 0);
  }

  get children(): SystemEntity[] {
    return this._children;
  }

  add(...children: SystemEntity[]): this {
    this._children.push(...children);
    return this;
  }

  toString(): string {
    return 'dir ' + this._name;
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class FileSystem {
  private constructor() {
  }

  private static _instance: FileSystem = new this();

  static get instance(): FileSystem {
    return this._instance;
  }

  private _root: Directory = new Directory('/');

  get root(): Directory {
    return this._root;
  }

  private _currentDirectory: Directory | null = this._root;

  get currentDirectory(): Directory | null {
    return this._currentDirectory;
  }

  set currentDirectory(dir: Directory | null) {
    this._currentDirectory = dir;
  }

  createFile(name: string, ext: string | undefined, size: number): File {
    const file = new File(name, ext, size, this._currentDirectory);
    this._currentDirectory?.add(file);
    return file;
  }

  createDir(name: string) {
    const file = new Directory(name, this._currentDirectory);
    this._currentDirectory?.add(file);
  }

  toString() {
    return this._root.children
  }
}

// ---------------------------------------------------------------------------------------------------------------------

interface Command {
  execute: (input: string, fileSystem: FileSystem) => string;
}

// ---------------------------------------------------------------------------------------------------------------------

class Terminal {
  private readonly _fileSystem: FileSystem = FileSystem.instance;

  private readonly _commands = new Map<string, Command>([
    ['cd', {
      execute(input: string, fileSystem: FileSystem): string {
        switch (input) {
          case '/': {
            fileSystem.currentDirectory = fileSystem.root;
            return fileSystem.currentDirectory.path;
          }
          case '..': {
            fileSystem.currentDirectory = fileSystem.currentDirectory?.parent ?? null;
            return fileSystem.currentDirectory?.path ?? '';
          }
          default: {
            const children: SystemEntity[] | undefined = fileSystem.currentDirectory?.children;
            const directory: SystemEntity | null = children?.find(child => child.name === input) ?? null;
            if (Directory.isDirectory(directory)) {
              fileSystem.currentDirectory = directory;
            }
            return fileSystem.currentDirectory?.path ?? '';
          }
        }
      }
    }],
    ['ls', {
      execute(input: string, fileSystem: FileSystem): string {
        const groups = input?.match(
          /(-(?<options>\w+))?\s?(?<file>\w+)?/
        )?.groups;

        return fileSystem
          .currentDirectory
          ?.children
          ?.map(c => c.toString({ size: groups?.options?.includes('l') }))
          ?.join('\n') ?? "";
      }
    }],
    ['mkdir', {
      execute(input: string, fileSystem: FileSystem): string {
        fileSystem.createDir(input)
        return input;
      }
    }],
    ['touch', {
      execute(input: string, fileSystem: FileSystem): string {
        const groups = input.match(
          /(?<name>\w+)(\.(?<ext>\w+))?(\s(?<size>\d+))?/
        )?.groups;

        let file: File | null = null;
        if (groups) {
          file = fileSystem.createFile(groups.name, groups.ext ?? '', +(groups.size ?? 0));
        }

        return file?.toString() ?? '';
      }
    }],
    ['finddirtotal', {
      execute(input: string, fileSystem: FileSystem): string {
        const groups = input.match(/(?<maxSize>\w+)/)?.groups;

        if (!groups?.maxSize) return '';

        const maxSize = +groups.maxSize;

        const dirs: Directory[] = [];

        recursiveSearch(fileSystem.root);

        function recursiveSearch(entity: SystemEntity) {
          if (Directory.isDirectory(entity)) {
            if (entity.size < maxSize) {
              dirs.push(entity);
            }
            entity.children.forEach(child => {
              recursiveSearch(child);
            });
          }
        }

        return dirs.reduce((size, dir) => size + dir.size, 0).toString();
      }
    }],
  ]);

  private _output: string = '';

  get output(): string {
    return this._output;
  }

  private set output(text: string) {
    this._output += text;
  }

  get fileStruct(): string {
    return inspect(this.toString(), { colors: true, compact: true, depth: 10, breakLength: 80 });
  }

  input(text: string): void {
    const lines = this.parse(text);
    let output: string = '';
    for (const line of lines) {
      output += 'User@Domain ~' + this._fileSystem?.currentDirectory?.path.split('/').reverse().join('/') + '\n';

      const groups: { [p: string]: string } | undefined =
        line
          .match(/\$\s+(?<command>\w+)(\s+(?<rest>.+))?/)
          ?.groups;

      if (groups) {
        output +=
          this._commands
            .get(groups.command)
            ?.execute(groups.rest, this._fileSystem) + '\n';
        continue;
      }

      const groups2: { [p: string]: string } | undefined =
        line
          .match(/dir (?<name>.+)/)
          ?.groups;

      if (groups2) {
        output +=
          this._commands
            .get('mkdir')
            ?.execute(groups2.name ?? '', this._fileSystem) + '\n';

        continue;
      }

      const groups3: { [p: string]: string } | undefined =
        line
          .match(/(?<size>\d+) (?<name>\w+)(\.(?<ext>\w+))?/)
          ?.groups;

      if (groups3) {
        let input = groups3.name;
        input += groups3.ext ? '.' + groups3.ext : '';
        input += ' ' + groups3.size ?? '';

        output +=
          this._commands
            .get('touch')
            ?.execute(input, this._fileSystem) + '\n';
      }
    }

    this.output = output;
  }

  toString() {
    return this._fileSystem.toString();
  }

  private parse(text: string): string[] {
    return text.split(/;|\n/g).filter(line => !line.includes('//'))
  }
}

// ---------------------------------------------------------------------------------------------------------------------

executeWithPrompt(__dirname, (text): void => {
  const terminal = new Terminal();
  terminal.input(text);

  terminal.input('$ finddirtotal 100000');
  console.log(terminal.output);
  // console.log(terminal.fileStruct);
});
