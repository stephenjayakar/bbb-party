import { query } from './_generated/server'
import {
  GAME_TABLE,
} from './common'


export default query(async ({ db }): Promise<any> => {
  const gameState = await db
    .table(GAME_TABLE)
    .first()
  return gameState
})
