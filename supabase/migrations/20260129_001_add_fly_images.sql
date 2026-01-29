-- Migration: Add fly images and more fly patterns
-- Run with: supabase db push

-- Update existing flies with placeholder images
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=PA' WHERE name = 'Parachute Adams' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=EHC' WHERE name = 'Elk Hair Caddis' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=BWO' WHERE name = 'Blue Wing Olive' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=GG' WHERE name = 'Griffiths Gnat' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=STM' WHERE name = 'Stimulator' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=CC' WHERE name = 'Chubby Chernobyl' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=PTN' WHERE name = 'Pheasant Tail Nymph' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=HE' WHERE name = 'Hares Ear Nymph' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=CJ' WHERE name = 'Copper John' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=SJW' WHERE name = 'San Juan Worm' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=ZM' WHERE name = 'Zebra Midge' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=PN' WHERE name = 'Prince Nymph' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/374151/F9FAFB?text=WB' WHERE name = 'Woolly Bugger' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/374151/F9FAFB?text=CM' WHERE name = 'Clouser Minnow' AND image_url IS NULL;
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D1FAE5/065F46?text=RS2' WHERE name = 'RS2' AND image_url IS NULL;

-- Insert new flies (skip if already exists)
INSERT INTO public.flies (name, type, sizes, image_url, description, species_targets)
SELECT name, type::fly_type, sizes, image_url, description, species_targets FROM (VALUES
  ('Adams', 'dry', '12-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=ADM', 'Classic all-purpose dry fly.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Royal Wulff', 'dry', '10-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=RW', 'High-visibility attractor pattern.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Pale Morning Dun', 'dry', '14-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=PMD', 'Essential summer mayfly pattern.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
  ('Green Drake', 'dry', '10-14', 'https://placehold.co/96x96/FEF3C7/92400E?text=GD', 'Large mayfly imitation.', ARRAY['rainbow trout', 'brown trout']),
  ('Humpy', 'dry', '10-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=HMP', 'Durable attractor pattern.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
  ('Comparadun', 'dry', '14-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=CMP', 'Low-riding mayfly pattern.', ARRAY['rainbow trout', 'brown trout']),
  ('X-Caddis', 'dry', '14-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=XC', 'Trailing shuck caddis emerger.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Goddard Caddis', 'dry', '12-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=GC', 'Deer hair caddis that floats forever.', ARRAY['rainbow trout', 'brown trout']),
  ('Trico Spinner', 'dry', '20-26', 'https://placehold.co/96x96/FEF3C7/92400E?text=TRC', 'Tiny spinner for late summer.', ARRAY['rainbow trout', 'brown trout']),
  ('Hopper', 'dry', '6-12', 'https://placehold.co/96x96/FEF3C7/92400E?text=HOP', 'Grasshopper imitation.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
  ('Ant Pattern', 'dry', '14-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=ANT', 'Terrestrial pattern.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Beetle', 'dry', '12-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=BTL', 'Foam beetle pattern.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
  ('Perdigon', 'nymph', '14-20', 'https://placehold.co/96x96/D4C4A8/44403C?text=PDG', 'Competition-style nymph.', ARRAY['rainbow trout', 'brown trout']),
  ('Frenchie', 'nymph', '14-18', 'https://placehold.co/96x96/D4C4A8/44403C?text=FRN', 'Hot spot pheasant tail.', ARRAY['rainbow trout', 'brown trout']),
  ('Pat''s Rubber Legs', 'nymph', '4-10', 'https://placehold.co/96x96/D4C4A8/44403C?text=PRL', 'Large stonefly nymph.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
  ('Squirmy Wormy', 'nymph', '10-14', 'https://placehold.co/96x96/D4C4A8/44403C?text=SQW', 'Effective worm pattern.', ARRAY['rainbow trout', 'brown trout']),
  ('Scud', 'nymph', '14-18', 'https://placehold.co/96x96/D4C4A8/44403C?text=SCD', 'Freshwater shrimp imitation.', ARRAY['rainbow trout', 'brown trout']),
  ('Mop Fly', 'nymph', '10-14', 'https://placehold.co/96x96/D4C4A8/44403C?text=MOP', 'Unconventional but effective.', ARRAY['rainbow trout', 'brown trout']),
  ('Rainbow Warrior', 'nymph', '16-22', 'https://placehold.co/96x96/D4C4A8/44403C?text=RBW', 'Flashy attractor midge.', ARRAY['rainbow trout', 'brown trout']),
  ('Sculpzilla', 'streamer', '2-6', 'https://placehold.co/96x96/374151/F9FAFB?text=SCZ', 'Articulated sculpin pattern.', ARRAY['brown trout', 'rainbow trout']),
  ('Zonker', 'streamer', '4-8', 'https://placehold.co/96x96/374151/F9FAFB?text=ZNK', 'Rabbit strip baitfish.', ARRAY['rainbow trout', 'brown trout', 'bass']),
  ('Muddler Minnow', 'streamer', '4-10', 'https://placehold.co/96x96/374151/F9FAFB?text=MM', 'Classic sculpin pattern.', ARRAY['rainbow trout', 'brown trout', 'bass']),
  ('Egg Pattern', 'streamer', '8-14', 'https://placehold.co/96x96/374151/F9FAFB?text=EGG', 'Simple egg pattern.', ARRAY['rainbow trout', 'steelhead', 'salmon']),
  ('Klinkhamer', 'emerger', '12-18', 'https://placehold.co/96x96/D1FAE5/065F46?text=KLK', 'Famous emerger pattern.', ARRAY['rainbow trout', 'brown trout', 'grayling']),
  ('CDC Emerger', 'emerger', '16-22', 'https://placehold.co/96x96/D1FAE5/065F46?text=CDC', 'Delicate CDC emerger.', ARRAY['rainbow trout', 'brown trout']),
  ('Soft Hackle', 'wet', '12-18', 'https://placehold.co/96x96/DBEAFE/1E40AF?text=SH', 'Traditional wet fly.', ARRAY['rainbow trout', 'brown trout', 'brook trout'])
) AS v(name, type, sizes, image_url, description, species_targets)
WHERE NOT EXISTS (SELECT 1 FROM public.flies f WHERE f.name = v.name);
