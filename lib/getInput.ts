import fs from "fs";
import path from "path";

const getInput = (dirname: string): string => {
  let filePath = './input.txt';
  if (process.env.MODE === 'TEST') {
    filePath = './demo-input.txt';
  }
  return fs.readFileSync(path.join(dirname, filePath), 'utf8');
}

export default getInput;
