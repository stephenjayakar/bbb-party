import { mutation } from './_generated/server'
import { GAME_TABLE, createLevers } from './common'

export default mutation(async ({ db }, leverNumber: number) => {
  let gameState = await db.table(GAME_TABLE).first()
  const lever = gameState.levers[leverNumber]
  if (canFlipLever(lever)) {
    lever.flipped = true
    if (lever.bomb) {
      killCurrentPlayer(gameState)
    }
    const numPlayers = numAlivePlayers(gameState.players)
    gameState.playerTurn = nextPlayer(gameState.playerTurn, gameState.players)
    // Need to restart the game if there's only one lever left. Also need to restart it if the bomb is triggered
    if (unflippedLevers(gameState.levers) == 1 || lever.bomb) {
      gameState.levers = createLevers(numPlayers + 1)
    }
    db.patch(gameState._id, gameState)
  }
})

const canFlipLever = (lever) => !lever.flipped

const unflippedLevers = (levers): number =>
  levers.filter((l) => !l.flipped).length

// returns an index to the next alive player. also goes
// in a circle through the array.
const nextPlayer = (currentPlayer: number, players): number => {
  for (let i = 1; i < players.length; ++i) {
    const possibleNextPlayer = (currentPlayer + i) % players.length
    if (players[possibleNextPlayer].alive) {
      return possibleNextPlayer
    }
  }
  throw new Error('something went wrong with selecting the next player')
}

const killCurrentPlayer = (gameState) => {
  const currentPlayer = gameState.playerTurn
  gameState.players[currentPlayer].alive = false
}

const numAlivePlayers = (players): number =>
  players.filter((p) => p.alive).length
