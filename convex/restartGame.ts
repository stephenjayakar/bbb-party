import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export const restartGame = mutation({
  args: {},
  handler: async ({ db }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (gameState !== null) {
      await db.delete(gameState._id)
    }
  },
})
