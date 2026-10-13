import React, { useState } from 'react';
import { Bell, Check } from 'lucide-react';

interface Props {
  productId: string;
  color: string;
  size: string;
  lang: 'en' | 'zh';
}

const EMAIL_KEY = 'cippy_alert_email';

// "Prefer ready stock? Email me when it's back" — shown under a preorder selection.
export default function StockAlertBox({ productId, color, size, lang }: Props) {
  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(EMAIL_KEY) || ''; } catch { return ''; } });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  // a new size/colour needs a fresh sign-up
  React.useEffect(() => { setState('idle'); setError(''); }, [productId, color, size]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setError('');
    try {
      const r = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', productId, color, size, email: email.trim() }),
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
        {tx("Got it — we'll email you as soon as it's back in stock.", '好的，到货后我们会第一时间邮件通知你。')}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-pink-100 bg-pink-50/30 px-3 py-2.5 space-y-2">
      <div className="flex items-start gap-2 text-[11px] text-zinc-600">
        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B96A73]" />
        <span>{tx("Rather wait for ready stock? Leave your email and we'll tell you when it's back.", '想等现货？留下邮箱，到货时我们邮件通知你。')}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={tx('Your email', '你的邮箱')}
          className="min-w-0 flex-1 rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs focus:outline-none focus:border-[#B96A73]"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 rounded-lg bg-[#3F2B2B] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#2B1C1C] disabled:opacity-60 cursor-pointer"
        >
          {state === 'sending' ? '…' : tx('Notify me', '到货通知我')}
        </button>
      </div>
      {state === 'error' && <p className="text-[11px] text-red-500">{error || tx('Something went wrong, please try again.', '提交失败，请稍后再试。')}</p>}
    </form>
  );
}
