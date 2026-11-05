import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Logo } from '../core/components/Logo';

const sports = [
  { name: 'Football', image: '/images/sport_football.jpg', copy: 'Find a pitch for a casual kickabout or your regular squad.' },
  { name: 'Cricket', image: '/images/sport_cricket.jpg', copy: 'Book practice time and get the team together.' },
  { name: 'Basketball', image: '/images/sport_basketball.jpg', copy: 'Choose a court and make room for the next game.' },
  { name: 'Badminton', image: '/images/sport_badminton.jpg', copy: 'Set up a singles match or doubles session.' },
  { name: 'Tennis', image: '/images/sport_tennis.jpg', copy: 'Pick a court and a time that works for you.' },
  { name: 'Pickleball', image: '/images/sport_pickleball.jpg', copy: 'Bring a friend and try a fast, friendly game.' },
];

const quickLinks = [
  { label: 'What we offer', href: '#services' },
  { label: 'Sports', href: '#sports' },
  { label: 'About us', href: '#about' },
  { label: 'Location', href: '#location' },
];

export function LandingPage() {
  const [selectedSport, setSelectedSport] = useState(sports[0]);
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.55, ease: 'easeOut' as const } };

  return (
    <div className="min-h-[100svh] bg-bg text-text">
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-5 md:px-10 lg:px-16">
        <a href="#top" aria-label="SportsSync home"><Logo size={38} /></a>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {quickLinks.slice(0, 3).map((item) => <a key={item.href} href={item.href} className="hover:text-text focus-visible:text-text">{item.label}</a>)}
        </nav>
        <Link to="/login" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-text hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">Sign in <ArrowUpRight size={16} aria-hidden /></Link>
      </header>

      <main id="top">
        <section className="mx-auto flex min-h-[min(760px,85svh)] w-full max-w-[1440px] flex-col justify-center px-5 pb-20 pt-12 md:px-10 lg:px-16 lg:pt-20">
          <motion.h1 {...reveal} className="max-w-[1250px] font-display text-[clamp(3.25rem,11vw,10rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
            Book your <span className="inline-block h-[0.75em] w-[1.45em] overflow-hidden rounded-[0.18em] align-[-0.04em]"><img src="/images/login_hero.jpg" alt="People playing on a sports field" className="h-full w-full object-cover" /></span> next game.
          </motion.h1>
          <div className="mt-10 flex max-w-[760px] flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[490px] text-base leading-7 text-muted md:text-lg">SportsSync by Manjalpur Sports helps players in Vadodara find a place to play, build a team, book a time, and keep everyone’s share in one place.</p>
            <Link to="/register" className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-primary px-7 text-sm font-bold text-on-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Create account <ArrowRight size={17} aria-hidden /></Link>
          </div>
        </section>

        <section id="services" className="scroll-mt-8 bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
            <motion.div {...reveal} className="grid gap-8 lg:grid-cols-2 lg:gap-20">
              <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.045em]">One place for the whole game.</h2>
              <p className="max-w-[530px] self-end text-base leading-7 text-muted md:text-lg">Browse turfs and courts, choose a date and time, then book for yourself or your team. Captains can manage players and requests; team members can see bookings and pay their equal demo share.</p>
            </motion.div>
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {[
                { title: 'For players', image: '/images/turf_1.jpg', text: 'Find available playing time and keep your upcoming bookings close.' },
                { title: 'For captains', image: '/images/turf_2.jpg', text: 'Create a team, welcome players, and book for the group.' },
                { title: 'For venue owners', image: '/images/turf_3.jpg', text: 'Add turf photos, manage slots, and view bookings in the admin area.' },
              ].map((item) => <motion.article {...reveal} key={item.title} className="grid gap-4">
                <img src={item.image} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
                <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                <p className="text-base leading-7 text-muted">{item.text}</p>
              </motion.article>)}
            </div>
          </div>
        </section>

        <section id="sports" className="scroll-mt-8 mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-16">
          <motion.div {...reveal}>
            <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.045em]">Pick your sport.</h2>
            <p className="mt-5 max-w-[440px] text-base leading-7 text-muted">Select a sport to see what you can play through SportsSync.</p>
            <div className="mt-9 flex flex-wrap gap-2" role="group" aria-label="Choose a sport">
              {sports.map((sport) => <button key={sport.name} type="button" onClick={() => setSelectedSport(sport)} aria-pressed={selectedSport.name === sport.name} className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${selectedSport.name === sport.name ? 'border-primary bg-primary text-on-primary' : 'border-line text-text hover:border-primary'}`}>{sport.name}</button>)}
            </div>
          </motion.div>
          <motion.div {...reveal} className="relative min-h-[340px] overflow-hidden rounded-2xl md:min-h-[500px]">
            <img src={selectedSport.image} alt={`${selectedSport.name} playing area`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 p-6 pt-24 md:p-9 md:pt-32" style={{ background: 'linear-gradient(to top, #0B1210 5%, rgba(11,18,16,0.8) 55%, transparent)' }}>{/* taste-skill-ignore: neutral scrim over the sport photo */}
              <p className="font-display text-4xl font-semibold">{selectedSport.name}</p>
              <p className="mt-2 max-w-md text-base leading-6 text-text">{selectedSport.copy}</p>
            </div>
          </motion.div>
        </section>

        <section id="about" className="scroll-mt-8 bg-elevated py-20 md:py-28">
          <motion.div {...reveal} className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-10 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-16">
            <img src="/images/turf_6.jpg" alt="Sports turf ready for a game" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.045em]">About Manjalpur Sports</h2>
              <p className="mt-7 text-base leading-7 text-muted md:text-lg">We are Manjalpur Sports, a demo sports community built around a simple idea: playing together should be easier to organise. SportsSync brings local players, team captains, and venues into one booking experience.</p>
              <p className="mt-5 text-base leading-7 text-muted">Choose a sport, find a time, invite your squad, and track the plan from booking to game day.</p>
            </div>
          </motion.div>
        </section>

        <section id="location" className="scroll-mt-8 mx-auto grid max-w-[1440px] gap-9 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-2 lg:gap-20 lg:px-16">
          <motion.h2 {...reveal} className="font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[1] tracking-[-0.045em]">Made for Manjalpur.</motion.h2>
          <motion.div {...reveal} className="self-end">
            <p className="flex items-start gap-3 text-lg font-semibold"><MapPin size={23} className="mt-1 shrink-0 text-primary" aria-hidden /> Court Lane, Manjalpur, Vadodara, Gujarat 390011</p>
            <p className="mt-3 pl-9 text-sm text-muted">Demo address for this project. No physical venue is operated at this location.</p>
            <Link to="/register" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">Start playing <ArrowUpRight size={17} aria-hidden /></Link>
          </motion.div>
        </section>
      </main>

      <footer className="bg-primary px-5 py-12 text-on-primary md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1312px] gap-12 md:grid-cols-2 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-display text-3xl font-bold">SportsSync</p>
            <p className="mt-3 max-w-sm text-sm leading-6">A place for Manjalpur players to find their next game.</p>
          </div>
          <nav aria-label="Footer quick links" className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm font-semibold sm:grid-cols-3">
            {quickLinks.map((item) => <a key={item.href} href={item.href} className="min-h-11 py-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-on-primary">{item.label}</a>)}
            <Link to="/login" className="min-h-11 py-2 hover:underline">Login</Link>
            <Link to="/register" className="min-h-11 py-2 hover:underline">Join</Link>
          </nav>
        </div>
        <div className="mx-auto mt-14 flex max-w-[1312px] flex-wrap items-center justify-between gap-3 pt-5 text-sm">
          <span>© {new Date().getFullYear()} Manjalpur Sports · SportsSync</span>
          <a href="#top" className="font-semibold hover:underline">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
