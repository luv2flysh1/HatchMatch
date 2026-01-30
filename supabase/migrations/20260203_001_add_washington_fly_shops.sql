-- Add verified Washington fly shop sources with working URLs

INSERT INTO public.fly_shop_sources (name, website, reports_url, state, waters_covered) VALUES
  ('Reds Fly Shop', 'https://redsflyfishing.com', 'https://redsflyfishing.com/blogs/yakima-river-fishing-report/yakima-river-report', 'WA',
   ARRAY['Yakima River', 'Rocky Ford Creek', 'Naches River', 'Cle Elum River']),
  ('Troutwater Fly Shop', 'https://www.troutwaterflyshop.com', 'https://www.troutwaterflyshop.com/s/stories/fishing-report-3', 'WA',
   ARRAY['Yakima River', 'Cle Elum River']),
  ('The Evening Hatch', 'https://theeveninghatch.com', 'https://theeveninghatch.com/yakima-river-fishing-reports', 'WA',
   ARRAY['Yakima River', 'Klickitat River', 'Upper Columbia River']),
  ('Worley Bugger Fly Co', 'http://www.worleybuggerflyco.com', 'http://www.worleybuggerflyco.com/WBFCFlyFishingReport/2019/WBFCFlyFishingReport.htm', 'WA',
   ARRAY['Yakima River']),
  ('Avid Angler', 'https://avidangler.com', 'https://avidangler.com/fishing-conditions/water-profiles/rivers/yakima-river', 'WA',
   ARRAY['Yakima River']),
  ('Orvis Fishing Reports', 'https://fishingreports.orvis.com', 'https://fishingreports.orvis.com/west/washington/yakima-river', 'WA',
   ARRAY['Yakima River']);
