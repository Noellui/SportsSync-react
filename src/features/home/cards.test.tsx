// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SportCard } from './SportCard';
import { TurfCard } from './TurfCard';
import { db } from '../../data/repositories/db';

describe('browse cards', () => {
  it('links every sport to turf browsing', () => {
    for (const sport of db.sports) {
      const { unmount } = render(<MemoryRouter><SportCard sport={sport} /></MemoryRouter>);
      expect(screen.getByRole('link', { name: `Browse turfs for ${sport.sport_name}` }).getAttribute('href')).toBe('/home/turfs');
      unmount();
    }
  });

  it('links each turf to its detail page', () => {
    for (const turf of db.turfs) {
      const { unmount } = render(<MemoryRouter><TurfCard turf={{ ...turf, images: [], sport_ids: [], min_price: 800 }} /></MemoryRouter>);
      expect(screen.getByRole('link', { name: `View ${turf.turf_name}` }).getAttribute('href')).toBe(`/home/turf/${turf.turf_id}`);
      unmount();
    }
  });

  it('keeps the team booking player count when a turf is opened', () => {
    const turf = db.turfs[0];
    render(<MemoryRouter initialEntries={['/home/turfs?players=6']}>
      <TurfCard turf={{ ...turf, images: [], sport_ids: [], min_price: 800 }} />
    </MemoryRouter>);
    expect(screen.getByRole('link', { name: `View ${turf.turf_name}` }).getAttribute('href')).toBe(`/home/turf/${turf.turf_id}?players=6`);
  });
});
