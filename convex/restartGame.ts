import { mutation } from './_generated/server'
import { GAME_TABLE, createLevers } from './common'

export const restartGame = mutation({
  args: {},
  handler: async ({ db }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (gameState !== null) {
      const players = gameState.players.map(() => ({ alive: true }))
      const canRestartImmediately = players.length > 1

      await db.patch(gameState._id, {
        players,
        levers: canRestartImmediately ? createLevers(players.length + 1) : [],
        isStarted: canRestartImmediately,
        playerTurn: canRestartImmediately ? 0 : undefined,
      })
    }
  },
})
