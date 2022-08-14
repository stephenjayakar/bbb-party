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
  // The game in progress isn't the one that's stored locally, which means we have
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

  const startGameButtonPressed = () => {
    startGame()
  }

  const playerJoined = playerNumber !== NO_PLAYER && playerNumber < numPlayers

  return (
    <div className="leverGame">
      <h1>lever game</h1>
      <ButtonWeDidNotWrite onClick={() => restartGame()}>
        Restart game
      </ButtonWeDidNotWrite>
      {playerJoined && <p>You are player {playerNumber}</p>}
      {gameInProgress ? (
        <GameComponent gameState={gameState} playerNumber={playerNumber} />
      ) : (
        <>
          {!playerJoined && (
            <ButtonWeDidNotWrite onClick={() => joinGameButtonPressed()}>
              Join Game
            </ButtonWeDidNotWrite>
          )}
          <ButtonWeDidNotWrite onClick={() => startGameButtonPressed()}>
            Start game
          </ButtonWeDidNotWrite>
        </>
      )}
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
    <ButtonWeDidNotWrite onClick={() => props.flipLever(props.leverNumber)}>
      <div className="lever" />
      {props.lever.flipped && <p>Flipped!</p>}
    </ButtonWeDidNotWrite>
  )
}

export default LeverGame
