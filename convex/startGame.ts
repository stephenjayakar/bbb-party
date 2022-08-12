import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export default mutation(async ({ db }) => {
  let gameState = await db.table(GAME_TABLE).first()

  if (gameReadyToBeStarted(gameState)) {
    gameState.isStarted = true
    db.patch(gameState._id, gameState)
  }
})

const gameReadyToBeStarted = (gameState): boolean =>
  gameState && gameState.isStarted !== undefined && gameState.isStarted === false
