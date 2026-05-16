import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const register = mutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query('profiles').collect();
    const nextId = profiles.length > 0 
      ? Math.max(...profiles.map(p => p.playerId || 0)) + 1 
      : 1;
    
    await ctx.db.insert('profiles', {
      playerId: nextId,
      currentLevel: 1,
      createdAt: Date.now(),
    });
    
    return { id: nextId };
  },
});

export const login = mutation({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query('profiles').collect();
    const profile = profiles.find((p: any) => p.playerId === args.id);
    
    if (!profile) {
      return { success: false };
    }
    
    return { success: true, profile };
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    return { loggedIn: false };
  },
});

export const getProfile = query({
  args: { id: v.number() },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query('profiles').collect();
    return profiles.find((p: any) => p.playerId === args.id);
  },
});

export const submitAnswer = mutation({
  args: { profileId: v.number(), levelId: v.number(), selectedOption: v.string() },
  handler: async (ctx, args) => {
    const levels = await ctx.db.query('levels').collect();
    let level = levels.find((l: any) => l.levelId === args.levelId);
    if (!level) level = levels[args.levelId - 1];
    
    if (!level) {
      return { correct: false, error: 'Level not found' };
    }
    
    const isCorrect = args.selectedOption.toUpperCase() === level.letter.toUpperCase();
    
    if (isCorrect) {
      const profiles = await ctx.db.query('profiles').collect();
      const profile = profiles.find((p: any) => p.playerId === args.profileId);
      
      if (profile) {
        await ctx.db.patch(profile._id, {
          currentLevel: args.levelId + 1,
        });
      }
      
      return { correct: true, advance: true, nextLevel: args.levelId + 1 };
    }
    
    return { correct: false, advance: false };
  },
});

export const getLevel = query({
  args: { levelId: v.number() },
  handler: async (ctx, args) => {
    const levels = await ctx.db.query('levels').collect();
    let level = levels.find((l: any) => l.levelId === args.levelId);
    if (!level) level = levels[args.levelId - 1];
    return level;
  },
});

export const getAllLevels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('levels').collect();
  },
});