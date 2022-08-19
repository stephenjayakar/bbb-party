import { useState } from 'react'

import { useQuery, useMutation } from '../convex/_generated/react'

import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Card from 'react-bootstrap/Card'

import { Player, Lever, GameState } from '../convex/common'

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

const getNumAlivePlayers = (players: Player[]): number => {
  if (players) {
    // TODO: abstract this to a common dir so we can re-use. do it after types.
    return players.filter((p) => p.alive).length
  }
  return 0
}

const LeverGame = () => {
  const gameState = useQuery('getGameState') ?? undefined
  const gameStatePresent = gameState !== undefined
  const joinGame = useMutation('joinGame')
  const restartGame = useMutation('restartGame')
  const startGame = useMutation('startGame')

  const numPlayers =
    gameStatePresent && gameState.players ? gameState.players.length : 0

  const [localGameState, setLocalGameState] = useState(dummyLocalState)

  const [displayBomb, setDisplayBomb] = useState(false)

  const { playerNumber, gameID } = localGameState
  // We have local game state, but the game in progress
  // isn't the one that's stored locally, which means we have
  // to invalidate the localstate.
  if (
    gameID !== NO_GAME_ID &&
    gameStatePresent &&
    gameState._id &&
    gameState._id.toString() !== gameID
  ) {
    setLocalGameState(dummyLocalState)
  }

  // If we detect a player dies. We do this by
  // observing a change in the # of dead players.
  // This also lets us update the variable constantly.
  const numAlivePlayers = gameStatePresent
    ? getNumAlivePlayers(gameState.players)
    : 0
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
    try {
      const joinGameResponse = await joinGame(numPlayers)

      setLocalGameState({
        ...localGameState,
        playerNumber: joinGameResponse.playerNumber,
        gameID: joinGameResponse.gameState._id.toString(),
      })
    } catch (error) {
      // Probably only happens if someone presses the button too fast
      console.log(error)
    }
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
        <Button disabled={numPlayers === 0} onClick={() => restartGame()}>
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
      <Card bg="light">
        <Card.Body>
          <Card.Title>
            {playerJoined && <p>You are player {playerNumber}</p>}
          </Card.Title>
          {gameInProgress && localGameState.playerNumber !== NO_PLAYER && (
            <GameComponent gameState={gameState} playerNumber={playerNumber} />
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

const GameComponent = (props: {
  playerNumber: number
  gameState: GameState
}) => {
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
      {isPlayerTurn && <Alert variant="success">it is your turn!</Alert>}
      {!playerIsAlive && (
        <Alert variant="danger">💀 you are dead buddy 💀</Alert>
      )}
      {gameEnded ? (
        <>
          {playerIsAlive && <p className="survived">😇 you survived!</p>}
          <p>Game over</p>
        </>
      ) : (
        <>
          <Card.Subtitle>One of these levers is a 💣</Card.Subtitle>
          <span>
            {gameState.levers.map((lever, index: number) => (
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
  lever: Lever
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
