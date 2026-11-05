# SportsSync

SportsSync is a React, TypeScript, Vite demo for sports turf booking and team building. It uses local mock data and browser storage; no backend or real payment service is involved.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The app starts at `/login`.

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Player | `noellouis2005@gmail.com` | `12345` |
| Admin | `admin@sportssync.com` | `admin123` |

New accounts created through Register are also available locally in that browser.

Players can change their profile photo from Profile. Admins can upload turf photos when adding or editing a turf, choose a primary photo, and remove photos. Uploads accept JPEG, PNG, or WebP files up to 5 MB each. Photos are resized and saved in this browser's local storage along with the demo data, so they do not sync to another device or browser.

## Mock data

The initial dataset is defined in `src/data/mock/seed.ts`. All demo players and venues are in Ahmedabad. Dates are calculated when the app loads, so upcoming bookings and slots stay relative to the current day.

### Players

The main player account is Noel Louis (Football, intermediate). Six more player accounts are seeded; each uses the password `pass1234`:

| Player | Email | Preferred sport | Skill |
| --- | --- | --- | --- |
| Aarav Patel | `aarav.p@example.com` | Football | Pro |
| Ishita Rao | `ishita.r@example.com` | Badminton | Intermediate |
| Kabir Shah | `kabir.s@example.com` | Cricket | Beginner |
| Meera Joshi | `meera.j@example.com` | Basketball | Pro |
| Rohan Mehta | `rohan.m@example.com` | Tennis | Intermediate |
| Sana Khan | `sana.k@example.com` | Pickleball | Beginner |

### Sports and venues

The six sports are Football, Cricket, Basketball, Badminton, Tennis, and Pickleball. Every venue has opening hours of 06:00–23:00.

| Venue | Area | Sports | Status |
| --- | --- | --- | --- |
| Green Arena | Satellite | Football | Active |
| Striker's Den | Bopal | Football, Cricket | Active |
| Dunk Dome | SG Highway | Basketball, Pickleball | Active |
| Smash Court | Prahlad Nagar | Badminton, Tennis | Active |
| Pitch Perfect | Maninagar | Cricket, Football | Maintenance |
| Night Owl Turf | Vastrapur | Football, Badminton, Tennis | Active |

For active venues, the seed generates one-hour slots from 06:00 to 23:00 for the next seven days for each supported sport. Prices start at ₹800, add ₹400 from 18:00 to 21:00, and add ₹300 on weekends. Cricket slots cost ₹200 less, with a ₹600 minimum; all slots have a ₹1,800 maximum. About 30% of generated slots are marked booked. The maintenance venue has no generated slots.

### Bookings and payments

Noel's account starts with six bookings:

| Booking | Venue and sport | Timing | Status | Booking amount |
| --- | --- | --- | --- | ---: |
| `b_up1` | Green Arena, Football | In 2 days, 18:00–20:00 | Confirmed | ₹3,200 |
| `b_up2` | Night Owl Turf, Football | In 5 days, 20:00–21:00 | Confirmed | ₹1,500 |
| `b_done1` | Striker's Den, Cricket | 6 days ago, 17:00–18:00 | Completed | ₹1,200 |
| `b_done2` | Smash Court, Badminton | 12 days ago, 19:00–20:00 | Completed | ₹900 |
| `b_done3` | Night Owl Turf, Football | 20 days ago, 18:00–19:00 | Completed | ₹2,600 |
| `b_cancel1` | Green Arena, Football | 3 days ago, 18:00–19:00 | Cancelled | ₹1,400 |

Each booking has a matching mock payment. The examples cover UPI, card, and wallet methods; the cancelled booking's payment is marked refunded. These are demonstration records and no money is transferred.

### Teams

| Team | Sport | Captain | Members | Status |
| --- | --- | --- | ---: | --- |
| Friday Night Strikers | Football | Noel Louis | 4/10 | Open |
| Ahmedabad Overs | Cricket | Aarav Patel | 3/8 | Open |
| Smash Sisters | Badminton | Ishita Rao | 6/6 | Full |
| Dunk Squad | Basketball | Meera Joshi | 2/10 | Closed |

Three team join requests are also seeded. Venue photos are local files in `public/images`; their credits are in `public/images/CREDITS.md`.

### Resetting the demo data

Changes are saved in browser local storage under `sportssync_db_v1`. To restore the original seed, remove that key in your browser's developer tools and reload the app. Remove `sportssync_session` too if you also want to sign out. Mock account passwords are stored as plain values for this local demo.

## Checks

```bash
npm run lint
npx tsc -b --noEmit
npx vitest run
npm run build
```

## Project structure

- `src/core`: routing, shared UI, utilities, hooks
- `src/data/models`: Zod entity schemas and inferred types
- `src/data/mock`: seed data
- `src/data/repositories`: async mock repositories and localStorage persistence
- `src/data/store`: React Query hooks and Zustand authentication state
- `src/features`: player and admin pages
- `public/images`: local photos and source credits

To connect a real API, keep the repository method signatures and replace their implementations in `src/data/repositories`. The UI reads through React Query hooks in `src/data/store/hooks.ts`; mutations should continue invalidating the relevant query keys. Authentication and payments here are demonstrations only: passwords are stored as plain mock values and no money is transferred.

The app includes a web manifest for a standalone mobile layout. Offline caching and push notifications are not implemented.
