import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  profiles: defineTable({
    playerId: v.optional(v.number()),
    currentLevel: v.number(),
    createdAt: v.number(),
  }),

  levels: defineTable({
    levelId: v.optional(v.number()),
    letter: v.string(),
    positionIndex: v.number(),
    options: v.array(v.string()),
    isActive: v.boolean(),
  }),
});