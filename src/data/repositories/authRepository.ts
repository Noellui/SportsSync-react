import { db, persistDB } from './db';
import { DEMO_PLAYER_USER, DEMO_ADMIN_USER } from '../mock/seed';
import { delay, simulateLatency, withTimeout } from '../../core/utils/withTimeout';
import { randId } from '../../core/utils/withTimeout';
import type { User } from '../models/user';
import type { Player } from '../models/player';

export interface Session {
  user: User;
  player?: Player;
  token: string;
}

const SESSION_KEY = 'sportssync_session';

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
  register(input: {
    full_name: string; email: string; phone_number: string; password: string;
    role: 'player' | 'admin'; preferred_sport?: string; city?: string;
  }): Promise<Session>;
  logout(): Promise<void>;
  currentUser(): Promise<Session | null>;
  updateProfile(userId: string, patch: Partial<Pick<User, 'full_name' | 'phone_number' | 'profile_image'>>): Promise<User>;
  updatePlayerProfile(playerId: string, patch: Partial<Player>): Promise<Player>;
}

export const authRepository: AuthRepository = {
  async login(email, password) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password_hash !== password) {
        throw new Error('Incorrect email or password');
      }
      if (user.account_status === 'suspended') {
        throw new Error('This account is suspended');
      }
      const player = user.role === 'player'
        ? db.players.find((p) => p.user_id === user.user_id)
        : undefined;
      const session: Session = { user, player, token: randId('tok') };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      return session;
    })(), 8000, 'login');
  },

  async register(input) {
    return withTimeout((async () => {
      await delay(simulateLatency());
      if (db.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
        throw new Error('An account with this email already exists');
      }
      const user: User = {
        user_id: randId('u'),
        full_name: input.full_name,
        email: input.email.trim(),
        phone_number: input.phone_number,
        password_hash: input.password,
        role: input.role,
        registration_date: new Date().toISOString().slice(0, 10),
        account_status: 'active',
      };
      db.users.push(user);
      if (user.role === 'player') {
        db.players.push({
          player_id: randId('p'),
          user_id: user.user_id,
          preferred_sport: input.preferred_sport ?? 'Football',
          skill_level: 'beginner',
          city: input.city ?? 'Ahmedabad',
          bio: '',
        });
      } else {
        db.admins.push({
          admin_id: randId('a'),
          user_id: user.user_id,
          contact_no: input.phone_number,
          register_date: new Date().toISOString().slice(0, 10),
        });
      }
      persistDB();
      return { user, token: randId('tok') };
    })(), 8000, 'register');
  },

  async logout() {
    await delay(150);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  async currentUser() {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as Session;
      const freshUser = db.users.find((u) => u.user_id === s.user.user_id) ?? s.user;
      const player = freshUser.role === 'player'
        ? db.players.find((p) => p.user_id === freshUser.user_id)
        : undefined;
      return { user: freshUser, player, token: s.token };
    } catch {
      return null;
    }
  },

  async updateProfile(userId, patch) {
    await delay(simulateLatency());
    const user = db.users.find((u) => u.user_id === userId);
    if (!user) throw new Error('User not found');
    const previous = { ...user };
    Object.assign(user, patch);
    try { persistDB(); }
    catch (error) { Object.assign(user, previous); throw error; }
    return user;
  },

  async updatePlayerProfile(playerId, patch) {
    await delay(simulateLatency());
    const p = db.players.find((x) => x.player_id === playerId);
    if (!p) throw new Error('Player not found');
    Object.assign(p, patch);
    persistDB();
    return p;
  },
};

export { DEMO_PLAYER_USER, DEMO_ADMIN_USER };
