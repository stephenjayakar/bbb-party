import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { GAME_TABLE, createLevers, GameStateWithID, Lever, Player } from './common'

export const flipLever = mutation({
  args: {
    leverNumber: v.number(),
  },
  handler: async ({ db }, { leverNumber }) => {
    const gameState = await db.query(GAME_TABLE).first()
    if (gameState === null) {
      return
    }

    const lever = gameState.levers[leverNumber]
    if (!lever || !canFlipLever(lever)) {
      return
    }

    lever.flipped = true
    if (lever.bomb) {
      killCurrentPlayer(gameState)
    }

    const numPlayers = numAlivePlayers(gameState.players)
    gameState.playerTurn = nextPlayer(gameState.playerTurn ?? 0, gameState.players)
    if (unflippedLevers(gameState.levers) === 1 || lever.bomb) {
      gameState.levers = createLevers(numPlayers + 1)
    }

    await db.replace(gameState._id, gameState)
  },
})

const canFlipLever = (lever: Lever) => !lever.flipped

const unflippedLevers = (levers: Lever[]): number =>
  levers.filter((l) => !l.flipped).length

// returns an index to the next alive player. also goes
// in a circle through the array.
const nextPlayer = (currentPlayer: number, players: Player[]): number => {
  for (let i = 1; i < players.length; ++i) {
    const possibleNextPlayer = (currentPlayer + i) % players.length
    if (players[possibleNextPlayer].alive) {
      return possibleNextPlayer
    }
  }
  throw new Error('something went wrong with selecting the next player')
}

const killCurrentPlayer = (gameState: GameStateWithID) => {
  const currentPlayer = gameState.playerTurn ?? 0
  gameState.players[currentPlayer].alive = false
}

const numAlivePlayers = (players: Player[]): number =>
  players.filter((player) => player.alive).length
