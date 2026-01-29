import {
  isValidEmail,
  isValidPassword,
  formatWaterBodyType,
  calculateDistance,
  formatDistance,
} from '../../utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password')).toBe(true);
      expect(isValidPassword('longpassword123')).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('short')).toBe(false);
    });
  });

  describe('formatWaterBodyType', () => {
    it('should capitalize the first letter', () => {
      expect(formatWaterBodyType('river')).toBe('River');
      expect(formatWaterBodyType('lake')).toBe('Lake');
      expect(formatWaterBodyType('stream')).toBe('Stream');
      expect(formatWaterBodyType('creek')).toBe('Creek');
      expect(formatWaterBodyType('pond')).toBe('Pond');
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(39.7392, -104.9903, 39.7392, -104.9903);
      expect(distance).toBe(0);
    });

    it('should calculate distance between Denver and Boulder correctly', () => {
      // Denver: 39.7392, -104.9903
      // Boulder: 40.015, -105.2705
      const distance = calculateDistance(39.7392, -104.9903, 40.015, -105.2705);
      // Should be approximately 25-30 miles
      expect(distance).toBeGreaterThan(20);
      expect(distance).toBeLessThan(35);
    });

    it('should calculate distance between two distant points', () => {
      // Denver to Los Angeles (approximately 850 miles)
      const distance = calculateDistance(39.7392, -104.9903, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(800);
      expect(distance).toBeLessThan(900);
    });
  });

  describe('formatDistance', () => {
    it('should format very short distances', () => {
      expect(formatDistance(0.05)).toBe('Less than 0.1 mi');
      expect(formatDistance(0.09)).toBe('Less than 0.1 mi');
    });

    it('should format distances less than 1 mile with decimal', () => {
      expect(formatDistance(0.1)).toBe('0.1 mi');
      expect(formatDistance(0.5)).toBe('0.5 mi');
      expect(formatDistance(0.75)).toBe('0.8 mi');
    });

    it('should format distances 1 mile or more as whole numbers', () => {
      expect(formatDistance(1)).toBe('1 mi');
      expect(formatDistance(5.4)).toBe('5 mi');
      expect(formatDistance(25.7)).toBe('26 mi');
      expect(formatDistance(100)).toBe('100 mi');
    });
  });
});
