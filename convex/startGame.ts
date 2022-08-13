import { mutation } from './_generated/server'
import {
  GAME_TABLE,
  createLevers,
} from './common'

export default mutation(async ({ db }) => {
  let gameState = await db.table(GAME_TABLE).first()

  if (gameReadyToBeStarted(gameState)) {
    gameState.isStarted = true

    // Seed the levers
    const numLevers = gameState.players.length + 1
    gameState.levers = createLevers(numLevers)
    gameState.playerTurn = 0;
    db.patch(gameState._id, gameState)
  }
})

const gameReadyToBeStarted = (gameState: any): boolean =>
  gameState && gameState.isStarted !== undefined && gameState.isStarted === false && gameState.players && gameState.players.length > 1

