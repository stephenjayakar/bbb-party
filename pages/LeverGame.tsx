import { useState } from 'react'

import { useQuery, useMutation } from '../convex/_generated/react'

import ButtonWeDidNotWrite from './ButtonWeDidNotWrite'

const NO_PLAYER = -1
const NO_GAME_ID = ''

interface LocalGameState {
  playerNumber: number
  gameID: string
}

const dummyLocalState: LocalGameState = {
  playerNumber: NO_PLAYER,
  gameID: NO_GAME_ID,
}

const LeverGame = () => {
  const gameState = useQuery('getGameState') ?? {}

  const joinGame = useMutation('joinGame')
  const restartGame = useMutation('restartGame')
  const startGame = useMutation('startGame')

  const numPlayers =
    gameState && gameState.players ? gameState.players.length : 0

  const [localGameState, setLocalGameState] = useState(dummyLocalState)
  const { playerNumber, gameID } = localGameState
  // We have local game state, but the game in progress
  // isn't the one that's stored locally, which means we have
  // to invalidate the localstate.
  if (
    gameID !== NO_GAME_ID &&
    gameState._id &&
    gameState._id.toString() !== gameID
  ) {
    setLocalGameState(dummyLocalState)
  }

  const gameInProgress = gameState && gameState.isStarted

  const joinGameButtonPressed = async () => {
    const localGameState = await joinGame()
    setLocalGameState(localGameState)
  }

  const canStartGame = numPlayers >= 2 && !gameInProgress
  const startGameButtonPressed = () => {
    if (canStartGame) {
      startGame()
    }
  }

  const playerJoined = playerNumber !== NO_PLAYER && playerNumber < numPlayers

  return (
    <div>
      <h1>lever game: press the buttons!</h1>
      {numPlayers !== 0 && <p>Number of joined players: {numPlayers}</p>}
      <ButtonWeDidNotWrite
        disabled={numPlayers === 0}
        onClick={() => restartGame()}
      >
        Restart game
      </ButtonWeDidNotWrite>
      <ButtonWeDidNotWrite
        disabled={playerJoined || gameInProgress}
        onClick={() => joinGameButtonPressed()}
      >
        Join Game
      </ButtonWeDidNotWrite>
      <ButtonWeDidNotWrite
        disabled={!canStartGame}
        onClick={() => startGameButtonPressed()}
      >
        Start game
      </ButtonWeDidNotWrite>
      <div className="leverGame">
        {playerJoined && <p>You are player {playerNumber}</p>}
        {gameInProgress && localGameState.playerNumber !== NO_PLAYER && (
          <GameComponent gameState={gameState} playerNumber={playerNumber} />
        )}
      </div>
    </div>
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

  const isPlayerTurn = !gameEnded && playerNumber === gameState.playerTurn

  const playerIsAlive = gameState.players[playerNumber].alive

  return (
    <>
      {isPlayerTurn && <p className="yourTurn">it is your turn!</p>}
      {!playerIsAlive && <p className="dead">💀 you are dead buddy 💀</p>}
      {gameEnded ? (
        <>
          {playerIsAlive && <p className="survived">😇 you survived!</p>}
          <p>Game over</p>
        </>
      ) : (
        <>
          <p>One of these levers is a 💣</p>
          {gameState.levers.map((lever: any, index: number) => (
            <LeverComponent
              lever={lever}
              key={index}
              leverNumber={index}
              flipLever={flipLeverButtonPressed}
            />
          ))}
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
    <button
      className="lever"
      onClick={() => props.flipLever(props.leverNumber)}
    >
      {props.lever.flipped ? '🟩' : '🟥'}
    </button>
  )
}

export default LeverGame
