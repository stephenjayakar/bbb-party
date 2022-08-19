import { useQuery, useMutation } from '../convex/_generated/react'
import LeverGame from './LeverGame'
import { useState, useEffect } from 'react'

enum RoomState {
    ROOM_CREATION,
    ROOM_LOBBY,
    GAME_STATE,
}

interface Room {
    state: RoomState,
}

const Room = () => {
  const [room, setRoom] = useState({state: RoomState.ROOM_CREATION})
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')

  const addPlayerToRoom = useMutation('addPlayerToRoom')
  const getRoomPlayers = useQuery('getRoomPlayers', roomName) ?? []

  const joinRoomLobby = (newRoomName: string, newPlayerName: string) => {
    setRoomName(newRoomName)
    setPlayerName(newPlayerName)
    addPlayerToRoom(newRoomName, newPlayerName)
    setRoom({state: RoomState.ROOM_LOBBY})
  }

  switch (room.state) {
    case RoomState.ROOM_CREATION:
        return <RoomCreationForm joinRoomLobby={joinRoomLobby} />
    case RoomState.ROOM_LOBBY:
        return <RoomLobby setRoom={setRoom} roomName={roomName} playerName={playerName} players={getRoomPlayers}/>
    case RoomState.GAME_STATE:
        return <LeverGame />
  }
}

const RoomCreationForm = (props: any) => {
  const [playerNameFormInput, setPlayerNameFormInput] = useState('')
  const [roomNameFormInput, setRoomNameFormInput] = useState('')
  return (
        <>
            <p>What's your player name?</p>
            <input onChange={(e) => setPlayerNameFormInput(e.target.value)} />
            <p>What do you want your room to be named?</p>
            <input onChange={(e) => setRoomNameFormInput(e.target.value)} />
            <button onClick={() => props.joinRoomLobby(roomNameFormInput, playerNameFormInput)}>
                Submit
            </button>
        </>
  )
}

const RoomLobby = (props: any) => {
  const players = props.players.toString()
  return (
        <>
            <p><strong>Room name: </strong>{props.roomName}</p>
            <p>Your name is: <strong>{props.playerName}</strong></p>
            <p>Current Players: {players}</p>
            <button onClick={() => props.setRoom({state: RoomState.GAME_STATE})}>
                Begin Game
            </button>
        </>
  )
}

export default Room
