export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`Request timed out after ${ms}ms: ${label}`);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label = 'request'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function randId(prefix = 'id'): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s.toLowerCase()}`;
}

export function randomTransactionNo(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < 9; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `TXN${s}`;
}

export function simulateLatency(): number {
  return 400 + Math.floor(Math.random() * 400); // 400-800ms
}
