import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, room: string, player: string) => {
    let roomDoc = await db
      .table('rooms_table')
      .filter((q) => q.eq(q.field('name'), room))
      .first()
    if (roomDoc === null) {
      roomDoc = {
        name: room,
        players: [player],
      }
      db.insert('rooms_table', roomDoc)
    } else {
      roomDoc.players.push(player)
      db.replace(roomDoc._id, roomDoc)
    }
    // Like console.log but relays log messages from the server to client.
    console.log(`Value of players is now ${roomDoc.players}`)
  }
)
