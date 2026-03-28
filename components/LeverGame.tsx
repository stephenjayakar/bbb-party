import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Card from 'react-bootstrap/Card'

import { Player, Lever, GameState } from '../convex/common'

const NO_PLAYER = -1
const NO_GAME_ID = ''
const BOMB_ANIMATION_TIME = 1500 // ms
const CONFETTI_ANIMATION_TIME = 1200 // ms
const LEVER_COLORS = ['red', 'purple', 'yellow', 'green', 'white'] as const

interface LocalGameState {
  playerNumber: number
  gameID: string
}

interface LeverGameProps {
  preview?: 'midgame'
}

interface GameShellProps {
  gameState?: GameState
  localGameState: LocalGameState
  displayBomb: boolean
  displayConfetti: boolean
  onJoinGame?: () => void
  onRestartGame?: () => void
  onStartGame?: () => void
  onFlipLever?: (_: number) => void
  previewLabel?: string
}

const dummyLocalState: LocalGameState = {
  playerNumber: NO_PLAYER,
  gameID: NO_GAME_ID,
}

const mockMidgameState: GameState = {
  isStarted: true,
  playerTurn: 2,
  players: [{ alive: true }, { alive: false }, { alive: true }, { alive: true }],
  levers: [
    { bomb: false, flipped: true },
    { bomb: false, flipped: false },
    { bomb: false, flipped: true },
    { bomb: false, flipped: false },
    { bomb: true, flipped: false },
  ],
}

const mockMidgameLocalState: LocalGameState = {
  playerNumber: 2,
  gameID: 'preview-midgame',
}

function getNumAlivePlayers (players: Player[]): number {
  if (players) {
    return players.filter((player) => player.alive).length
  }
  return 0
}

function LiveLeverGame () {
  const gameStateResult = useQuery(api.getGameState.getGameState, {})
  const gameState = gameStateResult ?? undefined
  const gameStatePresent = gameState !== undefined
  const joinGame = useMutation(api.joinGame.joinGame)
  const restartGame = useMutation(api.restartGame.restartGame)
  const startGame = useMutation(api.startGame.startGame)
  const flipLever = useMutation(api.flipLever.flipLever)

  const numPlayers =
    gameStatePresent && gameState.players ? gameState.players.length : 0

  const [localGameState, setLocalGameState] = useState(dummyLocalState)
  const [displayBomb, setDisplayBomb] = useState(false)
  const [bombSequence, setBombSequence] = useState(0)
  const [displayConfetti, setDisplayConfetti] = useState(false)
  const [confettiSequence, setConfettiSequence] = useState(0)
  const lastLocalPlayerAlive = useRef<boolean | null>(null)
  const lastAlivePlayers = useRef<number | null>(null)
  const lastLeversRemaining = useRef<number | null>(null)

  const { playerNumber, gameID } = localGameState

  useEffect(() => {
    if (
      gameID !== NO_GAME_ID &&
      gameStatePresent &&
      gameState._id &&
      gameState._id.toString() !== gameID
    ) {
      setLocalGameState(dummyLocalState)
    }
  }, [gameID, gameState, gameStatePresent])

  useEffect(() => {
    if (!gameState) {
      lastAlivePlayers.current = null
      lastLeversRemaining.current = null
      return
    }

    const alivePlayers = getNumAlivePlayers(gameState.players)
    const leversRemaining = gameState.levers.filter((lever) => !lever.flipped).length
    const leversDropped =
      lastLeversRemaining.current !== null && leversRemaining < lastLeversRemaining.current
    const nobodyDied =
      lastAlivePlayers.current !== null && alivePlayers === lastAlivePlayers.current

    if (gameState.isStarted && leversDropped && nobodyDied) {
      setDisplayConfetti(true)
      setConfettiSequence((currentSequence) => currentSequence + 1)
    }

    lastAlivePlayers.current = alivePlayers
    lastLeversRemaining.current = leversRemaining
  }, [gameState])

  useEffect(() => {
    if (!gameState || playerNumber === NO_PLAYER || playerNumber >= gameState.players.length) {
      lastLocalPlayerAlive.current = null
      return
    }

    const localPlayerAlive = gameState.players[playerNumber].alive
    if (lastLocalPlayerAlive.current === true && !localPlayerAlive) {
      setDisplayBomb(true)
      setBombSequence((currentSequence) => currentSequence + 1)
    }

    lastLocalPlayerAlive.current = localPlayerAlive
  }, [gameState, playerNumber])

  useEffect(() => {
    if (!displayBomb) {
      return
    }

    const timeout = setTimeout(() => {
      setDisplayBomb(false)
    }, BOMB_ANIMATION_TIME)

    return () => clearTimeout(timeout)
  }, [bombSequence, displayBomb])

  useEffect(() => {
    if (!displayConfetti) {
      return
    }

    const timeout = setTimeout(() => {
      setDisplayConfetti(false)
    }, CONFETTI_ANIMATION_TIME)

    return () => clearTimeout(timeout)
  }, [confettiSequence, displayConfetti])

  const joinGameButtonPressed = async () => {
    try {
      const joinGameResponse = await joinGame({ numClientPlayers: numPlayers })

      setLocalGameState({
        ...dummyLocalState,
        playerNumber: joinGameResponse.playerNumber,
        gameID: joinGameResponse.gameState._id.toString(),
      })
      lastLocalPlayerAlive.current =
        joinGameResponse.gameState.players[joinGameResponse.playerNumber]?.alive ?? true
    } catch (error) {
      console.log(error)
    }
  }

  const canStartGame = numPlayers >= 2 && !gameState?.isStarted
  const startGameButtonPressed = () => {
    if (canStartGame) {
      void startGame({})
    }
  }

  const restartGameButtonPressed = () => {
    void restartGame({})
    setDisplayBomb(false)
    setDisplayConfetti(false)
  }

  const flipLeverButtonPressed = (leverNumber: number) => {
    if (gameState) {
      const isPlayerTurn = playerNumber === gameState.playerTurn
      const gameEnded = gameState.isStarted && gameState.levers.length <= 2
      if (isPlayerTurn && !gameEnded) {
        void flipLever({ leverNumber })
      }
    }
  }

  return (
    <GameShell
      gameState={gameState}
      localGameState={localGameState}
      displayBomb={displayBomb}
      displayConfetti={displayConfetti}
      onJoinGame={joinGameButtonPressed}
      onRestartGame={restartGameButtonPressed}
      onStartGame={startGameButtonPressed}
      onFlipLever={flipLeverButtonPressed}
    />
  )
}

