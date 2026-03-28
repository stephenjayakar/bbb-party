import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  game_table: defineTable({
    players: v.array(
      v.object({
        alive: v.boolean(),
        clientId: v.optional(v.string()),
        name: v.optional(v.string()),
      })
    ),
    levers: v.array(
      v.object({
        bomb: v.boolean(),
        flipped: v.boolean(),
      })
    ),
    isStarted: v.boolean(),
    playerTurn: v.optional(v.number()),
  }),
  rooms_table: defineTable({
    name: v.string(),
    players: v.array(v.string()),
  }).index('by_name', ['name']),
})
