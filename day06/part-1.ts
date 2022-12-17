import executeWithPrompt from "../lib/executeWithPrompt";

// --- Day 6: Tuning Trouble ---
// The preparations are finally complete;
// you and the Elves leave camp on foot and begin to make your way toward the star fruit grove.
//
//   As you move through the dense undergrowth, one of the Elves gives you a handheld device.
//   He says that it has many fancy features,
//   but the most important one to set up right now is the communication system.
//
//   However, because he's heard you have significant experience dealing with signal-based systems,
//   he convinced the other Elves that it would be okay to give you their one malfunctioning device
//   - surely you'll have no problem fixing it.
//
//   As if inspired by comedic timing, the device emits a few colorful sparks.
//
//   To be able to communicate with the Elves, the device needs to lock on to their signal.
//   The signal is a series of seemingly-random characters that the device receives one at a time.
//
//   To fix the communication system,
//   you need to add a subroutine to the device that detects a start-of-packet marker in the datastream.
//   In the protocol being used by the Elves,
//   the start of a packet is indicated by a sequence of four characters that are all different.
//
//   The device will send your subroutine a datastream buffer (your puzzle input);
//   your subroutine needs to identify
//   the first position where the four most recently received characters were all different.
//   Specifically, it needs to report the number of characters
//   from the beginning of the buffer to the end of the first such four-character marker.
//
//   For example, suppose you receive the following datastream buffer:
//
//   mjqjpqmgbljsphdztnvjfqwrcgsmlb
//
// After the first three characters (mjq) have been received,
// there haven't been enough characters received yet to find the marker.
// The first time a marker could occur is after the fourth character is received,
// making the most recent four characters mjqj. Because j is repeated, this isn't a marker.
//
//   The first time a marker appears is after the seventh character arrives.
//   Once it does, the last four characters received are jpqm, which are all different.
//   In this case, your subroutine should report the value 7,
//   because the first start-of-packet marker is complete after 7 characters have been processed.
//
//   Here are a few more examples:
//
// bvwbjplbgvbhsrlpgdmjqwftvncz: first marker after character 5
// nppdvjthqldpwncqszvftbrmjlhg: first marker after character 6
// nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg: first marker after character 10
// zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw: first marker after character 11
//
// How many characters need to be processed before the first start-of-packet marker is detected?

// ---------------------------------------------------------------------------------------------------------------------

class Parser {
  static parse(text: string): string[] {
    return text.split('\n');
  }
}

// ---------------------------------------------------------------------------------------------------------------------

type DeviceBuffer = [string, string, string, string];

class Queue<T extends unknown[]> {
  constructor(private _data: T) {
  }

  get data(): T {
    return this._data;
  }

  load(data: T): void {
    this._data = data;
  }

  enqueue(item: string): T[0] {
    this._data.push(item);
    return this.dequeue();
  }

  dequeue(): T[0] {
    return this._data.shift();
  }

  length(): number {
    return this._data.length;
  }

  includes<T>(...args: Parameters<Array<T>['includes']>): boolean {
    return this._data.includes(...args);
  }

  toString() {
    return `queue: ${this._data}`;
  }

  clone(): Queue<T> {
    return new Queue<T>(structuredClone(this._data));
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class Device {
  private _buffer: Queue<DeviceBuffer> = new Queue(['', '', '', '']);

  constructor(
    private _datastream: string = ''
  ) {
  }

  parse(): number {
    this.initBuffer();

    return this._datastream
      .split('')
      .findIndex((item) => {
        const hasDoubleChars: boolean = this.hasDoubleChars();
        this._buffer.enqueue(item);
        return !hasDoubleChars
      }) + 4;
  }

  toString() {
    return `
    data-stream: ${this._datastream} 
    buffer: ${this._buffer.toString()}
    `;
  }

  private hasDoubleChars(): boolean {
    const rounds: number = 4;
    const cachedBuffer: Queue<DeviceBuffer> = this._buffer.clone();
    for (let i = 0; i < rounds; i++) {
      console.log(cachedBuffer)
      const item = cachedBuffer.dequeue();
      console.log({ item })
      const hasDouble = cachedBuffer.includes(item);
      console.log(hasDouble)
      if (hasDouble) {
        return true;
      }
    }
    return false;
  }

  private initBuffer(): void {
    const buffer: DeviceBuffer = this._datastream.substring(0, 4).split('') as DeviceBuffer;
    this._datastream = this._datastream.substring(4, this._datastream.length);
    this._buffer.load(buffer);
  }

  private queueBuffer(item: string) {
    this._buffer.enqueue(item);
  }
}

// ---------------------------------------------------------------------------------------------------------------------

class DeviceCollection {
  constructor(
    private _data: Device[] = []
  ) {
  }

  add(device: Device) {
    this._data?.push(device);
  }

  get(index: number): Device {
    return this._data[index];
  }

  init(lines: string[]): this {
    for (const line of lines) {
      this.add(new Device(line));
    }
    return this;
  }

  map<T>(callbackFn: (item: Device, index: number, array: Device[]) => T) {
    return this._data?.map<T>(callbackFn);
  }

  toString() {
    return this._data.map(item => item.toString());
  }
}

// ---------------------------------------------------------------------------------------------------------------------

executeWithPrompt(__dirname, (text): void => {
  const lines: string[] = Parser.parse(text);
  console.table(lines);
  const devices = new DeviceCollection().init(lines);
  const results: number[] = devices.map<number>((device): number => device.parse());
  console.table(devices.get(0).toString());
  console.table(results);
  console.log(results[0]);
});