export function LeverGamePreview ({ preview }: LeverGameProps) {
  if (preview === 'midgame') {
    return (
      <GameShell
        gameState={mockMidgameState}
        localGameState={mockMidgameLocalState}
        displayBomb={false}
        displayConfetti={false}
        previewLabel="mocked mid-game state"
      />
    )
  }

  return <LiveLeverGame />
}

function GameShell (props: GameShellProps) {
  const {
    gameState,
    localGameState,
    displayBomb,
    displayConfetti,
    onJoinGame,
    onRestartGame,
    onStartGame,
    onFlipLever,
    previewLabel,
  } = props

  const gameStatePresent = gameState !== undefined
  const numPlayers = gameStatePresent ? gameState.players.length : 0
  const numAlivePlayers = gameStatePresent
    ? getNumAlivePlayers(gameState.players)
    : 0
  const gameInProgress = Boolean(gameState?.isStarted)
  const gameEnded = Boolean(gameState?.isStarted && gameState.levers.length <= 2)
  const leversRemaining = gameStatePresent
    ? gameState.levers.filter((lever) => !lever.flipped).length
    : 0
  const playerJoined =
    localGameState.playerNumber !== NO_PLAYER && localGameState.playerNumber < numPlayers
  const canStartGame = numPlayers >= 2 && !gameInProgress
  const turnPlayer = gameStatePresent ? gameState.playerTurn ?? 0 : 0

  return (
    <section className="leverGame shell">
      <BombComponent displayBomb={displayBomb} />
      <div className="bowserBackdrop" aria-hidden="true">
        <img className="bowserSeal bowserSealLeft" src="/bowser-medallion.svg" alt="" />
        <img className="bowserSeal bowserSealRight" src="/bowser-medallion.svg" alt="" />
        <div className="chain chainLeft" />
        <div className="chain chainRight" />
        <div className="torch torchLeft" />
        <div className="torch torchRight" />
      </div>

      <div className="gameHero">
        {previewLabel && <p className="previewPill">{previewLabel}</p>}
        <p className="eyebrow">Bowser&apos;s Big Blast study</p>
        <h1 className="gameTitle">Pick a lever. Hope Bowser misses.</h1>
        <p className="gameSubtitle">
          Based on the Bowser&apos;s Big Blast setup: giant bomb up top, color
          plungers below, last player standing wins.
        </p>
      </div>

      <div className="bossStage">
        <div className="bowserHostWrap">
          <div className="bowserSpeech">Pick one if you dare!</div>
          <img className="bowserHostArt" src="/bowser-host.svg" alt="Bowser" />
        </div>
        <div className="bombRig">
          <div className="bombAura" />
          <ConfettiBurst displayConfetti={displayConfetti} />
          <img className="bowserBombArt" src="/bowser-bomb.svg" alt="Bowser bomb" />
          <div className="bombShadow" />
        </div>
        <div className="stageReadout">
          <span className="stagePip" />
          <span>Turn player {turnPlayer + 1}</span>
          <span className="stageDivider" />
          <span>{leversRemaining} plungers armed</span>
        </div>
      </div>

      <div className="gameHud">
        <div className="hudChip">
          <span className="hudLabel">Players</span>
          <strong>{numPlayers}</strong>
        </div>
        <div className="hudChip">
          <span className="hudLabel">Alive</span>
          <strong>{numAlivePlayers}</strong>
        </div>
        <div className="hudChip">
          <span className="hudLabel">Levers left</span>
          <strong>{leversRemaining}</strong>
        </div>
      </div>

      {gameStatePresent && (
        <div className="playerLineup">
          {gameState.players.map((player, index) => {
            const isCurrentPlayer = turnPlayer === index
            const isSelf = localGameState.playerNumber === index
            return (
              <div
                key={index}
                className={[
                  'playerMarker',
                  player.alive ? 'playerAlive' : 'playerOut',
                  isCurrentPlayer ? 'playerCurrent' : '',
                  isSelf ? 'playerSelf' : '',
                ].filter(Boolean).join(' ')}
              >
                <span className="playerCap">P{index + 1}</span>
                <span className="playerState">{player.alive ? 'Ready' : 'Boom'}</span>
              </div>
            )
          })}
        </div>
      )}

      <ButtonGroup className="controlRow">
        <Button disabled={numPlayers === 0 || previewLabel !== undefined} onClick={onRestartGame}>
          {gameEnded ? 'Run it back' : 'Restart game'}
        </Button>
        <Button
          disabled={playerJoined || gameInProgress || previewLabel !== undefined}
          onClick={onJoinGame}
        >
          Join Game
        </Button>
        <Button
          disabled={!canStartGame || previewLabel !== undefined}
          onClick={onStartGame}
        >
          Start game
        </Button>
      </ButtonGroup>
      <Card bg="light" className="gameCard">
        <Card.Body>
          <Card.Title>
            {playerJoined && <p>You are player {localGameState.playerNumber + 1}</p>}
          </Card.Title>
          {!playerJoined && <p>Join in, then take turns pulling the levers.</p>}
          {gameStatePresent && gameInProgress && playerJoined && (
            <GameComponent
              gameState={gameState}
              playerNumber={localGameState.playerNumber}
              onFlipLever={onFlipLever}
            />
          )}
          {!gameInProgress && numPlayers >= 2 && (
            <p className="readyMessage">
              Everybody is in - hit start for the showdown.
            </p>
          )}
        </Card.Body>
      </Card>
    </section>
  )
}

