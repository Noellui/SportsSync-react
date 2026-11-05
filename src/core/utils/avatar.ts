const avatars: Record<string, string> = {
  u_noel: '/images/avatar_1.jpg',
  u_p1: '/images/avatar_2.jpg',
  u_p2: '/images/avatar_3.jpg',
  u_p3: '/images/avatar_4.jpg',
  u_p4: '/images/avatar_1.jpg',
  u_p5: '/images/avatar_2.jpg',
  u_p6: '/images/avatar_3.jpg',
};

export function avatarForUser(userId: string | undefined, profileImage?: string): string {
  return profileImage || avatars[userId ?? ''] || '/images/avatar_4.jpg';
}
