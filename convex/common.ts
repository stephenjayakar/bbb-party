import type { Doc } from './_generated/dataModel'

export const GAME_TABLE = 'game_table'

export interface Lever {
  bomb: boolean
  color?: string
  flipped: boolean
}

export interface Player {
  alive: boolean
  clientId?: string
  name?: string
}

export interface GameState {
  players: Player[]
  levers: Lever[]
  isStarted: boolean
  playerTurn?: number
}

export type GameStateWithID = Doc<'game_table'>

export const LEVER_COLORS = [
  'red',
  'purple',
  'yellow',
  'green',
  'white',
  'blue',
  'orange',
  'pink',
  'teal',
  'black',
  'cyan',
  'lime',
  'gold',
  'silver',
  'navy',
  'maroon',
  'peach',
  'mint',
  'lavender',
  'coral',
] as const

// number is from [0, max) and an integer
export const getRandomInt = (max: number): number =>
  Math.floor(Math.random() * max)

const shuffledColors = (numLevers: number): string[] => {
  const palette = [...LEVER_COLORS]
  for (let i = palette.length - 1; i > 0; i -= 1) {
    const randomIndex = getRandomInt(i + 1)
    const currentColor = palette[i]
    palette[i] = palette[randomIndex]
    palette[randomIndex] = currentColor
  }

  return Array.from({ length: numLevers }, (_, index) => palette[index % palette.length])
}

// Creates N levers, with one of them set as the bomb.
export const createLevers = (numLevers: number): Lever[] => {
  const bombLeverIndex = getRandomInt(numLevers)
  const colors = shuffledColors(numLevers)
  const levers = [...Array(numLevers)].map((_, i) => ({
    bomb: i === bombLeverIndex,
    color: colors[i],
    flipped: false,
  }))
  return levers
}
