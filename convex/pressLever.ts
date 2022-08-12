import { mutation } from './_generated/server'
import { GAME_TABLE } from './common'

export default mutation(async ({ db }, leverNumber: number) => {
  let gameState = await db.table(GAME_TABLE).first()

  const lever = gameState.levers[leverNumber]
  lever.flipped = true
  const numPlayers = gameState.players.length
  gameState.playerTurn = (gameState.playerTurn + 1) % numPlayers
  db.patch(gameState._id, gameState)
}
)
