'use client';
import { useCallback, useEffect, useState } from 'react';
import { Avatar } from '../avatars';
import { AVATAR_COUNT, NAME_MAX, NAME_MIN, normalizePhone } from '@/lib/config';
import type { Session } from '@/lib/types';
import { CaseLabel, Footer, Header, Plate, Stamp, Tape } from '../ui';

const KEY = 'hs.v1';

export function loadSession(): Session | null {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || 'null') as Session | null;
    return j && j.token && j.pid ? j : null;
  } catch {
    return null;
  }
}
export function saveSession(s: Session) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}
export function clearSession() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
/** Remembered join details so a returning player only taps through. */
export function loadDraft(): { code: string; name: string; phone: string } {
  try {
    return { code: '', name: '', phone: '', ...(JSON.parse(localStorage.getItem('hs.draft') || '{}') as object) };
  } catch {
    return { code: '', name: '', phone: '' };
  }
}

const inputCls =
  'block w-full border-2 border-paper/40 bg-ink px-3 py-3 font-type text-[20px] text-paper placeholder:text-paper/50 focus:border-gold';

export default function JoinFlow({ onJoined, notice }: { onJoined: (s: Session) => void; notice?: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState(0);
  const [err, setErr] = useState(notice || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    const q = new URLSearchParams(location.search).get('c');
    setCode((q || d.code || '').toUpperCase());
    setName(d.name);
    setPhone(d.phone);
  }, []);

  const next1 = () => {
    if (!code.trim()) return setErr('Enter the code from the big screen.');
    setErr('');
    setStep(2);
  };
  const next2 = () => {
    const n = name.replace(/\s+/g, ' ').trim();
    if (n.length < NAME_MIN || n.length > NAME_MAX) return setErr(`Codename must be ${NAME_MIN} to ${NAME_MAX} characters.`);
    if (!normalizePhone(phone)) return setErr('Enter a 10-digit Indian mobile number starting with 6, 7, 8 or 9.');
    setErr('');
    setStep(3);
  };

  const submit = useCallback(async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, name, phone, avatar }),
      });
      const j = (await res.json()) as { error?: string; msg?: string; token?: string; pid?: string; name?: string; avatar?: number };
      if (!res.ok || !j.token) {
        setErr(j.msg || 'Could not reach the vault. Try again.');
        if (j.error === 'code') setStep(1);
        else if (j.error === 'name' || j.error === 'phone') setStep(2);
        return;
      }
      try { localStorage.setItem('hs.draft', JSON.stringify({ code, name, phone })); } catch { /* ignore */ }
      onJoined({ token: j.token, pid: j.pid!, name: j.name!, avatar: j.avatar!, phone: phone.replace(/\D/g, '').slice(-10) });
    } catch {
      setErr('Cannot reach the vault. Check your connection and tap again.');
    } finally {
      setBusy(false);
    }
  }, [code, name, phone, avatar, onJoined]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-3 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <CaseLabel>Case file 03 / Operation Code Carnival</CaseLabel>
          <Stamp tone="paper" className="!border-2 text-[12px]">Confidential</Stamp>
        </div>

        <Plate className="p-4">
          <CaseLabel className="mb-3 text-gold">Step {step} of 3</CaseLabel>

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); next1(); }}>
              <h1 className="display mb-1 text-[40px]">Enter the code</h1>
              <p className="mb-4 font-body text-[17px] text-paper/85">One code for the whole crew. It is on the big screen.</p>
              <label htmlFor="code" className="label mb-1 block text-[12px]">Crew code</label>
              <input id="code" className={`${inputCls} uppercase tracking-[0.3em]`} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} maxLength={32} placeholder="CODE" />
              <button type="submit" className="mt-5 min-h-[60px] w-full border-2 border-ink bg-red font-display text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none">
                Enter the vault
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); next2(); }}>
              <h1 className="display mb-1 text-[40px]">Your cover story</h1>
              <p className="mb-4 font-body text-[17px] text-paper/85">A codename for the leaderboard and a number so we can reach the winners.</p>
              <label htmlFor="name" className="label mb-1 block text-[12px]">Codename ({NAME_MIN} to {NAME_MAX} characters)</label>
              <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX + 6} autoComplete="nickname" placeholder="Codename" />
              <label htmlFor="phone" className="label mb-1 mt-4 block text-[12px]">Mobile number</label>
              <div className="flex">
                <span className="flex items-center border-2 border-r-0 border-paper/40 bg-plate px-3 font-type text-[20px]">+91</span>
                <input id="phone" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))} inputMode="numeric" autoComplete="tel-national" maxLength={14} placeholder="10 digits" />
              </div>
              <p className="label mt-2 text-[11px] text-paper/70">Never shown to anyone. Used only to contact gift winners. Same number brings your score back.</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => { setErr(''); setStep(1); }} className="min-h-[60px] border-2 border-paper/50 px-5 font-display text-[20px] uppercase text-paper">Back</button>
                <button type="submit" className="min-h-[60px] flex-1 border-2 border-ink bg-red font-display text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none">Next</button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              <h1 className="display mb-1 text-[40px]">Pick your face</h1>
              <p className="mb-3 font-body text-[17px] text-paper/85">This follows you onto the leaderboards.</p>
              <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-4 gap-2">
                {Array.from({ length: AVATAR_COUNT }, (_, i) => (
                  <button key={i} type="button" role="radio" aria-checked={avatar === i} onClick={() => setAvatar(i)} className={`flex aspect-square items-center justify-center p-1 ${avatar === i ? 'bg-gold' : 'bg-ink'}`}>
                    <Avatar id={i} size={64} />
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => { setErr(''); setStep(2); }} className="min-h-[60px] border-2 border-paper/50 px-5 font-display text-[20px] uppercase text-paper">Back</button>
                <button type="button" disabled={busy} onClick={submit} className="min-h-[60px] flex-1 border-2 border-ink bg-red font-display text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none disabled:opacity-60">
                  {busy ? 'Checking the plan...' : 'Join the crew'}
                </button>
              </div>
            </div>
          )}

          {err && (
            <p role="alert" className="mt-4 border-l-4 border-red bg-ink px-3 py-2 font-body text-[17px] font-semibold">{err}</p>
          )}
        </Plate>
        <Tape className="mt-6" />
      </main>
      <Footer />
    </>
  );
}
