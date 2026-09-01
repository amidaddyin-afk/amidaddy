-- The camera originals under public/ were converted to WebP and the originals
-- moved out of public/ into assets-source/, so any product_images row still
-- pointing at a .JPG/.jpg path would now 404.
--
-- Rewrite the extension in place. Idempotent: rows already on .webp are skipped.
update public.product_images
set url = regexp_replace(url, '\.(JPG|jpg|JPEG|jpeg)$', '.webp')
where url ~ '\.(JPG|jpg|JPEG|jpeg)$';
