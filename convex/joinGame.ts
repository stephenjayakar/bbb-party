import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

const INVALID_PLAYER_ERROR = Error('invalid player number joined');

export default mutation(async ({ db }, playerNumber: number) => {
  let gameState = await db.table(GAME_TABLE).first()
  const numPlayers = gameState ? gameState.players.length : 0
  if (playerNumber != numPlayers) {
    throw INVALID_PLAYER_ERROR
  }
  if (gameState === null) {
    gameState = {
      players: [{ alive: true }],
      levers: [],
      isStarted: false,
    }
    db.insert(GAME_TABLE, gameState)
  } else {
    gameState.players.push({alive: true})
    db.replace(gameState._id, gameState)
  }
})
