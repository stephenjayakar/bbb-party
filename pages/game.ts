export type Player = {
  alive: boolean;
}

export type Lever = {
  flipped: boolean;
  bomb: boolean;
}

export type GameState = {
  players: Array<Player>;
  levers: Array<Lever>;
}

// number is from [0, max) and an integer
function getRandomInt (max: number): number {
  return Math.floor(Math.random() * max)
}

// levers 1 greater than # of players alive.
// using index as the player # and lever #. can change later
export const startGame = (numPlayers: number): GameState => {
  const players = [...Array(numPlayers)].map((_, i) => ({
    alive: true
  }))

  const numLevers = numPlayers + 1
  const bombLeverIndex = getRandomInt(numLevers)
  const levers = [...Array(numLevers)].map((_, i) => ({
    // cracked
    bomb: i === bombLeverIndex,
    flipped: false
  }))

  return {
    players,
    levers
  }
}

export const dummyGameState = (): GameState => {
  return {
    players: [],
    levers: [],
  }
}

// the progress state function is going to take in a lever to flip, and will return a new game state

// also needs to occasionally return events

// const progressGame(
//   state: GameState,
//   flippedLever: number,
// ): GameState {
//
// }
