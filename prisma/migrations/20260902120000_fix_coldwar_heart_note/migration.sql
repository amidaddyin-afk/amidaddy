-- Cold War listed "Plum" in both its top notes and its heart notes.
-- "Pepper" is the intended heart note (see the storefront hero copy and the
-- approved scent-note chart). Align the database row with the catalogue.
update public.products
set heart_notes = array['Pepper', 'Juniper', 'Thyme', 'Tarragon']
where slug = 'coldwar';
