import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { GAME_TABLE, GameStateWithID } from './common'

export const joinGame = mutation({
  args: {
    numClientPlayers: v.number(),
  },
  handler: async (
    { db },
    { numClientPlayers }
  ): Promise<{
    playerNumber: number
    gameState: GameStateWithID
  }> => {
    let gameState = await db.query(GAME_TABLE).first()
    const numPlayers = gameState ? gameState.players.length : 0
    if (numClientPlayers !== numPlayers) {
      throw new Error('Local game state does not match current state')
    }

    if (gameState === null) {
      const gameID = await db.insert(GAME_TABLE, {
        players: [{ alive: true }],
        levers: [],
        isStarted: false,
      })
      gameState = await db.get(gameID)
    } else {
      await db.patch(gameState._id, {
        players: [...gameState.players, { alive: true }],
      })
      gameState = await db.get(gameState._id)
    }

    if (gameState === null) {
      throw new Error('Game state was not created')
    }

    return {
      playerNumber: numPlayers,
      gameState,
    }
  },
})
