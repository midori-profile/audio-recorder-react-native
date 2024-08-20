import { formatMilliseconds } from '../utils/format';

describe('formatMilliseconds', () => {
  it('should return "0:00" when no input is provided', () => {
    expect(formatMilliseconds()).toBe("0:00");
  });

  it('should correctly format milliseconds into minutes and seconds', () => {
    expect(formatMilliseconds(61000)).toBe("1:01");
    expect(formatMilliseconds(120000)).toBe("2:00");
    expect(formatMilliseconds(65000)).toBe("1:05");
  });

  it('should correctly format milliseconds when seconds are less than 10', () => {
    expect(formatMilliseconds(60000)).toBe("1:00");
    expect(formatMilliseconds(61000)).toBe("1:01");
    expect(formatMilliseconds(61000)).toBe("1:01");
  });

  it('should handle edge cases gracefully', () => {
    expect(formatMilliseconds(0)).toBe("0:00");
  });
});
