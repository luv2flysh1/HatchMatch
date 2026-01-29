-- Add placeholder image URLs to flies
-- Using placehold.co as reliable placeholder service
-- In production, replace with real fly pattern images

-- Dry flies - yellow/tan background
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=PA' WHERE name = 'Parachute Adams';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=EHC' WHERE name = 'Elk Hair Caddis';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=BWO' WHERE name = 'Blue Wing Olive';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=GG' WHERE name = 'Griffiths Gnat';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=STM' WHERE name = 'Stimulator';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/FEF3C7/92400E?text=CC' WHERE name = 'Chubby Chernobyl';

-- Nymphs - brown background
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=PTN' WHERE name = 'Pheasant Tail Nymph';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=HE' WHERE name = 'Hares Ear Nymph';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=CJ' WHERE name = 'Copper John';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=SJW' WHERE name = 'San Juan Worm';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=ZM' WHERE name = 'Zebra Midge';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D4C4A8/44403C?text=PN' WHERE name = 'Prince Nymph';

-- Streamers - dark background
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/374151/F9FAFB?text=WB' WHERE name = 'Woolly Bugger';
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/374151/F9FAFB?text=CM' WHERE name = 'Clouser Minnow';

-- Emergers - green background
UPDATE public.flies SET image_url = 'https://placehold.co/96x96/D1FAE5/065F46?text=RS2' WHERE name = 'RS2';

