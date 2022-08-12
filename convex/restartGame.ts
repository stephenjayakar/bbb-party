import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export default mutation(async ({ db }) => {
  let gameState = await db.table(GAME_TABLE).first()
  if (gameState !== null) {
    db.delete(gameState._id)
  }
})
