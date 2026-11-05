import { describe, expect, it } from 'vitest';
import { shouldShowPlayerNav } from './PlayerShell';

describe('player navigation', () => {
  it('keeps the bottom nav visible on all player screens', () => {
    expect(shouldShowPlayerNav('/home/turf/t_1')).toBe(true);
    expect(shouldShowPlayerNav('/home/checkout/slot_1')).toBe(true);
    expect(shouldShowPlayerNav('/home')).toBe(true);
    expect(shouldShowPlayerNav('/home/turfs')).toBe(true);
  });
});
