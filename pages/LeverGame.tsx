import { useState } from 'react'

import { useQuery, useMutation } from '../convex/_generated/react'

import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

const NO_PLAYER = -1
const NO_GAME_ID = ''
const BOMB_ANIMATION_TIME = 1500 // ms

interface LocalGameState {
  playerNumber: number
  gameID: string
  // used to queue a bomb animation
  numAlivePlayers: number
}

const dummyLocalState: LocalGameState = {
  playerNumber: NO_PLAYER,
  gameID: NO_GAME_ID,
  numAlivePlayers: 0,
}

const getNumAlivePlayers = (players: any): number => {
  if (players) {
    // TODO: abstract this to a common dir so we can re-use. do it after types.
    return players.filter((p: any) => p.alive).length
  }
  return 0
}

const LeverGame = () => {
  const gameState = useQuery('getGameState') ?? {}

  const joinGame = useMutation('joinGame')
  const restartGame = useMutation('restartGame')
  const startGame = useMutation('startGame')

  const numPlayers =
    gameState && gameState.players ? gameState.players.length : 0

  const [localGameState, setLocalGameState] = useState(dummyLocalState)

  const [displayBomb, setDisplayBomb] = useState(false)

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

  // If we detect a player dies. We do this by
  // observing a change in the # of dead players.
  // This also lets us update the variable constantly.
  const numAlivePlayers = getNumAlivePlayers(gameState.players)
  if (
    gameState &&
    gameState.players &&
    localGameState.numAlivePlayers !== numAlivePlayers
  ) {
    // Case where we show the bomb
    if (numAlivePlayers < localGameState.numAlivePlayers) {
      setDisplayBomb(true)
      setTimeout(() => {
        setDisplayBomb(false)
      }, BOMB_ANIMATION_TIME)
    }
    setLocalGameState({
      ...localGameState,
      numAlivePlayers,
    })
  }

  const gameInProgress = gameState && gameState.isStarted

  const joinGameButtonPressed = async () => {
    const joinGameResponse = await joinGame()

    setLocalGameState({
      ...localGameState,
      playerNumber: joinGameResponse.playerNumber,
      gameID: joinGameResponse.gameState._id.toString(),
    })
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
      <BombComponent displayBomb={displayBomb} />
      <h1>lever game: press the buttons!</h1>
      {numPlayers !== 0 && <p>Number of joined players: {numPlayers}</p>}
      <ButtonGroup>
      <Button
        disabled={numPlayers === 0}
        onClick={() => restartGame()}
      >
        Restart game
      </Button>
      <Button
        disabled={playerJoined || gameInProgress}
        onClick={() => joinGameButtonPressed()}
      >
        Join Game
      </Button>
      <Button
        disabled={!canStartGame}
        onClick={() => startGameButtonPressed()}
      >
        Start game
      </Button>
      </ButtonGroup>
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
          <span>
          {gameState.levers.map((lever: any, index: number) => (
            <LeverComponent
              lever={lever}
              key={index}
              leverNumber={index}
              flipLever={flipLeverButtonPressed}
            />
          ))}
          </span>
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

const BombComponent = (props: { displayBomb: boolean }) => {
  return <>{props.displayBomb && <div className="bomb">💣💥</div>}</>
}

export default LeverGame
