import { useState, useEffect } from 'react'

import { startGame, dummyGameState, GameState, Lever } from './game'

// TODO: move constants -> game.ts
const NO_PLAYER = -1
const NUM_PLAYERS = 4

// This component should only hold "game started" as state
const LeverGame = () => {
  // TODO: Possibly merge this w/ an overloaded state object w/ personal information
  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER)
  const gameStarted = (): boolean => playerNumber !== NO_PLAYER

  const switchToGame = (newPlayerNumber: number) => {
    setPlayerNumber(newPlayerNumber)
  }

  if (gameStarted()) {
    return <GameComponent playerNumber={playerNumber} />
  } else {
    return <PickPlayerForm setPlayerNumber={switchToGame} />
  }
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
  const [gameState, setGameState] = useState<GameState>(dummyGameState())

  const restartGame = () => {
    setGameState(startGame(NUM_PLAYERS))
  }

  useEffect(() => {
    setGameState(startGame(NUM_PLAYERS))
    // We add a [] at the end of this to express that there are no dependencies.
    // This is necessary to only run this hook on the initial render, and not to
    // cause an infinite state set loop.
  }, [])

  const pressLever = (leverNumber: number) => {
    const newGameState = { ...gameState }
    const lever = gameState.levers[leverNumber]
    newGameState.levers[leverNumber].flipped = true
    setGameState(newGameState)
    if (lever.bomb) {
      alert('boom')
      setTimeout(() => setGameState(startGame(NUM_PLAYERS)), 1000)
    }
  }

  if (playerNumber !== NO_PLAYER) {
    return (
      <>
        <button onClick={() => restartGame()}>restart game</button>
        <div>
          <p>{JSON.stringify(gameState)}</p>
          {gameState.levers.map((lever, index) => (
            <LeverComponent
              key={index}
              pressLever={pressLever}
              leverNumber={index}
              lever={lever}
            />
          ))}
          <p>You are player {playerNumber}</p>
        </div>
      </>
    )
  } else {
    return <></>
  }
}

const LeverComponent = (props: {
  pressLever: (_: number) => void
  lever: Lever
  leverNumber: number
}) => {
  return (
    <button onClick={() => props.pressLever(props.leverNumber)}>
      <div className="lever" />
      {props.lever.flipped && <p>Meow</p>}
    </button>
  )
}

export default LeverGame
