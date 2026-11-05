// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

afterEach(cleanup);
beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('public landing page', () => {
  it('introduces the service before sign in and provides working quick links', () => {
    render(<MemoryRouter><LandingPage /></MemoryRouter>);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/book|play/i);
    expect(screen.getByRole('link', { name: /sign in/i }).getAttribute('href')).toBe('/login');
    expect(screen.getByRole('link', { name: /create account/i }).getAttribute('href')).toBe('/register');
    expect(screen.getByRole('heading', { name: 'About Manjalpur Sports' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /Download the app/i })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Main navigation' }).querySelector('a[href="#download"]')).toBeTruthy();
    expect(screen.getByText(/APK coming soon/i)).toBeTruthy();
    expect(screen.getByText(/demo address/i)).toBeTruthy();
    for (const sport of ['Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Pickleball']) {
      expect(screen.getByRole('button', { name: sport })).toBeTruthy();
    }
    expect(screen.getByRole('navigation', { name: 'Footer quick links' }).querySelector('a[href="#sports"]')).toBeTruthy();
  });
});