function GameComponent (props: {
  playerNumber: number
  gameState: GameState
  onFlipLever?: (_: number) => void
}) {
  const { playerNumber, gameState, onFlipLever } = props
  const gameEnded = gameState.isStarted && gameState.levers.length <= 2
  const isPlayerTurn = !gameEnded && playerNumber === gameState.playerTurn
  const playerIsAlive = gameState.players[playerNumber].alive

  const flipLeverButtonPressed = (leverNumber: number) => {
    if (isPlayerTurn && onFlipLever) {
      onFlipLever(leverNumber)
    }
  }

  return (
    <>
      {isPlayerTurn ? (
        <Alert variant="success" className="turnBanner">
          it is your turn!
        </Alert>
      ) : (
        <p className="turnMessage">It is player {(gameState.playerTurn ?? 0) + 1}&apos;s turn</p>
      )}
      {!playerIsAlive && (
        <Alert variant="danger">💀 you are dead buddy 💀</Alert>
      )}
      {gameEnded ? (
        <>
          {playerIsAlive && <p className="survived">😇 you survived!</p>}
          <p>Game over. Hit restart game to run it back with the same players.</p>
        </>
      ) : (
        <>
          <Card.Subtitle className="roundSubtitle">
            One of these levers is a 💣
          </Card.Subtitle>
          <div className="leverBoard">
            {gameState.levers.map((lever, index: number) => (
              <LeverComponent
                lever={lever}
                key={index}
                leverNumber={index}
                flipLever={flipLeverButtonPressed}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}

function LeverComponent (props: {
  flipLever: (_: number) => void
  lever: Lever
  leverNumber: number
}) {
  const leverColor = LEVER_COLORS[props.leverNumber] ?? 'red'

  return (
    <button
      className={[
        'lever',
        `leverColor${leverColor[0].toUpperCase()}${leverColor.slice(1)}`,
        props.lever.flipped ? 'leverFlipped' : 'leverReady',
      ].join(' ')}
      onClick={() => props.flipLever(props.leverNumber)}
    >
      <span className="leverPlunger" />
      <span className="leverStem" />
      <span className="leverBase" />
      <span className="leverLabel">{leverColor}</span>
    </button>
  )
}

function BombComponent (props: { displayBomb: boolean }) {
  return (
    <>
      {props.displayBomb && (
        <div className="bomb">
          <div className="bombFlashWrap">
            <img className="bombFlashArt" src="/bowser-bomb.svg" alt="Exploding Bowser bomb" />
            <div className="bombFlashBurst">KABOOM</div>
          </div>
        </div>
      )}
    </>
  )
}

function ConfettiBurst (props: { displayConfetti: boolean }) {
  if (!props.displayConfetti) {
    return null
  }

  return (
    <div className="confettiBurst" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className={`confettiPiece confettiPiece${(index % 6) + 1}`}
          style={
            {
              '--confetti-index': index,
              '--confetti-rotate': `${(index % 2 === 0 ? 1 : -1) * (18 + index * 4)}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default function LeverGame () {
  return <LeverGamePreview />
}
