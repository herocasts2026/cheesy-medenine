/*
# Daily order counter — resets to 1 at the start of each Tunisia day

1. Purpose
   - Generates a sequential order number that RESETS to #001 every new day
     (based on the Africa/Tunis timezone, which covers Médenine).
   - The previous `order_sequence` table used a global auto-incrementing ID
     that never reset — so after 5 orders on day 1, day 2 started at #006.
   - This migration adds a `daily_order_counter` table and a SECURITY DEFINER
     RPC `get_daily_order_number()` that atomically returns the next number
     for today, inserting a new row (starting at 1) when the day changes.

2. New Tables
   - `daily_order_counter`
     - `order_date` (date, PRIMARY KEY) — the calendar day in Africa/Tunis
     - `counter`      (int, NOT NULL, default 0) — the last assigned number for that day
     - `updated_at`   (timestamptz, default now()) — last mutation time

3. New Functions
   - `get_daily_order_number()` (SECURITY DEFINER)
     - Computes today's date in Africa/Tunis timezone.
     - Atomically increments the counter for today, or inserts a new row at 1
       when no row exists for today yet (new day → reset).
     - Returns the integer to display (1, 2, 3, ...).
     - SECURITY DEFINER so the anon role can call it without needing direct
       INSERT/UPDATE privileges on the table.

4. Security
   - RLS ENABLED on `daily_order_counter` (table locked to direct access).
   - NO direct SELECT/INSERT/UPDATE/DELETE policies — all access goes through
     the SECURITY DEFINER function, which runs with the owner's privileges.
   - EXECUTE on `get_daily_order_number()` granted to `anon, authenticated`.

5. Important notes
   - The old `order_sequence` table is left untouched (no data loss).
   - The frontend will stop using `order_sequence` and use the new RPC instead.
   - Day boundary is Africa/Tunis (UTC+1), matching Médenine local time.
*/

CREATE TABLE IF NOT EXISTS daily_order_counter (
  order_date date PRIMARY KEY,
  counter    int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE daily_order_counter ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_daily_order_number()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_date date;
  next_num   int;
BEGIN
  -- Today's date in Africa/Tunis (covers Médenine). Supabase stores in UTC;
  -- converting to Africa/Tunis gives the correct local calendar day.
  today_date := (now() AT TIME ZONE 'Africa/Tunis')::date;

  -- Atomically increment the counter for today. If no row exists for today
  -- (new day), INSERT ... ON CONFLICT creates one starting at 1.
  INSERT INTO daily_order_counter (order_date, counter, updated_at)
  VALUES (today_date, 1, now())
  ON CONFLICT (order_date)
  DO UPDATE SET counter = daily_order_counter.counter + 1,
                updated_at = now()
  RETURNING counter INTO next_num;

  RETURN next_num;
END;
$$;

GRANT EXECUTE ON FUNCTION get_daily_order_number() TO anon, authenticated;