import { useState } from 'react'
import { useQuery, useMutation } from '../convex/_generated/react'

const Room = () => {
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')

  const addPlayerToRoom = useMutation('addPlayerToRoom')
  const getRoomPlayers = useQuery('getRoomPlayers', roomName) ?? []

  const joinedRoom = (): boolean => roomName !== ''
  const joinRoom = (newRoomName: string, newPlayerName: string) => {
    setRoomName(newRoomName)
    setPlayerName(newPlayerName)
    addPlayerToRoom(newRoomName, newPlayerName)
  }

  if (joinedRoom()) {
    return (
      <RoomLobby
        roomName={roomName}
        players={getRoomPlayers}
        playerName={playerName}
      />
    )
  } else {
    return <RoomCreation joinRoom={joinRoom} />
  }
}

const RoomCreation = (props: any) => {
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')

  return (
    <>
      <p>What is your player name?</p>
      <input onChange={(e) => setPlayerName(e.target.value)} />
      <p>What do you want your room to be named?</p>
      <input onChange={(e) => setRoomName(e.target.value)} />
      <button onClick={() => props.joinRoom(roomName, playerName)}>
        Submit
      </button>
    </>
  )
}

const RoomLobby = (props: any) => {
  const players = props.players.toString()
  const playerName = props.playerName
  return (
    <>
      <p>
        <strong>Room Name: </strong>
        {props.roomName}
      </p>
      <p>Current Players: {players}</p>
      <p>Player name: {playerName}</p>
    </>
  )
}

export default Room
