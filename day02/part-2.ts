import executeWithPrompt from "../lib/executeWithPrompt";

// --- Day 2: Rock Paper Scissors ---
// The Elves begin to set up camp on the beach.
// To decide whose tent gets to be closest to the snack storage,
// a giant Rock Paper Scissors tournament is already in progress.
//
//   Rock Paper Scissors is a game between two players.
//   Each game contains many rounds; in each round,
//   the players each simultaneously choose one of Rock, Paper, or Scissors using a hand shape.
//   Then, a winner for that round is selected: Rock defeats Scissors,
//   Scissors defeats Paper, and Paper defeats Rock. If both players choose the same shape,
//   the round instead ends in a draw.
//
//   Appreciative of your help yesterday,
//   one Elf gives you an encrypted strategy guide (your puzzle input)
//   that they say will be sure to help you win.
//   "The first column is what your opponent is going to play:
//   A for Rock, B for Paper, and C for Scissors.
//   The second column--" Suddenly, the Elf is called away to help with someone's tent.
//
// The second column, you reason, must be what you should play in response: X for Rock, Y for Paper, and Z for Scissors.
// Winning every time would be suspicious, so the responses must have been carefully chosen.
//
//   The winner of the whole tournament is the player with the highest score.
//   Your total score is the sum of your scores for each round.
//   The score for a single round is the score for the shape you selected (1 for Rock, 2 for Paper, and 3 for Scissors)
//   plus the score for the outcome of the round (0 if you lost, 3 if the round was a draw, and 6 if you won).
//
// Since you can't be sure if the Elf is trying to help you or trick you,
// you should calculate the score you would get if you were to follow the strategy guide.
//
// For example, suppose you were given the following strategy guide:
//
// A Y
// B X
// C Z
// This strategy guide predicts and recommends the following:
//
//   In the first round, your opponent will choose Rock (A), and you should choose Paper (Y).
//   This ends in a win for you with a score of 8 (2 because you chose Paper + 6 because you won).
// In the second round, your opponent will choose Paper (B), and you should choose Rock (X).
// This ends in a loss for you with a score of 1 (1 + 0).
//   The third round is a draw with both players choosing Scissors, giving you a score of 3 + 3 = 6.
// In this example, if you were to follow the strategy guide, you would get a total score of 15 (8 + 1 + 6).
//
//   What would your total score be if everything goes exactly according to your strategy guide?

// ---------------------------------------------------------------------------------------------------------------------

// --- Part Two ---
// The Elf finishes helping with the tent and sneaks back over to you.
// "Anyway, the second column says how the round needs to end:
// X means you need to lose, Y means you need to end the round in a draw, and Z means you need to win.
// Good luck!"
//
// The total score is still calculated in the same way,
// but now you need to figure out what shape to choose so the round ends as indicated.
// The example above now goes like this:
//
// In the first round, your opponent will choose Rock (A),
// and you need the round to end in a draw (Y), so you also choose Rock.
// This gives you a score of 1 + 3 = 4.
// In the second round, your opponent will choose Paper (B),
// and you choose Rock, so you lose (X) with a score of 1 + 0 = 1.
// In the third round, you will defeat your opponent's Scissors with Rock for a score of 1 + 6 = 7.
// Now that you're correctly decrypting the ultra top secret strategy guide,
// you would get a total score of 12.
//
// Following the Elf's instructions for the second column,
// what would your total score be if everything goes exactly according to your strategy guide?

type HandShape = 'ROCK' | 'PAPER' | 'SCISSOR';
type Outcome = 'LOSE' | 'WIN' | 'DRAW';
type OutcomeEncryption = 'X' | 'Y' | 'Z';
type HandShapeEncryptionPlayer2 = 'A' | 'B' | 'C';
type HandShapeEncryption = OutcomeEncryption | HandShapeEncryptionPlayer2;
type POINTS = 0 | 1 | 2 | 3 | 6;
type Round = [PlayerHand, PlayerHand];

const handShapeDecryption = new Map<HandShapeEncryptionPlayer2, HandShape>([
  ['A', 'ROCK'],
  ['B', 'PAPER'],
  ['C', 'SCISSOR'],
]);

