import { mutation } from './_generated/server'
import { GAME_TABLE, GameStateWithID } from './common'
import { GenericId } from 'convex/values'

export default mutation(
  async (
    { db },
    numClientPlayers: number
  ): Promise<{
    playerNumber: number
    gameState: GameStateWithID
  }> => {
    let gameState = await db.table(GAME_TABLE).first()
    let gameID: GenericId<string>
    const numPlayers = gameState ? gameState.players.length : 0
    if (numClientPlayers !== numPlayers) {
      throw new Error('Local game state does not match current state')
    }
    if (gameState === null) {
      gameState = {
        players: [{ alive: true }],
        levers: [],
        isStarted: false,
      }
      gameID = db.insert(GAME_TABLE, gameState)
    } else {
      gameState.players.push({ alive: true })
      db.replace(gameState._id, gameState)
      gameID = gameState._id
    }
    gameState._id = gameID
    return {
      playerNumber: numPlayers,
      gameState,
    }
  }
)
