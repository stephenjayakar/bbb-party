import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { GAME_TABLE } from './common'

export const setPlayerName = mutation({
  args: {
    clientId: v.string(),
    name: v.string(),
  },
  handler: async ({ db }, { clientId, name }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (gameState === null) {
      return
    }

    const playerNumber = gameState.players.findIndex(
      (player) => player.clientId === clientId
    )
    if (playerNumber === -1) {
      return
    }

    const players = [...gameState.players]
    players[playerNumber] = {
      ...players[playerNumber],
      name,
    }

    await db.patch(gameState._id, { players })
  },
})
