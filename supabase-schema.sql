-- Database Schema for Nephew Learning Game
-- Run this in Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_level INTEGER DEFAULT 1
);

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  letter VARCHAR(1) NOT NULL,
  position_index INTEGER NOT NULL DEFAULT 0,
  options TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Level 1: Letter A with 3 options
INSERT INTO levels (letter, position_index, options, is_active) VALUES
('A', 2, ARRAY['A', 'B', ''], true);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

-- Public read access for levels
CREATE POLICY "Public read levels" ON levels FOR SELECT USING (true);

-- Users can only access their own profile
CREATE POLICY "Users access own profile" ON profiles FOR ALL USING (auth.uid()::text = (current_setting('request.jwt.claims', true)::json->>'sub'));