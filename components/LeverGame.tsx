import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MutableRefObject } from 'react'

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
const CLIENT_ID_STORAGE_KEY = 'bbb-party-client-id'
const LOCAL_GAME_STATE_STORAGE_KEY = 'bbb-party-local-game-state'
const PLAYER_NAME_STORAGE_KEY = 'bbb-party-player-name'
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
  playerName: string
  displayBomb: boolean
  displayConfetti: boolean
  onPlayerNameChange?: (_: string) => void
  onSavePlayerName?: () => void
  onJoinGame?: () => void
  onRestartGame?: () => void
  onRunItBack?: () => void
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
  players: [
    { alive: true, name: 'Mario' },
    { alive: false, name: 'Luigi' },
    { alive: true, name: 'Peach' },
    { alive: true, name: 'Yoshi' },
  ],
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

function playSafeTick (audioContextRef: MutableRefObject<AudioContext | null>) {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextCtor =
    window.AudioContext ??
    (
      window as Window & {
        webkitAudioContext?: typeof AudioContext
      }
    ).webkitAudioContext
  if (AudioContextCtor === undefined) {
    return
  }

  const audioContext = audioContextRef.current ?? new AudioContextCtor()
  audioContextRef.current = audioContext

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  const now = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(1240, now)
  oscillator.frequency.exponentialRampToValueAtTime(1720, now + 0.045)

  filter.type = 'highpass'
  filter.frequency.setValueAtTime(700, now)

  gainNode.gain.setValueAtTime(0.0001, now)
  gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.085)

  oscillator.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start(now)
  oscillator.stop(now + 0.09)
}

function playKaboom (audioContextRef: MutableRefObject<AudioContext | null>) {
  if (typeof window === 'undefined') {
    return
  }

  const AudioContextCtor =
    window.AudioContext ??
    (
      window as Window & {
        webkitAudioContext?: typeof AudioContext
      }
    ).webkitAudioContext
  if (AudioContextCtor === undefined) {
    return
  }

  const audioContext = audioContextRef.current ?? new AudioContextCtor()
  audioContextRef.current = audioContext

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  const now = audioContext.currentTime
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.45, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }

  const noiseSource = audioContext.createBufferSource()
  const noiseFilter = audioContext.createBiquadFilter()
  const noiseGain = audioContext.createGain()
  noiseSource.buffer = buffer
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.setValueAtTime(900, now)
  noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 0.32)
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.55, now + 0.02)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
  noiseSource.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(audioContext.destination)
  noiseSource.start(now)
  noiseSource.stop(now + 0.42)

  const boomOscillator = audioContext.createOscillator()
  const boomGain = audioContext.createGain()
  boomOscillator.type = 'sawtooth'
  boomOscillator.frequency.setValueAtTime(180, now)
  boomOscillator.frequency.exponentialRampToValueAtTime(42, now + 0.38)
  boomGain.gain.setValueAtTime(0.0001, now)
  boomGain.gain.exponentialRampToValueAtTime(0.24, now + 0.015)
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36)
  boomOscillator.connect(boomGain)
  boomGain.connect(audioContext.destination)
  boomOscillator.start(now)
  boomOscillator.stop(now + 0.38)
}

function readStoredLocalGameState (): LocalGameState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(LOCAL_GAME_STATE_STORAGE_KEY)
  if (rawValue === null) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<LocalGameState>
    if (
      typeof parsedValue.gameID === 'string' &&
      typeof parsedValue.playerNumber === 'number'
    ) {
      return {
        gameID: parsedValue.gameID,
        playerNumber: parsedValue.playerNumber,
      }
    }
  } catch (error) {
    console.error(error)
  }

  return null
}

function writeStoredLocalGameState (localGameState: LocalGameState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    LOCAL_GAME_STATE_STORAGE_KEY,
    JSON.stringify(localGameState)
  )
}

function clearStoredLocalGameState () {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(LOCAL_GAME_STATE_STORAGE_KEY)
}

function readStoredPlayerName () {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? ''
}

function writeStoredPlayerName (name: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name)
}

function getClientId () {
  if (typeof window === 'undefined') {
    return 'server'
  }

  const storedClientId = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY)
  if (storedClientId !== null) {
    return storedClientId
  }

  const newClientId = window.crypto.randomUUID()
  window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, newClientId)
  return newClientId
}

