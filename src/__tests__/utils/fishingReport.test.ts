// Fishing Report Utility Tests
// Tests for date parsing and report aggregation logic

describe('Fishing Report Utilities', () => {
  describe('parseReportDate', () => {
    // This mirrors the logic in scrape-fishing-report Edge Function
    function parseReportDate(dateStr: string): Date | null {
      if (!dateStr) return null;

      try {
        // Try direct parsing
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;

        // Try common formats like "January 15, 2026" or "Jan 15, 2026"
        const monthNames = [
          'january', 'february', 'march', 'april', 'may', 'june',
          'july', 'august', 'september', 'october', 'november', 'december',
          'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        ];

        const lowerDate = dateStr.toLowerCase();
        for (let i = 0; i < monthNames.length; i++) {
          if (lowerDate.includes(monthNames[i])) {
            const monthNum = i % 12;
            const dayMatch = dateStr.match(/(\d{1,2})/);
            const yearMatch = dateStr.match(/(\d{4})/);
            if (dayMatch && yearMatch) {
              return new Date(parseInt(yearMatch[1]), monthNum, parseInt(dayMatch[1]));
            }
          }
        }

        return null;
      } catch {
        return null;
      }
    }

    it('should parse ISO date strings', () => {
      const result = parseReportDate('2026-01-28T12:00:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(0); // January
      // Note: getDate() may vary by timezone, so we just verify it's valid
      expect(result?.getDate()).toBeGreaterThanOrEqual(27);
      expect(result?.getDate()).toBeLessThanOrEqual(28);
    });

    it('should parse "Month Day, Year" format', () => {
      const result = parseReportDate('January 15, 2026');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(15);
      expect(result?.getFullYear()).toBe(2026);
    });

    it('should parse abbreviated month format', () => {
      const result = parseReportDate('Jan 15, 2026');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(0);
    });

    it('should parse "February 28, 2026"', () => {
      const result = parseReportDate('February 28, 2026');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getMonth()).toBe(1); // February
      expect(result?.getDate()).toBe(28);
    });

    it('should return null for invalid date', () => {
      expect(parseReportDate('')).toBeNull();
      expect(parseReportDate('not a date')).toBeNull();
    });

    it('should handle null input gracefully', () => {
      expect(parseReportDate('')).toBeNull();
    });
  });

  describe('isReportRecent', () => {
    const MAX_REPORT_AGE_DAYS = 14;

    function isReportRecent(reportDate: Date | null): boolean {
      if (!reportDate) return false;
      const daysSinceReport = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReport <= MAX_REPORT_AGE_DAYS;
    }

    it('should return true for report from today', () => {
      const today = new Date();
      expect(isReportRecent(today)).toBe(true);
    });

    it('should return true for report from 7 days ago', () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(isReportRecent(sevenDaysAgo)).toBe(true);
    });

    it('should return true for report from 14 days ago', () => {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      expect(isReportRecent(fourteenDaysAgo)).toBe(true);
    });

    it('should return false for report from 15 days ago', () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      expect(isReportRecent(fifteenDaysAgo)).toBe(false);
    });

    it('should return false for report from 30 days ago', () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(isReportRecent(thirtyDaysAgo)).toBe(false);
    });

    it('should return false for null date', () => {
      expect(isReportRecent(null)).toBe(false);
    });
  });

  describe('aggregateFliesFromReports', () => {
    interface ReportData {
      flies: string[];
    }

    function aggregateFliesFromReports(reports: ReportData[]): string[] {
      const allFlies = reports.flatMap(r => r.flies);
      const uniqueFlies = [...new Set(allFlies)];
      return uniqueFlies.slice(0, 8); // Max 8 flies
    }

    it('should combine flies from multiple reports', () => {
      const reports = [
        { flies: ['Zebra Midge', 'RS2'] },
        { flies: ['Pheasant Tail', 'BWO'] },
      ];

      const result = aggregateFliesFromReports(reports);
      expect(result).toContain('Zebra Midge');
      expect(result).toContain('RS2');
      expect(result).toContain('Pheasant Tail');
      expect(result).toContain('BWO');
    });

    it('should remove duplicates', () => {
      const reports = [
        { flies: ['Zebra Midge', 'RS2'] },
        { flies: ['Zebra Midge', 'Pheasant Tail'] },
      ];

      const result = aggregateFliesFromReports(reports);
      expect(result.filter(f => f === 'Zebra Midge').length).toBe(1);
    });

    it('should limit to 8 flies', () => {
      const reports = [
        { flies: ['Fly1', 'Fly2', 'Fly3', 'Fly4', 'Fly5'] },
        { flies: ['Fly6', 'Fly7', 'Fly8', 'Fly9', 'Fly10'] },
      ];

      const result = aggregateFliesFromReports(reports);
      expect(result.length).toBe(8);
    });

    it('should handle empty reports', () => {
      const reports: ReportData[] = [];
      const result = aggregateFliesFromReports(reports);
      expect(result).toEqual([]);
    });

    it('should handle reports with empty flies array', () => {
      const reports = [
        { flies: [] },
        { flies: ['Zebra Midge'] },
      ];

      const result = aggregateFliesFromReports(reports);
      expect(result).toEqual(['Zebra Midge']);
    });
  });

  describe('formatSourceName', () => {
    function formatSourceName(sourceCount: number): string {
      if (sourceCount === 1) return 'fly shop';
      return `${sourceCount} fly shops`;
    }

    it('should return singular for 1 source', () => {
      expect(formatSourceName(1)).toBe('fly shop');
    });

    it('should return plural with count for multiple sources', () => {
      expect(formatSourceName(2)).toBe('2 fly shops');
      expect(formatSourceName(3)).toBe('3 fly shops');
      expect(formatSourceName(5)).toBe('5 fly shops');
    });
  });

  describe('validateFishingReport', () => {
    interface FishingReport {
      source_name: string;
      effectiveness_notes: string;
      extracted_flies: string[];
      conditions: Record<string, any>;
    }

    function isValidFishingReport(report: any): boolean {
      if (!report) return false;
      return (
        typeof report.source_name === 'string' &&
        typeof report.effectiveness_notes === 'string' &&
        Array.isArray(report.extracted_flies) &&
        typeof report.conditions === 'object'
      );
    }

    it('should validate a proper fishing report', () => {
      const report = {
        source_name: 'Test Shop',
        effectiveness_notes: 'Fishing is good.',
        extracted_flies: ['BWO', 'Midge'],
        conditions: { water_temp: '42°F' },
      };

      expect(isValidFishingReport(report)).toBe(true);
    });

    it('should reject report missing source_name', () => {
      const report = {
        effectiveness_notes: 'Fishing is good.',
        extracted_flies: ['BWO'],
        conditions: {},
      };

      expect(isValidFishingReport(report)).toBe(false);
    });

    it('should reject report with non-array flies', () => {
      const report = {
        source_name: 'Test Shop',
        effectiveness_notes: 'Good.',
        extracted_flies: 'BWO, Midge', // String instead of array
        conditions: {},
      };

      expect(isValidFishingReport(report)).toBe(false);
    });

    it('should reject null report', () => {
      expect(isValidFishingReport(null)).toBe(false);
    });

    it('should reject undefined report', () => {
      expect(isValidFishingReport(undefined)).toBe(false);
    });
  });
});
