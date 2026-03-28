import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const addPlayerToRoom = mutation({
  args: {
    room: v.string(),
    player: v.string(),
  },
  handler: async ({ db }, { room, player }) => {
    const roomDoc = await db
      .query('rooms_table')
      .withIndex('by_name', (q) => q.eq('name', room))
      .unique()

    if (roomDoc === null) {
      await db.insert('rooms_table', {
        name: room,
        players: [player],
      })
      return
    }

    await db.patch(roomDoc._id, {
      players: [...roomDoc.players, player],
    })
  },
})
