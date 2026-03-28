import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export const restartGame = mutation({
  args: {},
  handler: async ({ db }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (gameState !== null) {
      await db.patch(gameState._id, {
        players: gameState.players.map(() => ({ alive: true })),
        levers: [],
        isStarted: false,
        playerTurn: undefined,
      })
    }
  },
})
