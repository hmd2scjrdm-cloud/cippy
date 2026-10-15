import React, { useState } from 'react';
import { Ruler, Check } from 'lucide-react';

interface Props {
  productId: string;
  lang: 'en' | 'zh';
}

const EMAIL_KEY = 'cippy_alert_email';
const SIZES = ['L', 'XL', 'XXL', 'XXXL', 'Other'];

// "Need a larger size? Tell us" — lets customers outside S–M register demand instead of just leaving.
export default function SizeRequestBox({ productId, lang }: Props) {
  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; } });
  const [wanted, setWanted] = useState('XL');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setError('');
    try {
      const r = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'size_request', email: email.trim(), wantedSize: wanted, heightCm: height, weightKg: weight, productId }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error || String(r.status));
      }
      try { localStorage.setItem(EMAIL_KEY, email.trim()); } catch { /* private mode */ }
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-700">
        <Check className="h-3.5 w-3.5 shrink-0" />
        {tx("Thank you — we've noted your size. If we add it, we'll email you first.", '谢谢你，我们已记录你的尺码需求。如果以后推出，会第一时间邮件通知你。')}
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[11px] text-[#B96A73] underline underline-offset-2 cursor-pointer">
        <Ruler className="h-3.5 w-3.5" />
        {tx('Need a larger size? Tell us', '需要更大尺码？告诉我们')}
      </button>
    );
  }

  const input = 'min-w-0 rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#B96A73]';
  return (
    <form onSubmit={submit} className="rounded-lg border border-pink-100 bg-pink-50/30 px-3 py-2.5 space-y-2">
      <p className="text-[11px] text-zinc-600">{tx("We're curious about the sizes you'd wear. Leave your details and we'll email you if we offer it.", '我们想了解你需要的尺码。留下信息，如果以后推出，会邮件通知你。')}</p>
      <div className="grid grid-cols-3 gap-2">
        <select value={wanted} onChange={(e) => setWanted(e.target.value)} className={input} aria-label={tx('Size you need', '需要的尺码')}>
          {SIZES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="number" inputMode="numeric" min="100" max="230" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={tx('Height cm', '身高 cm')} className={input} />
        <input type="number" inputMode="numeric" min="25" max="250" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={tx('Weight kg', '体重 kg')} className={input} />
      </div>
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tx('Your email', '你的邮箱')} className={`${input} flex-1`} />
        <button type="submit" disabled={state === 'sending'} className="shrink-0 rounded-lg bg-[#3F2B2B] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#2B1C1C] disabled:opacity-60 cursor-pointer">
          {state === 'sending' ? '…' : tx('Submit', '提交')}
        </button>
      </div>
      {state === 'error' && <p className="text-[11px] text-red-500">{error || tx('Something went wrong, please try again.', '提交失败，请稍后再试。')}</p>}
    </form>
  );
}
