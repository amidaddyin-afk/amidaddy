-- Drop alcohol wording from the storefront: Billionaire's "Whiskey" top note is
-- now "Oak lactone" (the compound behind that warm, toasted-oak note).
-- Idempotent: only rows that still say whiskey/whisky are touched.
-- Keep in step with src/lib/data.ts.

update public.products
set top_notes = array_replace(array_replace(top_notes, 'Whiskey', 'Oak lactone'), 'Whisky', 'Oak lactone'),
    heart_notes = array_replace(array_replace(heart_notes, 'Whiskey', 'Oak lactone'), 'Whisky', 'Oak lactone'),
    base_notes = array_replace(array_replace(base_notes, 'Whiskey', 'Oak lactone'), 'Whisky', 'Oak lactone'),
    updated_at = now()
where array_to_string(top_notes || heart_notes || base_notes, ',') ~* 'whiske?y';

-- Free-text fields edited in the admin portal, in case any mention it.
update public.products
set description = regexp_replace(description, 'whiske?y', 'oak', 'gi'),
    seo_description = regexp_replace(seo_description, 'whiske?y', 'oak', 'gi'),
    story = regexp_replace(story, 'whiske?y', 'oak', 'gi'),
    mood = regexp_replace(mood, 'whiske?y', 'oak', 'gi'),
    updated_at = now()
where concat_ws(' ', description, seo_description, story, mood) ~* 'whiske?y';
