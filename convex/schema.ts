import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  profiles: defineTable({
    currentLevel: v.number(),
    createdAt: v.number(),
  }),

  levels: defineTable({
    letter: v.string(),
    positionIndex: v.number(),
    options: v.array(v.string()),
    isActive: v.boolean(),
  }),
});