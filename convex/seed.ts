import { mutation } from './_generated/server';

export const seedLevels = mutation({
  args: {},
  handler: async (ctx) => {
    const existingLevels = await ctx.db.query('levels').collect();
    if (existingLevels.length > 0) {
      return { message: 'Already seeded' };
    }

    await ctx.db.insert('levels', {
      letter: 'A',
      positionIndex: 2,
      options: ['A', 'B', ''],
      isActive: true,
    });

    return { message: 'Seeded Level 1' };
  },
});