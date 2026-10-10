export type Phase = 'IDLE' | 'LOBBY' | 'QUESTION' | 'REVEAL' | 'FINAL';

export interface PublicQuestion {
  n: number;
  text: string;
  options: string[];
  difficulty: 'Easy' | 'Intermediate';
  limit: number;
}

/** Same payload for every player. Never contains the answer. */
export interface PublicState {
  epoch: string;
  v: number;
  phase: Phase;
  qi: number;
  total: number;
  startAt: number;
  endAt: number;
  paused: boolean;
  remMs: number;
  serverNow: number;
  count: number;
  answered: number;
  q?: PublicQuestion;
}

export interface Row {
  id: string;
  n: string;
  a: number;
  pts: number;
  rank: number;
  ph?: string;
  /** cumulative board only: previous rank, null = was outside the top list / new, undefined = no previous board */
  prev?: number | null;
}

export interface Snapshot {
  q: number;
  text: string;
  options: string[];
  correct: number;
  fact: string;
  dist: number[];
  answered: number;
  crew: number;
  perQ: Row[];
  cum: Row[];
  last: boolean;
}

export interface MeResult {
  s: 'OK' | 'NOTYET' | 'NOPLAYER';
  answered?: boolean;
  choice?: number;
  correct?: boolean;
  points?: number;
  rank?: number;
  total?: number;
  pts?: number;
  gap?: number | null;
}

export interface Session {
  token: string;
  pid: string;
  name: string;
  avatar: number;
  phone: string;
}

export interface PreviewQ {
  n: number;
  text: string;
  options: string[];
  correct: number;
  limit: number;
  difficulty: string;
  fact: string;
}

export interface AdminData {
  ok: true;
  serverNow: number;
  state: {
    phase: Phase;
    qi: number;
    v: number;
    startAt: number;
    endAt: number;
    paused: boolean;
    remMs: number;
    limit: number;
    ovr: number;
    code: string;
  };
  total: number;
  players: number;
  answered: number;
  current: PreviewQ | null;
  next: PreviewQ | null;
}
