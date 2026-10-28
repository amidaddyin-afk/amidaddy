-- Billionaire's "Tobacco" base note is now "Coumarin accord" (the compound
-- behind that warm, hay-sweet note), same as the whiskey -> oak lactone change.
-- Idempotent: only rows that still say tobacco are touched.
-- Keep in step with src/lib/data.ts.

update public.products
set top_notes = array_replace(top_notes, 'Tobacco', 'Coumarin accord'),
    heart_notes = array_replace(heart_notes, 'Tobacco', 'Coumarin accord'),
    base_notes = array_replace(base_notes, 'Tobacco', 'Coumarin accord'),
    updated_at = now()
where 'Tobacco' = any(top_notes || heart_notes || base_notes);

-- Free-text fields edited in the admin portal, in case any mention it.
update public.products
set description = regexp_replace(description, 'tobacco', 'coumarin', 'gi'),
    seo_description = regexp_replace(seo_description, 'tobacco', 'coumarin', 'gi'),
    story = regexp_replace(story, 'tobacco', 'coumarin', 'gi'),
    mood = regexp_replace(mood, 'tobacco', 'coumarin', 'gi'),
    updated_at = now()
where concat_ws(' ', description, seo_description, story, mood) ~* 'tobacco';
