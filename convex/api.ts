import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const register = mutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query('profiles').collect();
    const nextId = profiles.length > 0 
      ? Math.max(...profiles.map(p => (p as any)._id)) + 1 
      : 1;
    
    const profileId = await ctx.db.insert('profiles', {
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
    const profile = profiles.find((p: any) => p._id === args.id);
    
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
    return profiles.find((p: any) => p._id === args.id);
  },
});

export const submitAnswer = mutation({
  args: { profileId: v.number(), levelId: v.number(), selectedOption: v.string() },
  handler: async (ctx, args) => {
    const levels = await ctx.db.query('levels').collect();
    const level = levels.find((l: any) => l._id === args.levelId);
    
    if (!level) {
      return { correct: false, error: 'Level not found' };
    }
    
    const isCorrect = args.selectedOption.toUpperCase() === level.letter.toUpperCase();
    
    if (isCorrect) {
      const profiles = await ctx.db.query('profiles').collect();
      const profile = profiles.find((p: any) => p._id === args.profileId);
      
      if (profile) {
        await ctx.db.patch(args.profileId, {
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
    return levels.find((l: any) => l._id === args.levelId);
  },
});

export const getAllLevels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('levels').collect();
  },
});