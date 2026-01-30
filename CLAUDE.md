# Claude Code Project Notes

## Supabase Configuration

- **Project Ref:** `okntzxxufjxxugtdlfrv`
- **Dashboard:** https://supabase.com/dashboard/project/okntzxxufjxxugtdlfrv

## Supabase CLI Commands

Always link the project first before running db commands:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase link --project-ref okntzxxufjxxugtdlfrv
```

### Deploy Edge Functions
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <function-name> --project-ref okntzxxufjxxugtdlfrv
```

### Push Database Migrations
```bash
# Must link first, then push (no --project-ref flag for db push)
SUPABASE_ACCESS_TOKEN=<token> npx supabase db push --include-all
```

## Migration Best Practices

1. **Use `gen_random_uuid()`** instead of `uuid_generate_v4()` - it's built into PostgreSQL 13+
2. **Migration versions must be unique** - Check existing migrations before naming new ones
3. **Version format:** `YYYYMMDD_NNN_description.sql` (e.g., `20260131_001_add_fishing_reports.sql`)

## Existing Migrations
- `20260129_001_add_fly_images.sql`
- `20260130_001_add_water_bodies.sql`
- `20260131_001_add_fishing_reports.sql` - Creates fishing_reports and fly_shop_sources tables
- `20260201_001_fix_fly_shop_sources.sql` - Adds service role policy
- `20260202_001_clear_fishing_data.sql` - Clears test data
- `20260203_001_add_washington_fly_shops.sql` - Adds verified WA fly shop sources
- `20260204_001_cleanup_bad_shops.sql` - Removes shops with bad URLs
- `20260205_001_fix_fly_shop_urls.sql` - Removes generic/outdated URLs, cleans up sources
- `20260206_001_add_failure_tracking.sql` - Adds consecutive_failures column for auto-cleanup
- `20260207_001_add_rocky_ford_sources.sql` - Adds Rocky Ford Creek sources

## Database Tables (Fishing Reports)
### fly_shop_sources
| Column | Description |
|--------|-------------|
| id | UUID primary key |
| name | Shop name |
| website | Main website URL |
| reports_url | Direct URL to fishing reports page |
| state | US state |
| waters_covered | Array of water body names this shop reports on |
| is_active | Whether to scrape this shop |
| last_successful_scrape | Timestamp of last successful scrape |

### fishing_reports
| Column | Description |
|--------|-------------|
| id | UUID primary key |
| water_body_id | FK to water_bodies (nullable) |
| water_body_name | Water body name (for matching) |
| source_name | Shop name or "N fly shops" for aggregated |
| source_url | Primary source URL |
| report_date | Date of the report (extracted from content) |
| report_text | JSON array of sources with URLs |
| extracted_flies | Array of fly patterns |
| extracted_conditions | JSONB with water_temp, clarity, level |
| effectiveness_notes | Summary of what's working |
| scraped_at | When this report was scraped |
| expires_at | When cache expires (3 days from scrape) |

## Edge Functions
- `get-recommendations` - AI fly recommendations with fishing report integration
  - Returns: recommendations, conditions_summary, fishing_report, water_body, generated_at
  - Integrates fishing report data into Claude prompt for better recommendations
- `scrape-fishing-report` - Dynamically finds and scrapes local fly shops
  - **Discovery**: Uses Claude to find fly shops near any water body (not hardcoded)
  - **URL Validation**: Tests URLs before saving to avoid broken links
  - **Learning**: Caches which shops work for which waters in `fly_shop_sources`
  - **Caching**: Reports cached in `fishing_reports` table, expire after 3 days
  - **Extraction**: Uses Claude to extract flies, conditions, effectiveness notes, and **report date**
  - **Date Filtering**: Reports older than 14 days are filtered out (MAX_REPORT_AGE_DAYS = 14)
  - **Multi-Source Aggregation**: Scrapes ALL shops that cover a water body, aggregates into summary
  - **Limitation**: Many fly shops use JavaScript rendering - basic HTML scraping may not get full content

## Fishing Report Features (v1.2)
- **Multi-source aggregation**: Collects reports from all known fly shops for a water body
- **Date validation**: Only includes reports from the last 14 days
- **Smart caching**: 3-day cache duration, cached by water body
- **Claude-powered summary**: When multiple sources exist, Claude creates a cohesive summary
- **Fly extraction**: Identifies and lists effective fly patterns from each source
- **Conditions tracking**: Extracts water temp, clarity, level when available
- **Strict current-report validation**: Rejects generic/seasonal info - must have specific date
- **Blog post navigation**: Automatically follows links to individual report posts on blog-style pages
- **Automatic cleanup**: Shops auto-deactivate after 3 consecutive scrape failures
- **Self-healing**: Successful scrapes re-activate previously deactivated shops

## Fly Shop Sources (for scraping)
| Shop | State | Waters Covered |
|------|-------|----------------|
| Trouts Fly Fishing | CO | South Platte, Cheesman Canyon, Deckers |
| Frying Pan Anglers | CO | Fryingpan, Roaring Fork |
| Headhunters Fly Shop | MT | Missouri River, Blackfoot |
| Reds Fly Shop | WA | Yakima, Rocky Ford Creek |
| TCO Fly Shop | PA | Penns Creek, Spring Creek |
