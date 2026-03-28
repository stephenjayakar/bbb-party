import type { Doc } from './_generated/dataModel'

export const GAME_TABLE = 'game_table'

export interface Lever {
  bomb: boolean
  flipped: boolean
}

export interface Player {
  alive: boolean
}

export interface GameState {
  players: Player[]
  levers: Lever[]
  isStarted: boolean
  playerTurn?: number
}

export type GameStateWithID = Doc<'game_table'>

// number is from [0, max) and an integer
export const getRandomInt = (max: number): number =>
  Math.floor(Math.random() * max)

// Creates N levers, with one of them set as the bomb.
export const createLevers = (numLevers: number): Lever[] => {
  const bombLeverIndex = getRandomInt(numLevers)
  const levers = [...Array(numLevers)].map((_, i) => ({
    bomb: i === bombLeverIndex,
    flipped: false,
  }))
  return levers
}
