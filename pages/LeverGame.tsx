import { useState } from 'react'

import { useQuery, useMutation } from '../convex/_generated/react'

const NO_PLAYER = -1

const LeverGame = () => {
  const gameState = useQuery('getGameState') ?? {}

  const joinGame = useMutation('joinGame')
  const restartGame = useMutation('restartGame')
  const startGame = useMutation('startGame')

  const numPlayers =
    gameState && gameState.players ? gameState.players.length : 0

  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER)

  const gameInProgress = gameState && gameState.isStarted

  const joinGameButtonPressed = async () => {
    await joinGame(numPlayers)
    setPlayerNumber(numPlayers)
  }

  const startGameButtonPressed = () => {
    startGame()
  }

  const playerJoined = playerNumber !== NO_PLAYER && playerNumber < numPlayers

  return (
    <>
      <button onClick={() => restartGame()}>Restart game</button>
      {playerJoined && <p>You are player {playerNumber}</p>}
      {gameInProgress ? (
        <GameComponent gameState={gameState} playerNumber={playerNumber} />
      ) : (
        <>
          {!playerJoined && (
            <button onClick={() => joinGameButtonPressed()}>Join Game</button>
          )}
          <button onClick={() => startGameButtonPressed()}>Start game</button>
        </>
      )}
    </>
  )
}

const GameComponent = (props: { playerNumber: number; gameState: any }) => {
  const { playerNumber, gameState } = props

  const flipLever = useMutation('flipLever')

  const flipLeverButtonPressed = (leverNumber: number) => {
    if (isPlayerTurn) {
      flipLever(leverNumber)
    }
  }

  const gameEnded = gameState
    ? gameState.isStarted && gameState.levers.length <= 2
    : false

  const isPlayerTurn = playerNumber === gameState.playerTurn

  const playerIsAlive = gameState.players[playerNumber].alive

  return (
    <>
      {isPlayerTurn && <p>It is your turn!</p>}
      {!playerIsAlive && <p>You are dead buddy</p>}
      {gameEnded ? (
        <p>Game over</p>
      ) : (
        <>
          {' '}
          {gameState.levers.map((lever: any, index: number) => (
            <LeverComponent
              key={index}
              leverNumber={index}
              lever={lever}
              flipLever={flipLeverButtonPressed}
            />
          ))}{' '}
        </>
      )}
    </>
  )
}

const LeverComponent = (props: {
  flipLever: (_: number) => void
  lever: any
  leverNumber: number
}) => {
  return (
    <button onClick={() => props.flipLever(props.leverNumber)}>
      <div className="lever" />
      {props.lever.flipped && <p>Flipped!</p>}
    </button>
  )
}

export default LeverGame
