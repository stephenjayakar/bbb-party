import { mutation } from './_generated/server'
import { GAME_TABLE, createLevers, GameStateWithID } from './common'

export const startGame = mutation({
  args: {},
  handler: async ({ db }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (!gameReadyToBeStarted(gameState)) {
      return
    }

    gameState.isStarted = true
    const numLevers = gameState.players.length + 1
    gameState.levers = createLevers(numLevers)
    gameState.playerTurn = 0
    await db.replace(gameState._id, gameState)
  },
})

const gameReadyToBeStarted = (
  gameState: GameStateWithID | null
): gameState is GameStateWithID =>
  gameState !== null && gameState.isStarted === false && gameState.players.length > 1
