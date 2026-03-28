import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { GAME_TABLE, GameStateWithID } from './common'

export const joinGame = mutation({
  args: {
    clientId: v.string(),
    name: v.string(),
    numClientPlayers: v.number(),
  },
  handler: async (
    { db },
    { clientId, name, numClientPlayers }
  ): Promise<{
    playerNumber: number
    gameState: GameStateWithID
  }> => {
    let gameState = await db.query(GAME_TABLE).first()
    const numPlayers = gameState ? gameState.players.length : 0

    if (gameState !== null) {
      const existingPlayerNumber = gameState.players.findIndex(
        (player) => player.clientId === clientId
      )
      if (existingPlayerNumber !== -1) {
        const existingPlayer = gameState.players[existingPlayerNumber]
        if (existingPlayer.name !== name) {
          const players = [...gameState.players]
          players[existingPlayerNumber] = {
            ...existingPlayer,
            name,
          }
          await db.patch(gameState._id, { players })
          const updatedGameState = await db.get(gameState._id)
          if (updatedGameState !== null) {
            gameState = updatedGameState
          }
        }
        return {
          playerNumber: existingPlayerNumber,
          gameState,
        }
      }
    }

    if (numClientPlayers !== numPlayers) {
      throw new Error('Local game state does not match current state')
    }

    if (gameState === null) {
      const gameID = await db.insert(GAME_TABLE, {
        players: [{ alive: true, clientId, name }],
        levers: [],
        isStarted: false,
      })
      gameState = await db.get(gameID)
    } else {
      await db.patch(gameState._id, {
        players: [...gameState.players, { alive: true, clientId, name }],
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
