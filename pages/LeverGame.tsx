import {
  useState,
  //  useEffect,
} from 'react'

/* import {
 *   startGame,
 *   dummyGameState,
 *   GameState,
 *   Lever,
 * } from './game' */
import { useQuery, useMutation } from '../convex/_generated/react'

const NO_PLAYER = -1

// This component should only hold "game started" as state
const LeverGame = () => {
  const gameState = useQuery('getGameState') ?? {}

  const joinGame = useMutation('joinGame')
  const restartGame = useMutation('restartGame')
  const startGame = useMutation('startGame')

  const gameStarted = gameState && gameState.isStarted

  const numPlayers =
    gameState && gameState.players ? gameState.players.length : 0

  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER)

  console.log(gameState)

  const joinGameButtonPressed = async () => {
    await joinGame()
    setPlayerNumber(numPlayers)
  }

  const startGameButtonPressed = () => {
    startGame()
  }

  const playerJoined = () =>
    playerNumber !== NO_PLAYER && playerNumber < numPlayers

  return (
    <>
      <button onClick={() => restartGame()}>Restart game</button>
      {playerJoined() && <p>You are player {playerNumber}</p>}
      {gameStarted ? (
        <GameComponent gameState={gameState} playerNumber={playerNumber} />
      ) : (
        <>
          <button onClick={() => joinGameButtonPressed()}>Join Game</button>
          <button onClick={() => startGameButtonPressed()}>Start game</button>
        </>
      )}
    </>
  )
}

// TODO: i think this should handle managing the game state.
const GameComponent = (props: { playerNumber: number; gameState: any }) => {
  const { playerNumber, gameState } = props

  const pressLever = useMutation('pressLever')

  const pressLeverButtonPressed = (leverNumber: number) => {
    if (isPlayerTurn()) {
      pressLever(leverNumber)
    }
  }

  const isPlayerTurn = () => playerNumber === gameState.playerTurn

  return (
    <>
      {isPlayerTurn() && <p>It is your turn!</p>}
      {gameState.levers.map((lever, index) => (
        <LeverComponent
          key={index}
          leverNumber={index}
          lever={lever}
          pressLever={pressLeverButtonPressed}
        />
      ))}
    </>
  )
  /* const [gameState, setGameState] = useState<GameState>(dummyGameState())

* const restartGame = () => {
*     setGameState(startGame(NUM_PLAYERS))
* }

* useEffect(() => {
*     setGameState(startGame(NUM_PLAYERS))
*     // We add a [] at the end of this to express that there are no dependencies.
*     // This is necessary to only run this hook on the initial render, and not to
*     // cause an infinite state set loop.
* }, [])

* if (playerNumber !== NO_PLAYER) {
*     return (
*         <>
*             <button onClick={() => restartGame()}>restart game</button>
*             <div>
*                 <p>{JSON.stringify(gameState)}</p>
*                 <p>You are player {playerNumber}</p>
*             </div>
*         </>
*     )
* } else {
*     return <></>
* } */
}

const LeverComponent = (props: {
  pressLever: (_: number) => void
  lever: any
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
