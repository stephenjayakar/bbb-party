import {
  useState,
  // useEffect,
} from 'react'

import { startGame } from './game'

// TODO: move constants -> game.ts
const NO_PLAYER = -1
const NUM_PLAYERS = 4

const LeverGame = () => {
  // TODO: Possibly merge this w/ an overloaded state object w/ personal information
  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER)
  const gameStarted = (): boolean => playerNumber !== NO_PLAYER

  const switchToGame = (newPlayerNumber: number) => {
    setPlayerNumber(newPlayerNumber)
  }

  return (
    <div>
      {gameStarted() ? (
        <PickPlayerForm setPlayerNumber={switchToGame} />
      ) : (
        <GameComponent playerNumber={playerNumber} />
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

// TODO: i think this should handle managing the game state.
const GameComponent = (props: { playerNumber: number }) => {
  const { playerNumber } = props
  const [gameState, setGameState] = useState(startGame(NUM_PLAYERS))

  const restartGame = () => {
    setGameState(startGame(NUM_PLAYERS))
  }

  /* useEffect(() => {
   *   setGameState(startGame(NUM_PLAYERS));
   * }); */

  const pressLever = (leverNumber: number) => {
    console.log(leverNumber)
  }

  return (
    <>
      <button onClick={() => restartGame()}>restart game</button>
      <div>
        <p>{JSON.stringify(gameState)}</p>
        {gameState.levers.map((lever, index) => (
          <Lever key={index} pressLever={pressLever} leverNumber={index} />
        ))}
        <p>{playerNumber}</p>
      </div>
    </>
  )
}

const Lever = (props: {
  pressLever: (_: number) => void
  leverNumber: number
}) => {
  return (
    <button onClick={() => props.pressLever(props.leverNumber)}>
      <div className="lever" />
    </button>
  )
}

export default LeverGame
