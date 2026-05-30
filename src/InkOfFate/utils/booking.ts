// Ticket numbering + dates for the parlor ledger.

import type { Tattoo } from '../types';

const COUNT_BASE = 3107;

export function ticketNumber(prior: number): string {
  const n = COUNT_BASE + prior + 1;
  return `IOF-${String(n).padStart(5, '0')}`;
}

export function signedDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function newTattooId(): string {
  return 'iof_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const MAX_PER_USER = 20;

export function prependTattoo(prior: Tattoo[] | undefined, next: Tattoo): Tattoo[] {
  const arr = prior ? [next, ...prior] : [next];
  return arr.slice(0, MAX_PER_USER);
}

export function newSeed(): string {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
}
