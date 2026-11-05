// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { db } from '../../data/repositories/db';
import { teamRepository } from '../../data/repositories/teamRepository';
import { TeamCard } from './TeamsPage';

afterEach(cleanup);

it('shows the captain details and their uploaded profile photo while browsing teams', async () => {
  const team = (await teamRepository.getTeams())[0];
  const captain = db.users.find((user) => user.user_id === team.captain_user_id)!;
  const previousImage = captain.profile_image;
  captain.profile_image = 'data:image/png;base64,captain-photo';

  try {
    render(<TeamCard team={team} onJoin={() => {}} />);
    expect(screen.getByText(captain.full_name)).toBeTruthy();
    expect(screen.getByText(/Captain ·/)).toBeTruthy();
    expect(screen.getByRole('img', { name: `${captain.full_name}, team captain` }).getAttribute('src')).toBe(captain.profile_image);
  } finally {
    captain.profile_image = previousImage;
  }
});
