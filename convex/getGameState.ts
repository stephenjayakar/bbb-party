import { query } from './_generated/server'
import {
  GAME_TABLE,
  GameStateWithID,
} from './common'


export default query(async ({ db }): Promise<GameStateWithID> => {
  const gameState = await db
    .table(GAME_TABLE)
    .first()
  return gameState
})
