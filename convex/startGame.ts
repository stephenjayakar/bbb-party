import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export default mutation(async ({ db }) => {
  let gameState = await db.table(GAME_TABLE).first()

  if (gameReadyToBeStarted(gameState)) {
    gameState.isStarted = true

    // Seed the levers
    const numLevers = gameState.players.length + 1
    const bombLeverIndex = getRandomInt(numLevers)
    const levers = [...Array(numLevers)].map((_, i) => ({
        // cracked
        bomb: i === bombLeverIndex,
        flipped: false
    }))
    gameState.levers = levers
    db.patch(gameState._id, gameState)
  }
})

const gameReadyToBeStarted = (gameState): boolean =>
  gameState && gameState.isStarted !== undefined && gameState.isStarted === false && gameState.players && gameState.players.length > 1

// number is from [0, max) and an integer
function getRandomInt (max: number): number {
  return Math.floor(Math.random() * max)
}

