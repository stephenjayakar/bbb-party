import { useState } from 'react'

import { startGame, GameState } from './game'

// TODO: move constants -> game.ts
const NO_PLAYER = -1
const NUM_PLAYERS = 4

const LeverGame = () => {
  // TODO: Possibly merge this w/ an overloaded state object w/ personal information
  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER)
  const [gameState, setGameState] = useState({})

  const switchToGame = (newPlayerNumber: number) => {
    setPlayerNumber(newPlayerNumber)
    setGameState(startGame(NUM_PLAYERS))
  }

  const restartGame = () => {
    setGameState(startGame(NUM_PLAYERS))
  }

  return (
    <div>
      {playerNumber === NO_PLAYER && gameState
        ? (
        <PickPlayerForm setPlayerNumber={switchToGame} />
          )
        : (
          <GameComponent
            gameState={gameState}
            playerNumber={playerNumber}
            restartGame={restartGame}
          />
          )}
    </div>
  )
}

const PickPlayerForm = (props: any) => {
  const [playerNumber, setPlayerNumber] = useState('')

  return (
    <>
      <p>What player are you?</p>
      <input onChange={(e) => setPlayerNumber(e.target.value)} />
      <button onClick={() => props.setPlayerNumber(playerNumber)}>
        Submit
      </button>
    </>
  )
}

const GameComponent = (props: {
  gameState: GameState,
  playerNumber: number,
  restartGame: () => void,
}) => {
  const { gameState, playerNumber } = props
  return (
    <>
    <button
      onClick={() => props.restartGame()}
    >restart game</button>
    {gameState
      ? (
      <div>
        <p>{JSON.stringify(gameState)}</p>
        {gameState.levers.map((lever) => (
          <Lever />
        ))}
        <p>{playerNumber}</p>
      </div>
        )
      : (<div />)}
    </>
  )
}

const Lever = () => {
  return (
    <button>
      <div className='lever' />
    </button>
  )
}

export default LeverGame
