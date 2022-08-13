export const GAME_TABLE = 'game_table'

// number is from [0, max) and an integer
export const getRandomInt = (max: number): number =>
  Math.floor(Math.random() * max)

// Creates N levers, with one of them set as the bomb.
export const createLevers = (numLevers: number) => {
  const bombLeverIndex = getRandomInt(numLevers)
  const levers = [...Array(numLevers)].map((_, i) => ({
    // cracked
    bomb: i === bombLeverIndex,
    flipped: false,
  }))
  return levers
}