function LiveLeverGame () {
  const clientIdRef = useRef<string>(getClientId())
  const audioContextRef = useRef<AudioContext | null>(null)
  const gameStateResult = useQuery(api.getGameState.getGameState, {})
  const gameState = gameStateResult ?? undefined
  const gameStatePresent = gameState !== undefined
  const joinGame = useMutation(api.joinGame.joinGame)
  const restartGame = useMutation(api.restartGame.restartGame)
  const runItBack = useMutation(api.runItBack.runItBack)
  const setPlayerName = useMutation(api.setPlayerName.setPlayerName)
  const startGame = useMutation(api.startGame.startGame)
  const flipLever = useMutation(api.flipLever.flipLever)

  const numPlayers =
    gameStatePresent && gameState.players ? gameState.players.length : 0

  const [localGameState, setLocalGameState] = useState(dummyLocalState)
  const [displayBomb, setDisplayBomb] = useState(false)
  const [bombSequence, setBombSequence] = useState(0)
  const [displayConfetti, setDisplayConfetti] = useState(false)
  const [confettiSequence, setConfettiSequence] = useState(0)
  const [playerName, setPlayerNameInput] = useState(readStoredPlayerName())
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
      clearStoredLocalGameState()
    }
  }, [gameID, gameState, gameStatePresent])

  useEffect(() => {
    if (!gameState || localGameState.playerNumber !== NO_PLAYER) {
      return
    }

    const serverPlayerNumber = gameState.players.findIndex(
      (player) => player.clientId === clientIdRef.current
    )
    if (serverPlayerNumber !== -1) {
      const restoredState = {
        gameID: gameState._id.toString(),
        playerNumber: serverPlayerNumber,
      }
      setLocalGameState(restoredState)
      writeStoredLocalGameState(restoredState)
      lastLocalPlayerAlive.current = gameState.players[serverPlayerNumber]?.alive ?? true
      return
    }

    const storedLocalGameState = readStoredLocalGameState()
    if (
      storedLocalGameState !== null &&
      storedLocalGameState.gameID === gameState._id.toString() &&
      storedLocalGameState.playerNumber < gameState.players.length
    ) {
      setLocalGameState(storedLocalGameState)
      lastLocalPlayerAlive.current =
        gameState.players[storedLocalGameState.playerNumber]?.alive ?? true
    }
  }, [gameState, localGameState.playerNumber])

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
    const somebodyDied =
      lastAlivePlayers.current !== null && alivePlayers < lastAlivePlayers.current
    const nobodyDied =
      lastAlivePlayers.current !== null && alivePlayers === lastAlivePlayers.current

    if (gameState.isStarted && leversDropped && somebodyDied) {
      playKaboom(audioContextRef)
    }

    if (gameState.isStarted && leversDropped && nobodyDied) {
      playSafeTick(audioContextRef)
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

  useEffect(() => {
    if (localGameState.gameID === NO_GAME_ID) {
      return
    }

    writeStoredLocalGameState(localGameState)
  }, [localGameState])

  useEffect(() => {
    writeStoredPlayerName(playerName)
  }, [playerName])

  const savePlayerNameButtonPressed = () => {
    const trimmedPlayerName = playerName.trim()
    if (trimmedPlayerName === '') {
      return
    }

    setPlayerNameInput(trimmedPlayerName)

    if (localGameState.playerNumber !== NO_PLAYER) {
      void setPlayerName({
        clientId: clientIdRef.current,
        name: trimmedPlayerName,
      })
    }
  }

  const joinGameButtonPressed = async () => {
    try {
      const trimmedPlayerName = playerName.trim()
      const joinGameResponse = await joinGame({
        clientId: clientIdRef.current,
        name: trimmedPlayerName === '' ? 'Mystery Player' : trimmedPlayerName,
        numClientPlayers: numPlayers,
      })

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
    setLocalGameState(dummyLocalState)
    clearStoredLocalGameState()
  }

  const runItBackButtonPressed = () => {
    void runItBack({})
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
      playerName={playerName}
      displayBomb={displayBomb}
      displayConfetti={displayConfetti}
      onPlayerNameChange={setPlayerNameInput}
      onSavePlayerName={savePlayerNameButtonPressed}
      onJoinGame={joinGameButtonPressed}
      onRestartGame={restartGameButtonPressed}
      onRunItBack={runItBackButtonPressed}
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
        playerName="Peach"
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
    playerName,
    displayBomb,
    displayConfetti,
    onPlayerNameChange,
    onSavePlayerName,
    onJoinGame,
    onRestartGame,
    onRunItBack,
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
                <span className="playerName">{player.name ?? `Player ${index + 1}`}</span>
                <span className="playerState">{player.alive ? 'Ready' : 'Boom'}</span>
              </div>
            )
          })}
        </div>
      )}

      <ButtonGroup className="controlRow">
        <Button disabled={numPlayers === 0 || previewLabel !== undefined} onClick={onRestartGame}>
          Restart game
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
            {playerJoined && (
              <p>
                You are player {localGameState.playerNumber + 1}
                {playerName.trim() !== '' ? `, ${playerName.trim()}` : ''}
              </p>
            )}
          </Card.Title>
          {previewLabel === undefined && (
            <div className="nameControls">
              <input
                className="nameInput"
                maxLength={24}
                onChange={(event) => onPlayerNameChange?.(event.target.value)}
                placeholder="Name yourself"
                value={playerName}
              />
              <Button className="nameSaveButton" onClick={onSavePlayerName}>
                Save name
              </Button>
            </div>
          )}
          {!playerJoined && <p>Join in, then take turns pulling the levers.</p>}
          {gameStatePresent && gameInProgress && playerJoined && (
            <GameComponent
              gameState={gameState}
              playerNumber={localGameState.playerNumber}
              onFlipLever={onFlipLever}
              onRunItBack={onRunItBack}
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
  onRunItBack?: () => void
}) {
  const { playerNumber, gameState, onFlipLever, onRunItBack } = props
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
              <p>Game over. Hit run it back to replay with the same players.</p>
              {onRunItBack && (
                <Button className="runItBackButton" onClick={onRunItBack}>
                  Run it back
                </Button>
              )}
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
