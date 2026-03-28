import { query } from './_generated/server'
import { GAME_TABLE, GameStateWithID } from './common'

export const getGameState = query({
  args: {},
  handler: async ({ db }): Promise<GameStateWithID | null> => {
    return await db.query(GAME_TABLE).first()
  },
})
