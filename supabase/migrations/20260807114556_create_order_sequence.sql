/*
# Create order_sequence table for sequential order numbers

1. Purpose
   - Generates a unique, auto-incrementing sequential order number for every
     WhatsApp order placed by customers (e.g. #001, #002, #003 ...).
   - Replaces the previous localStorage-based counter so that numbers are
     truly sequential across ALL customers and devices, not just one browser.

2. New Tables
   - `order_sequence`
     - `id` (int, PRIMARY KEY, auto-incrementing identity) — the sequential number
     - `created_at` (timestamptz, defaults to now()) — when the number was generated

3. Security
   - RLS enabled on `order_sequence`.
   - This is a no-auth (single-tenant) app: the frontend uses the anon key.
   - anon + authenticated roles are allowed to INSERT (to get the next number)
     and SELECT (not strictly needed, but harmless for a counter table).
   - UPDATE and DELETE are intentionally NOT granted — order numbers should
     never be modified or removed once generated.
*/

CREATE TABLE IF NOT EXISTS order_sequence (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_sequence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_order_sequence" ON order_sequence;
CREATE POLICY "anon_insert_order_sequence"
ON order_sequence FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_order_sequence" ON order_sequence;
CREATE POLICY "anon_select_order_sequence"
ON order_sequence FOR SELECT
TO anon, authenticated USING (true);