-- Add more flies with images
INSERT INTO public.flies (name, type, sizes, image_url, description, species_targets) VALUES
-- Dry Flies
('Adams', 'dry', '12-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=ADM', 'Classic all-purpose dry fly. The original before the parachute version.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Royal Wulff', 'dry', '10-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=RW', 'High-visibility attractor pattern. Great in fast water.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Pale Morning Dun', 'dry', '14-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=PMD', 'Essential summer mayfly pattern for western waters.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
('Green Drake', 'dry', '10-14', 'https://placehold.co/96x96/FEF3C7/92400E?text=GD', 'Large mayfly imitation. Triggers aggressive strikes.', ARRAY['rainbow trout', 'brown trout']),
('Humpy', 'dry', '10-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=HMP', 'Durable attractor pattern that floats well in rough water.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
('Comparadun', 'dry', '14-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=CMP', 'Low-riding mayfly pattern for selective fish.', ARRAY['rainbow trout', 'brown trout']),
('X-Caddis', 'dry', '14-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=XC', 'Trailing shuck caddis emerger. Deadly during hatches.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Goddard Caddis', 'dry', '12-16', 'https://placehold.co/96x96/FEF3C7/92400E?text=GC', 'Deer hair caddis pattern that floats forever.', ARRAY['rainbow trout', 'brown trout']),
('Trico Spinner', 'dry', '20-26', 'https://placehold.co/96x96/FEF3C7/92400E?text=TRC', 'Tiny spinner for late summer morning fishing.', ARRAY['rainbow trout', 'brown trout']),
('Hopper', 'dry', '6-12', 'https://placehold.co/96x96/FEF3C7/92400E?text=HOP', 'Grasshopper imitation. Essential for late summer bank fishing.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
('Ant Pattern', 'dry', '14-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=ANT', 'Terrestrial pattern that works all summer.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Beetle', 'dry', '12-18', 'https://placehold.co/96x96/FEF3C7/92400E?text=BTL', 'Foam beetle pattern for terrestrial fishing.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Sparkle Dun', 'dry', '14-20', 'https://placehold.co/96x96/FEF3C7/92400E?text=SD', 'Craig Mathews pattern with trailing shuck.', ARRAY['rainbow trout', 'brown trout']),

-- Nymphs
('Perdigon', 'nymph', '14-20', 'https://placehold.co/96x96/D4C4A8/44403C?text=PDG', 'Slim competition-style nymph that sinks fast.', ARRAY['rainbow trout', 'brown trout']),
('Walt''s Worm', 'nymph', '12-16', 'https://placehold.co/96x96/D4C4A8/44403C?text=WW', 'Simple crane fly larva pattern. Great searching nymph.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Frenchie', 'nymph', '14-18', 'https://placehold.co/96x96/D4C4A8/44403C?text=FRN', 'Hot spot pheasant tail variation. Euro nymphing favorite.', ARRAY['rainbow trout', 'brown trout']),
('Pat''s Rubber Legs', 'nymph', '4-10', 'https://placehold.co/96x96/D4C4A8/44403C?text=PRL', 'Large stonefly nymph. Great for spring runoff.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
('Squirmy Wormy', 'nymph', '10-14', 'https://placehold.co/96x96/D4C4A8/44403C?text=SQW', 'Controversial but effective worm pattern.', ARRAY['rainbow trout', 'brown trout']),
('Scud', 'nymph', '14-18', 'https://placehold.co/96x96/D4C4A8/44403C?text=SCD', 'Freshwater shrimp imitation for tailwaters and spring creeks.', ARRAY['rainbow trout', 'brown trout']),
('Sowbug', 'nymph', '14-18', 'https://placehold.co/96x96/D4C4A8/44403C?text=SWB', 'Aquatic sowbug pattern for slow water.', ARRAY['rainbow trout', 'brown trout']),
('Stonefly Nymph', 'nymph', '6-12', 'https://placehold.co/96x96/D4C4A8/44403C?text=SFN', 'Generic stonefly pattern for freestone streams.', ARRAY['rainbow trout', 'brown trout', 'cutthroat trout']),
('Mop Fly', 'nymph', '10-14', 'https://placehold.co/96x96/D4C4A8/44403C?text=MOP', 'Unconventional but highly effective pattern.', ARRAY['rainbow trout', 'brown trout']),
('Rainbow Warrior', 'nymph', '16-22', 'https://placehold.co/96x96/D4C4A8/44403C?text=RBW', 'Flashy attractor midge pattern.', ARRAY['rainbow trout', 'brown trout']),
('Juju Baetis', 'nymph', '18-22', 'https://placehold.co/96x96/D4C4A8/44403C?text=JJB', 'Realistic BWO nymph for picky fish.', ARRAY['rainbow trout', 'brown trout']),

-- Streamers
('Sculpzilla', 'streamer', '2-6', 'https://placehold.co/96x96/374151/F9FAFB?text=SCZ', 'Articulated sculpin pattern for big fish.', ARRAY['brown trout', 'rainbow trout']),
('Circus Peanut', 'streamer', '2-6', 'https://placehold.co/96x96/374151/F9FAFB?text=CP', 'Articulated streamer with lots of movement.', ARRAY['brown trout', 'rainbow trout', 'pike']),
('Zonker', 'streamer', '4-8', 'https://placehold.co/96x96/374151/F9FAFB?text=ZNK', 'Rabbit strip baitfish pattern.', ARRAY['rainbow trout', 'brown trout', 'bass']),
('Muddler Minnow', 'streamer', '4-10', 'https://placehold.co/96x96/374151/F9FAFB?text=MM', 'Classic sculpin/baitfish pattern.', ARRAY['rainbow trout', 'brown trout', 'bass']),
('Slumpbuster', 'streamer', '4-8', 'https://placehold.co/96x96/374151/F9FAFB?text=SLB', 'Pine squirrel streamer for when nothing else works.', ARRAY['rainbow trout', 'brown trout']),
('Sex Dungeon', 'streamer', '2-6', 'https://placehold.co/96x96/374151/F9FAFB?text=SXD', 'Popular articulated streamer for aggressive fish.', ARRAY['brown trout', 'rainbow trout']),
('Olive Bugger', 'streamer', '6-10', 'https://placehold.co/96x96/374151/F9FAFB?text=OB', 'Olive woolly bugger variation.', ARRAY['rainbow trout', 'brown trout', 'bass']),
('Egg Pattern', 'streamer', '8-14', 'https://placehold.co/96x96/374151/F9FAFB?text=EGG', 'Simple egg pattern for salmon and steelhead waters.', ARRAY['rainbow trout', 'steelhead', 'salmon']),

-- Emergers
('Klinkhamer', 'emerger', '12-18', 'https://placehold.co/96x96/D1FAE5/065F46?text=KLK', 'Hans van Klinken''s famous emerger pattern.', ARRAY['rainbow trout', 'brown trout', 'grayling']),
('CDC Emerger', 'emerger', '16-22', 'https://placehold.co/96x96/D1FAE5/065F46?text=CDC', 'Delicate CDC wing emerger pattern.', ARRAY['rainbow trout', 'brown trout']),
('Barr Emerger', 'emerger', '18-22', 'https://placehold.co/96x96/D1FAE5/065F46?text=BE', 'John Barr''s famous BWO emerger.', ARRAY['rainbow trout', 'brown trout']),
('Soft Hackle', 'wet', '12-18', 'https://placehold.co/96x96/DBEAFE/1E40AF?text=SH', 'Traditional wet fly that imitates emerging insects.', ARRAY['rainbow trout', 'brown trout', 'brook trout']),
('Partridge and Orange', 'wet', '12-16', 'https://placehold.co/96x96/DBEAFE/1E40AF?text=P&O', 'Classic North Country spider pattern.', ARRAY['rainbow trout', 'brown trout', 'grayling']);
