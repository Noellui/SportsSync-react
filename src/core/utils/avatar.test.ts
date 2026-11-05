import { describe, expect, it } from 'vitest';
import { avatarForUser } from './avatar';

describe('avatarForUser', () => {
  it('uses the seeded player avatar for the signed-in user', () => {
    expect(avatarForUser('u_p2')).toBe('/images/avatar_3.jpg');
    expect(avatarForUser('u_noel')).toBe('/images/avatar_1.jpg');
  });

  it('provides an image for newly registered players', () => {
    expect(avatarForUser('unregistered-id')).toBe('/images/avatar_4.jpg');
  });

  it('uses a saved profile photo when one exists', () => {
    expect(avatarForUser('u_noel', 'data:image/jpeg;base64,custom')).toBe('data:image/jpeg;base64,custom');
  });
});
