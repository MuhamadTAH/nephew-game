# Nephew's Learning Game

A simple learning game for children to learn letters using a PlayStation controller.

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings > API

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SESSION_SECRET=any_random_string
```

### 3. Run the Game

```bash
npm install
npm run build
npm start
```

The game will be available at `http://localhost:3000`

### 4. Adding More Levels

In Supabase, insert more levels:

```sql
INSERT INTO levels (letter, position_index, options, is_active) VALUES
('B', 0, ARRAY['B', 'A', ''], true),
('C', 1, ARRAY['C', 'B', ''], true);
```

## How to Play

1. Open the game and click "New Player" to get an ID
2. Remember the ID (it never expires)
3. Use the PS controller D-pad to move the selection box
4. Press X to confirm your answer
5. Correct answers advance to the next level
6. Wrong answers retry the same level