const outcomeDecryption = new Map<OutcomeEncryption, Outcome>([
  ['X', 'LOSE'],
  ['Y', 'DRAW'],
  ['Z', 'WIN'],
]);

const score = new Map<HandShape | Outcome, POINTS>([
  ['ROCK', 1],
  ['PAPER', 2],
  ['SCISSOR', 3],
  ['LOSE', 0],
  ['DRAW', 3],
  ['WIN', 6],
]);

const parseStrategyGuid = (strategyGuid: string): Round[] =>
  strategyGuid
    .trim()
    .split('\n')
    .map(item => item.split(' ') as [HandShapeEncryptionPlayer2, OutcomeEncryption])
    .map(([player2Encryption, outcome]) => {
      const player2 = new PlayerHand(player2Encryption);
      const me = new PlayerHandMe(outcome, player2);
      return [player2, me];
    });

class PlayerHand {
  static SHAPES: Record<HandShape, HandShape> = {
    ROCK: 'ROCK',
    PAPER: 'PAPER',
    SCISSOR: 'SCISSOR',
  };

  constructor(shapeEncryption: HandShapeEncryption, public _playerTwoHand?: PlayerHand) {
    this.evaluateShape(shapeEncryption);
  }

  protected _shape: HandShape = 'ROCK';

  get shape(): HandShape {
    return this._shape;
  }

  protected _score = 0;

  get score(): number {
    return this._score;
  }

  compare(playerHand: PlayerHand): void {
    if (this._shape === 'ROCK' && playerHand.shape === 'SCISSOR'
      || this._shape === 'PAPER' && playerHand.shape === 'ROCK'
      || this._shape === 'SCISSOR' && playerHand.shape === 'PAPER'
    ) {
      this._score += score.get('WIN')!;
      return;
    }
    if (this._shape === playerHand._shape) {
      this._score += score.get('DRAW')!;
      return;
    }
    this._score += score.get('LOSE')!;
  }

  protected evaluateShape(handShapeEncryption: HandShapeEncryption) {
    const shape = handShapeDecryption.get(handShapeEncryption as HandShapeEncryptionPlayer2)!;
    this._score = score.get(shape)!;
    this._shape = shape;
  }
}

class PlayerHandMe extends PlayerHand {
  constructor(private _shapeEncryption: HandShapeEncryption, public _playerTwoHand: PlayerHand) {
    super(_shapeEncryption, _playerTwoHand);
  }

  protected override evaluateShape(handShapeEncryption: OutcomeEncryption) {
    const outcome = outcomeDecryption.get(handShapeEncryption);
    if (outcome === 'LOSE') {
      if (this._playerTwoHand.shape === 'ROCK') this._shape = 'SCISSOR';
      if (this._playerTwoHand.shape === 'PAPER') this._shape = 'ROCK';
      if (this._playerTwoHand.shape === 'SCISSOR') this._shape = 'PAPER';
    }
    if (outcome === 'WIN') {
      if (this._playerTwoHand.shape === 'ROCK') this._shape = 'PAPER';
      if (this._playerTwoHand.shape === 'PAPER') this._shape = 'SCISSOR';
      if (this._playerTwoHand.shape === 'SCISSOR') this._shape = 'ROCK';
    }
    if (outcome === 'DRAW') {
      if (this._playerTwoHand.shape === 'ROCK') this._shape = 'ROCK';
      if (this._playerTwoHand.shape === 'PAPER') this._shape = 'PAPER';
      if (this._playerTwoHand.shape === 'SCISSOR') this._shape = 'SCISSOR';
    }
    this._score = score.get(this._shape)!;
  }
}

class RockPaperScissorGame {
  constructor(
    private rounds: Round[]
  ) {
  }

  private _myScore = 0;

  get myScore(): number {
    return this._myScore;
  }

  play() {
    this.rounds.forEach(([player2Hand, myHand]) => {
      myHand.compare(player2Hand);
      player2Hand.compare(myHand);
      this._myScore += myHand.score;
    });
  }
}

executeWithPrompt(__dirname, (strategyGuid) => {
  const rounds = parseStrategyGuid(strategyGuid);
  const game = new RockPaperScissorGame(rounds);
  game.play();
  const result = game.myScore;
  // console.log(rounds)
  console.log(result);
});
