import React, { useEffect, useRef, useState } from 'react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { Landmark, CreditCard, Wallet, ShieldCheck, Sparkles, Upload, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  giftBoxTopup: boolean;
  lang: 'en' | 'zh';
  currentUser: any;
  onOrderComplete: () => void;
  onBack: () => void;
  returnState: { status: 'success' | 'cancelled'; orderId?: string } | null;
  isConfirmingReturn: boolean;
  onDismissReturnState: () => void;
}

const MALAYSIAN_STATES = [
  "Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak",
  "Perak", "Kedah", "Melaka", "Negeri Sembilan", "Pahang", "Kelantan",
  "Terengganu", "Perlis", "Labuan", "Putrajaya"
];

type PaymentMethod = 'manual' | 'stripe' | 'paypal';

export default function CheckoutPage({
  cartItems,
  giftBoxTopup,
  lang,
  currentUser,
  onOrderComplete,
  onBack,
  returnState,
  isConfirmingReturn,
  onDismissReturnState
}: CheckoutPageProps) {
  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const [fullName, setFullName] = useState(currentUser?.user_metadata?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Selangor");
  const [postalCode, setPostalCode] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('manual');
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualOrderPlaced, setManualOrderPlaced] = useState<{ orderId: string; total: number } | null>(null);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingThreshold = 150;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 10;
  const giftBoxFee = giftBoxTopup ? 10 : 0;
  const grandTotal = subtotal + shippingCost + giftBoxFee;

  const buildItemsPayload = () => {
    const items: any[] = cartItems.map(item => ({
      product_id: item.product.id,
      id: item.product.id,
      name: item.product.name,
      name_zh: item.product.cnName,
      qty: item.quantity,
      size: item.selectedSize,
      image_url: item.product.imageUrl,
    }));
    if (giftBoxTopup) {
      items.push({
        _is_discount: true,
        price_myr: 10,
        qty: 1,
        name: "Luxury Gift Wrapping",
        name_zh: "奢华礼盒包装",
      });
    }
    return items;
  };

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  };

  const validateForm = () => {
    if (!fullName || !phone || !address || !postalCode) {
      setErrorMsg(tx("Please fill in all required delivery details!", "请填写所有必填的配送信息哦。"));
      return false;
    }
    if (!currentUser && !email) {
      setErrorMsg(tx("Please enter your email for guest checkout.", "访客结账需要填写邮箱地址。"));
      return false;
    }
    return true;
  };

  const buildRequestBody = () => ({
    customer: { name: fullName, email: email || currentUser?.email, phone, address: `${address}, ${postalCode} ${state}, Malaysia` },
    items: buildItemsPayload(),
    totals: { subtotal, shipping: shippingCost, total: grandTotal },
    giftNote: specialNotes,
    guestMode: !currentUser,
  });

  const handleManualSubmit = async () => {
    if (!validateForm()) return;
    setErrorMsg(null);
    setIsPlacing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/create-duitnow-order.js'.replace('.js', ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(buildRequestBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tx('Order failed', '下单失败'));
      setManualOrderPlaced({ orderId: data.orderId, total: data.total });
      onOrderComplete();
    } catch (e: any) {
      setErrorMsg(e.message || tx('Something went wrong, please try again.', '出了点问题，请重试。'));
    } finally {
      setIsPlacing(false);
    }
  };

  const handleStripeSubmit = async () => {
    if (!validateForm()) return;
    setErrorMsg(null);
    setIsPlacing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(buildRequestBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tx('Could not start Stripe checkout', '无法启动 Stripe 结账'));
      window.location.href = data.url;
    } catch (e: any) {
      setErrorMsg(e.message || tx('Something went wrong, please try again.', '出了点问题，请重试。'));
      setIsPlacing(false);
    }
  };

  // Load PayPal SDK + render buttons when PayPal method selected
  useEffect(() => {
    if (paymentMethod !== 'paypal') return;
    const clientId = (import.meta as any).env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setErrorMsg(tx('PayPal is not configured yet.', 'PayPal 尚未配置。'));
      return;
    }

    const renderButtons = () => {
      if (!(window as any).paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = '';
      (window as any).paypal.Buttons({
        createOrder: async () => {
          if (!validateForm()) throw new Error('validation');
          setErrorMsg(null);
          const token = await getAuthToken();
          const res = await fetch('/api/paypal-create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(buildRequestBody()),
          });
          const data = await res.json();
          if (!res.ok) { setErrorMsg(data.error || tx('Could not start PayPal checkout', '无法启动 PayPal 结账')); throw new Error(data.error); }
          (window as any).__cippyOrderId = data.orderId;
          return data.paypalOrderId;
        },
        onApprove: async (data: any) => {
          setIsPlacing(true);
          try {
            const token = await getAuthToken();
            const res = await fetch('/api/paypal-capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: JSON.stringify({ orderId: (window as any).__cippyOrderId, paypalOrderId: data.orderID }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || tx('Payment could not be confirmed', '支付确认失败'));
            setManualOrderPlaced({ orderId: (window as any).__cippyOrderId, total: grandTotal });
            onOrderComplete();
          } catch (e: any) {
            setErrorMsg(e.message || tx('Payment could not be confirmed', '支付确认失败'));
          } finally {
            setIsPlacing(false);
          }
        },
        onError: () => {
          setErrorMsg(tx('PayPal encountered an error. Please try again.', 'PayPal 遇到问题，请重试。'));
        },
      }).render(paypalContainerRef.current);
      setPaypalReady(true);
    };

    if ((window as any).paypal) {
      renderButtons();
    } else {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${(import.meta as any).env.VITE_PAYPAL_CURRENCY || 'USD'}`;
      script.onload = renderButtons;
      document.body.appendChild(script);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  const orderSummary = (
    <div className="bg-white border border-[#FBEBF0] rounded-2xl p-5 space-y-3 sticky top-6">
      <h3 className="text-sm font-serif font-bold text-zinc-800 border-b border-pink-100 pb-2">
        {tx("Order Summary", "订单摘要")}
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {cartItems.map(item => (
          <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-2 text-xs">
            <div className="w-10 h-12 rounded-md overflow-hidden bg-pink-50 shrink-0">
              {item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.name} referrerPolicy="no-referrer" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-zinc-700">{tx(item.product.name, item.product.cnName)}</p>
              <p className="text-zinc-400">{item.selectedSize} × {item.quantity}</p>
            </div>
            <span className="font-mono text-zinc-600">RM {item.product.price * item.quantity}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-pink-100 pt-2 space-y-1 text-xs">
        <div className="flex justify-between text-zinc-500"><span>{tx('Subtotal', '小计')}</span><span className="font-mono">RM {subtotal}.00</span></div>
        {giftBoxTopup && <div className="flex justify-between text-zinc-500"><span>{tx('Gift Wrapping', '礼盒包装')}</span><span className="font-mono">RM 10.00</span></div>}
        <div className="flex justify-between text-zinc-500"><span>{tx('Shipping', '运费')}</span><span className="font-mono">{isFreeShipping ? tx('FREE', '包邮') : `RM ${shippingCost}.00`}</span></div>
        <div className="flex justify-between text-sm pt-1 border-t border-pink-100/60"><span className="font-bold text-zinc-800">{tx('Total', '总计')}</span><span className="font-mono font-bold text-[#B96A73]">RM {grandTotal}.00</span></div>
      </div>
    </div>
  );

  // Return from Stripe/PayPal redirect
  if (isConfirmingReturn) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-3">
        <div className="w-14 h-14 border-4 border-pink-200 border-t-[#B96A73] rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-500">{tx('Confirming your payment...', '正在确认您的付款...')}</p>
      </div>
    );
  }

  if (returnState?.status === 'success') {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border-2 border-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-zinc-800">{tx('Payment Successful!', '支付成功！')}</h2>
          <p className="text-sm text-zinc-500">{tx('Order', '订单号')} #{returnState.orderId}</p>
        </div>
        <button onClick={onDismissReturnState} className="px-6 py-3 bg-[#B96A73] hover:bg-[#a55962] text-white rounded-xl text-xs font-semibold cursor-pointer">
          {tx('Continue Shopping', '继续购物')}
        </button>
      </div>
    );
  }

  if (returnState?.status === 'cancelled') {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-zinc-100 rounded-full mx-auto flex items-center justify-center border-2 border-zinc-200">
          <XCircle className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-xl font-serif font-bold text-zinc-800">{tx('Payment Cancelled', '支付已取消')}</h2>
        <button onClick={onDismissReturnState} className="px-6 py-3 bg-[#B96A73] hover:bg-[#a55962] text-white rounded-xl text-xs font-semibold cursor-pointer">
          {tx('Back to Checkout', '返回结账')}
        </button>
      </div>
    );
  }

  if (manualOrderPlaced) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto flex items-center justify-center border-2 border-pink-200">
          <CheckCircle2 className="w-10 h-10 text-[#B96A73]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-zinc-800">{tx('Order Placed!', '订单已提交！')}</h2>
          <p className="text-sm text-zinc-500">{tx('Order', '订单号')} #{manualOrderPlaced.orderId}</p>
        </div>
        {paymentMethod === 'manual' && (
          <div className="bg-[#FFFBF7] border border-amber-900/10 rounded-xl p-4 text-left text-xs text-zinc-600 space-y-2">
            <p className="font-bold text-zinc-800">{tx('Bank Transfer Details:', '银行转账信息：')}</p>
            <div className="bg-white/80 p-3 rounded-lg font-mono space-y-1">
              <div>{tx('Bank: CIMB BANK MALAYSIA', '收款银行：大马联昌银行 (CIMB BANK)')}</div>
              <div>{tx('Account Name: CIPPY STUDIO ENT', '收款姓名：CIPPY STUDIO ENT')}</div>
              <div>{tx('Account Number: 8605 9182 3200', '收款账号：8605 9182 3200')}</div>
            </div>
            <p>{tx(`Please transfer RM ${manualOrderPlaced.total.toFixed(2)} with reference #${manualOrderPlaced.orderId}, then send your receipt via WhatsApp.`, `请转账 RM ${manualOrderPlaced.total.toFixed(2)}，备注订单号 #${manualOrderPlaced.orderId}，并通过 WhatsApp 发送转账凭证。`)}</p>
            <a href="https://wa.me/601120861073" target="_blank" rel="noreferrer" className="inline-block mt-1 text-[#B96A73] font-bold underline">
              WhatsApp +601120861073
            </a>
          </div>
        )}
        <button onClick={onDismissReturnState} className="px-6 py-3 bg-[#B96A73] hover:bg-[#a55962] text-white rounded-xl text-xs font-semibold cursor-pointer">
          {tx('Continue Shopping', '继续购物')}
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <p className="text-zinc-500 text-sm">{tx('Your bag is empty.', '购物袋是空的。')}</p>
        <button onClick={onBack} className="px-6 py-3 bg-[#B96A73] hover:bg-[#a55962] text-white rounded-xl text-xs font-semibold cursor-pointer">
          {tx('Continue Shopping', '继续购物')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#B96A73] mb-6 cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> {tx('Back to Shop', '返回商店')}
      </button>

      <div className="flex items-center gap-2 mb-8">
        <ShieldCheck className="w-5 h-5 text-[#B96A73]" />
        <h1 className="text-2xl font-serif font-bold text-zinc-800">{tx('Secure Checkout', '安全结账')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping form */}
          <div className="bg-white border border-[#FBEBF0] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#B96A73] uppercase tracking-wider border-b border-pink-100 pb-2">
              {tx('1. Shipping Information', '1. 配送信息')}
            </h3>

            {!currentUser && (
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('Email *', '邮箱 *')}</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Full Name *', '收件人姓名 *')}</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Phone Number *', '联系电话 *')}</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Delivery Address *', '收件详细地址 *')}</label>
              <textarea required rows={2} value={address} onChange={e => setAddress(e.target.value)}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:border-pink-300 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('State *', '收件州属 *')}</label>
                <select value={state} onChange={e => setState(e.target.value)}
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300">
                  {MALAYSIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('Postcode *', '邮政编码 *')}</label>
                <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)}
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Gift Note (Optional)', '附赠祝福语 (非必填)')}</label>
              <input type="text" value={specialNotes} onChange={e => setSpecialNotes(e.target.value)}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-[#FBEBF0] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#B96A73] uppercase tracking-wider border-b border-pink-100 pb-2">
              {tx('2. Payment Method', '2. 支付方式')}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMethod('manual')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <Landmark className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{tx('Manual Transfer', '人工转账')}</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{tx('Card (Stripe)', '信用卡 (Stripe)')}</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-semibold">PayPal</span>
              </button>
            </div>

            {paymentMethod === 'manual' && (
              <div className="p-4 bg-[#FFFBF7] border border-amber-900/10 rounded-xl text-xs text-zinc-600 leading-relaxed space-y-2">
                <p className="font-bold text-zinc-800">{tx('Bank Transfer', '银行转账')}</p>
                <p>{tx('After placing your order, you will receive our bank details by email. Transfer the total amount and send us your receipt via WhatsApp — we will confirm within 1 hour.', '提交订单后，您将通过邮件收到我们的银行账户信息。转账后请通过 WhatsApp 发送收据，我们会在 1 小时内为您确认。')}</p>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div className="p-4 bg-pink-50/10 border border-pink-100 rounded-xl text-xs text-zinc-600 leading-relaxed flex items-start gap-2">
                <Upload className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p>{tx("You'll be redirected to Stripe's secure checkout page to enter your card details.", '您将被跳转至 Stripe 安全结账页面填写卡片信息。')}</p>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="space-y-2">
                <div ref={paypalContainerRef} className="min-h-[45px]" />
                {!paypalReady && (
                  <p className="text-[10px] text-zinc-400">{tx('Loading PayPal...', '正在加载 PayPal...')}</p>
                )}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{errorMsg}</div>
          )}

          {paymentMethod !== 'paypal' && (
            <button
              onClick={paymentMethod === 'manual' ? handleManualSubmit : handleStripeSubmit}
              disabled={isPlacing}
              className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isPlacing ? tx('Processing...', '处理中...') : tx('Place Order', '确认订购')}
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="lg:col-span-5">
          {orderSummary}
        </div>
      </div>
    </div>
  );
}
