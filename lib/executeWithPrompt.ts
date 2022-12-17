import readline from 'readline';
import getInput from "./getInput";

const rl = readline.createInterface({input: process.stdin, output: process.stdout});

const executeWithPrompt = (dirname: string, fn: (input: string) => unknown) => {
  rl.question('execute in "DEMO" mode? (y/n) \n', (answer: string) => {
    if (answer.trim() === 'y') process.env.MODE = "TEST";
    const input = getInput(dirname)
    fn(input);
    rl.close()
  });
}

export default executeWithPrompt;
