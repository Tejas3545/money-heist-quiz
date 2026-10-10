'use client';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, getAvatarMeta } from '../avatars';
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

import { DossierGraphic, HeistMaskGraphic, TacticalBlueprintBanner, VaultDoorGraphic } from '../graphics';

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
    <div className="min-h-[100dvh] flex flex-col justify-between overflow-x-hidden">
      <div>
        <Header />
        <main className="mx-auto max-w-md px-2.5 xs:px-3 pt-2 sm:pt-3">
          <div className="mb-2 flex items-center justify-between">
            <CaseLabel>Case file 03 / Operation Code Carnival</CaseLabel>
            <Stamp tone="paper" className="!border-2 text-[10px] xs:text-[12px] py-0.5">Confidential</Stamp>
          </div>

          <Plate className="p-3 xs:p-4 shadow-xl">
            <div className="flex items-center justify-between mb-1.5 xs:mb-2">
              <CaseLabel className="text-gold">Step {step} of 3</CaseLabel>
              <span className="font-mono text-[10px] xs:text-[11px] text-paper/60 uppercase">
                {step === 1 ? 'VAULT ACCESS' : step === 2 ? 'OPERATIVE FILE' : 'CREW IDENTITY'}
              </span>
            </div>

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); next1(); }}>
                {/* Hero Vault Door Graphic: compact on mobile */}
                <div className="my-1.5 xs:my-2 bg-ink/60 border border-paper/15 p-1 rounded">
                  <VaultDoorGraphic height={80} />
                </div>

                <h1 className="display mb-0.5 text-[30px] xs:text-[36px]">Enter the code</h1>
                <p className="mb-2.5 font-body text-[14px] xs:text-[16px] text-paper/85 leading-snug">
                  One code for the whole crew. It is displayed on the big screen.
                </p>
                <label htmlFor="code" className="label mb-1 block text-[11px] xs:text-[12px] text-gold">Crew code</label>
                <input
                  id="code"
                  className={`${inputCls} uppercase tracking-[0.3em]`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={32}
                  placeholder="CODE"
                />
                <button
                  type="submit"
                  className="mt-3 xs:mt-4 min-h-[52px] xs:min-h-[58px] w-full border-2 border-ink bg-red font-display text-[22px] xs:text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none hover:bg-alarm transition-colors"
                >
                  Enter the vault
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); next2(); }}>
                {/* Confidential Dossier Graphic: compact on mobile */}
                <div className="my-1.5 xs:my-2 bg-ink/60 border border-paper/15 p-1 rounded">
                  <DossierGraphic height={75} />
                </div>

                <h1 className="display mb-0.5 text-[30px] xs:text-[36px]">Your cover story</h1>
                <p className="mb-2 font-body text-[14px] xs:text-[16px] text-paper/85 leading-snug">
                  A codename for the leaderboard and mobile number for gift handover.
                </p>
                <label htmlFor="name" className="label mb-1 block text-[11px] xs:text-[12px] text-gold">
                  Codename ({NAME_MIN} to {NAME_MAX} characters)
                </label>
                <input
                  id="name"
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={NAME_MAX + 6}
                  autoComplete="nickname"
                  placeholder="e.g. TOKYO / BERLIN"
                />
                <label htmlFor="phone" className="label mb-1 mt-2.5 block text-[11px] xs:text-[12px] text-gold">Mobile number</label>
                <div className="flex">
                  <span className="flex items-center border-2 border-r-0 border-paper/40 bg-plate px-2.5 font-type text-[18px] xs:text-[20px] text-gold">+91</span>
                  <input
                    id="phone"
                    className={inputCls}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={14}
                    placeholder="10 digits"
                  />
                </div>
                <p className="label mt-1.5 text-[10px] text-paper/70 leading-relaxed">
                  Confidential. Never broadcasted. Used solely to award prizes.
                </p>
                <div className="mt-3 xs:mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setErr(''); setStep(1); }}
                    className="min-h-[52px] xs:min-h-[58px] border-2 border-paper/50 px-3.5 font-display text-[18px] xs:text-[20px] uppercase text-paper hover:border-paper"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="min-h-[52px] xs:min-h-[58px] flex-1 border-2 border-ink bg-red font-display text-[22px] xs:text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none hover:bg-alarm transition-colors"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div>
                {/* Selected Character Preview Banner */}
                <div className="my-1.5 xs:my-2 bg-ink border-2 border-gold/80 p-2 xs:p-2.5 rounded flex items-center gap-3 shadow-md">
                  <Avatar id={avatar} size={54} />
                  <div className="text-left min-w-0 flex-1">
                    <span className="label text-[9px] xs:text-[10px] text-gold uppercase tracking-wider font-bold block">
                      Selected Operative:
                    </span>
                    <p className="display text-[22px] xs:text-[26px] text-paper leading-tight truncate">
                      {getAvatarMeta(avatar).name}
                    </p>
                    <p className="label text-[10px] xs:text-[11px] text-gold/90 truncate">
                      {getAvatarMeta(avatar).role}
                    </p>
                  </div>
                </div>

                <h1 className="display mb-0.5 text-[28px] xs:text-[32px]">Pick your character</h1>
                <p className="mb-1.5 font-body text-[13px] xs:text-[15px] text-paper/85 leading-snug">
                  Choose your Money Heist movie character for the live leaderboard:
                </p>
                <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-4 gap-1.5 xs:gap-2 max-h-[175px] xs:max-h-[210px] overflow-y-auto pr-1">
                  {Array.from({ length: AVATAR_COUNT }, (_, i) => {
                    const meta = getAvatarMeta(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={avatar === i}
                        onClick={() => setAvatar(i)}
                        title={`${meta.name} - ${meta.role}`}
                        className={`flex flex-col items-center justify-center p-1 rounded transition-all ${
                          avatar === i ? 'bg-gold ring-2 ring-paper scale-105 shadow-md' : 'bg-ink hover:bg-plate'
                        }`}
                      >
                        <Avatar id={i} size={42} />
                        <span className={`label truncate max-w-[62px] text-[9px] mt-0.5 ${avatar === i ? 'text-ink font-bold' : 'text-paper/80'}`}>
                          {meta.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 xs:mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setErr(''); setStep(2); }}
                    className="min-h-[52px] xs:min-h-[58px] border-2 border-paper/50 px-3.5 font-display text-[18px] xs:text-[20px] uppercase text-paper"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submit}
                    className="min-h-[52px] xs:min-h-[58px] flex-1 border-2 border-ink bg-red font-display text-[22px] xs:text-[26px] uppercase tracking-wide text-paper shadow-press active:translate-y-1 active:shadow-none disabled:opacity-60 hover:bg-alarm transition-colors"
                  >
                    {busy ? 'Entering...' : 'Join crew'}
                  </button>
                </div>
              </div>
            )}

            {err && (
              <p role="alert" className="mt-2.5 border-l-4 border-red bg-ink px-2.5 py-1.5 font-body text-[15px] font-semibold text-paper">
                {err}
              </p>
            )}
          </Plate>

          <TacticalBlueprintBanner className="mt-3" />
        </main>
      </div>
      <Footer />
    </div>
  );
}
