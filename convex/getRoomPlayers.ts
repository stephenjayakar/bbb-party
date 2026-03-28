import { query } from './_generated/server'
import { v } from 'convex/values'

export const getRoomPlayers = query({
  args: {
    roomName: v.string(),
  },
  handler: async ({ db }, { roomName }): Promise<string[]> => {
    const roomDoc = await db
      .query('rooms_table')
      .withIndex('by_name', (q) => q.eq('name', roomName))
      .unique()

    if (roomDoc === null) {
      return []
    }

    return roomDoc.players
  },
})
