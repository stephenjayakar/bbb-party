import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'
import { Id } from 'convex/values'

export default mutation(async ({ db }): Promise<{
  // TODO: bring in the named type
  playerNumber: number,
  gameState: any,
}> => {
  let gameState = await db.table(GAME_TABLE).first()
  let gameID: Id
  const numPlayers = gameState ? gameState.players.length : 0
  if (gameState === null) {
    gameState = {
      players: [{ alive: true }],
      levers: [],
      isStarted: false,
    }
    gameID = db.insert(GAME_TABLE, gameState)
  } else {
    gameState.players.push({alive: true})
    db.replace(gameState._id, gameState)
    gameID = gameState._id
  }
  gameState._id = gameID
  return {
    playerNumber: numPlayers,
    gameState,
  }
})
