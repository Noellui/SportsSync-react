import { describe, expect, it } from 'vitest';
import { shouldShowPlayerNav } from './PlayerShell';

describe('player navigation', () => {
  it('keeps the bottom nav off screens with a fixed booking action', () => {
    expect(shouldShowPlayerNav('/home/turf/t_1')).toBe(false);
    expect(shouldShowPlayerNav('/home/checkout/slot_1')).toBe(false);
    expect(shouldShowPlayerNav('/home')).toBe(true);
    expect(shouldShowPlayerNav('/home/turfs')).toBe(true);
  });
});
