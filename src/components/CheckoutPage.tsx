import React, { useState } from 'react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { Landmark, CreditCard, ShieldCheck, Sparkles, Upload, ArrowLeft, CheckCircle2, XCircle, BookUser, X } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  giftBoxTopup: boolean;
  lang: 'en' | 'zh';
  currentUser: any;
  onOrderComplete: () => void;
  onBack: () => void;
  onViewPolicies: () => void;
  returnState: { status: 'success' | 'cancelled'; orderId?: string } | null;
  isConfirmingReturn: boolean;
  onDismissReturnState: () => void;
}

const MALAYSIAN_STATES = [
  "Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak",
  "Perak", "Kedah", "Melaka", "Negeri Sembilan", "Pahang", "Kelantan",
  "Terengganu", "Perlis", "Labuan", "Putrajaya"
];

type PaymentMethod = 'manual' | 'stripe';

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  state: string;
  postalCode: string;
}

const ADDRESS_BOOK_KEY = 'cippy_saved_addresses';

function loadSavedAddresses(): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_BOOK_KEY) || '[]');
  } catch {
    return [];
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CheckoutPage({
  cartItems,
  giftBoxTopup,
  lang,
  currentUser,
  onOrderComplete,
  onBack,
  onViewPolicies,
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('manual');
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stripeRedirectUrl, setStripeRedirectUrl] = useState<string | null>(null);
  const [manualOrderPlaced, setManualOrderPlaced] = useState<{ orderId: string; total: number } | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(loadSavedAddresses);
  const [saveAddressChecked, setSaveAddressChecked] = useState(true);

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingThreshold = 150;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 10;
  const giftBoxFee = giftBoxTopup ? 10 : 0;
  const grandTotal = subtotal + shippingCost + giftBoxFee;

  const applySavedAddress = (addr: SavedAddress) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress(addr.address);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };

  const removeSavedAddress = (id: string) => {
    const next = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(next);
    localStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(next));
  };

  const maybeSaveAddress = () => {
    if (!saveAddressChecked) return;
    const exists = savedAddresses.some(a => a.address === address && a.postalCode === postalCode && a.phone === phone);
    if (exists) return;
    const next = [...savedAddresses, { id: `addr-${Date.now()}`, fullName, phone, address, state, postalCode }];
    setSavedAddresses(next);
    localStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(next));
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreviewUrl(URL.createObjectURL(file));
  };

  const uploadProofIfAny = async (): Promise<string | null> => {
    if (!proofFile) return null;
    setIsUploadingProof(true);
    try {
      const fileBase64 = await fileToBase64(proofFile);
      const res = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, fileName: proofFile.name, contentType: proofFile.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.url as string;
    } catch {
      // Non-fatal — order still goes through, customer can send proof via WhatsApp instead.
      return null;
    } finally {
      setIsUploadingProof(false);
    }
  };

  const buildItemsPayload = () => {
    const items: any[] = cartItems.map(item => ({
      // Color variants get a suffixed cart-line id (e.g. "...-白色上衣") so each color is a
      // separate line — product_id must stay the real DB id or price verification fails.
      product_id: item.product.baseProductId || item.product.id,
      id: item.product.baseProductId || item.product.id,
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

  const buildRequestBody = (proofUrl?: string | null) => ({
    customer: {
      name: fullName,
      email: email || currentUser?.email,
      phone,
      address: `${address}, ${postalCode} ${state}, Malaysia`,
      ...(proofUrl ? { payment_proof_url: proofUrl } : {}),
    },
    items: buildItemsPayload(),
    totals: { subtotal, shipping: shippingCost, total: grandTotal },
    guestMode: !currentUser,
  });

  const handleManualSubmit = async () => {
    if (!validateForm()) return;
    setErrorMsg(null);
    setIsPlacing(true);
    try {
      const proofUrl = await uploadProofIfAny();
      const token = await getAuthToken();
      const res = await fetch('/api/create-duitnow-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(buildRequestBody(proofUrl)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || tx('Order failed', '下单失败'));
      maybeSaveAddress();
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
    setStripeRedirectUrl(null);
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
      const url = typeof data.url === 'string' ? data.url.trim() : '';
      if (!/^https:\/\//.test(url)) {
        throw new Error(tx('Stripe did not return a valid checkout link. Please try again.', 'Stripe 未返回有效的结账链接，请重试。'));
      }
      maybeSaveAddress();
      // Some browsers (notably Safari) can throw on this assignment for reasons unrelated to
      // the URL's actual validity — fall back to a manual link instead of leaving the user stuck.
      try {
        window.location.href = url;
      } catch {
        setStripeRedirectUrl(url);
        setIsPlacing(false);
      }
    } catch (e: any) {
      setErrorMsg(e.message || tx('Something went wrong, please try again.', '出了点问题，请重试。'));
      setIsPlacing(false);
    }
  };

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
      <p className="text-[10px] text-zinc-400 text-center leading-relaxed pt-1 border-t border-pink-100/60">
        {tx('By placing your order, you agree to our', '提交订单即表示您已阅读并同意我们的')}{' '}
        <button type="button" onClick={onViewPolicies} className="underline hover:text-[#B96A73] cursor-pointer">
          {tx('Terms & Conditions', '条款与政策')}
        </button>
      </p>
    </div>
  );

  // Return from Stripe redirect
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
    const waMessage = tx(
      `Hi, my order has been paid. Order number: ${manualOrderPlaced.orderId}. Here is my payment screenshot.`,
      `您好，我的订单已付款，订单号为：${manualOrderPlaced.orderId}，这是我的付款截图。`
    );
    const waConfirmUrl = `https://wa.me/601120861073?text=${encodeURIComponent(waMessage)}`;
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-5">
        <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto flex items-center justify-center border-2 border-pink-200">
          <CheckCircle2 className="w-10 h-10 text-[#B96A73]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold text-zinc-800">{tx('Order Placed!', '订单已提交！')}</h2>
          <p className="text-sm text-zinc-500">{tx('Order', '订单号')} #{manualOrderPlaced.orderId}</p>
        </div>
        <div className="bg-[#FFFBF7] border border-amber-900/10 rounded-xl p-4 text-left text-xs text-zinc-600 space-y-3">
          <p className="font-bold text-zinc-800">{tx('Scan to Pay via DuitNow QR:', '扫码 DuitNow QR 付款：')}</p>
          <img src="/assets/payment/duitnow-qr.jpg" alt="DuitNow QR" className="w-40 mx-auto rounded-lg border border-amber-900/10" />
          <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-red-700 font-semibold">
            {tx(
              `Please transfer the exact amount of RM ${manualOrderPlaced.total.toFixed(2)} only — not more, not less — for verification and anti-money-laundering compliance.`,
              `请务必转账订单确切金额 RM ${manualOrderPlaced.total.toFixed(2)}，不要多转或少转，以便核实并符合反洗黑钱规范。`
            )}
          </div>
          <p>{tx(`Reference: order #${manualOrderPlaced.orderId}. After transferring, tap the button below to send us your payment screenshot on WhatsApp.`, `转账备注：订单号 #${manualOrderPlaced.orderId}。转账完成后，请点击下方按钮，将付款截图发送给我们的 WhatsApp 客服。`)}</p>
          <a href={waConfirmUrl} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 mt-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 rounded-lg transition-colors">
            {tx('Confirm Payment on WhatsApp', '前往 WhatsApp 确认付款')}
          </a>
        </div>
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

            {savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider flex items-center gap-1">
                  <BookUser className="w-3 h-3" /> {tx('Address Book', '收件簿')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className="group relative">
                      <button type="button" onClick={() => applySavedAddress(addr)}
                        className="text-xs pl-3 pr-7 py-2 rounded-xl border border-pink-100 bg-pink-50/10 hover:border-[#B96A73] hover:bg-[#FFF0F2] text-zinc-600 hover:text-[#B96A73] transition-all cursor-pointer">
                        <span className="font-semibold">{addr.fullName}</span> · {addr.postalCode} {addr.state}
                      </button>
                      <button type="button" onClick={() => removeSavedAddress(addr.id)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-red-400 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <label className="flex items-center gap-2 text-[11px] text-zinc-500 cursor-pointer select-none pt-1">
              <input type="checkbox" checked={saveAddressChecked} onChange={e => setSaveAddressChecked(e.target.checked)}
                className="accent-[#B96A73] w-3.5 h-3.5 cursor-pointer" />
              {tx('Save this address for next time', '保存此地址以便下次使用')}
            </label>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-[#FBEBF0] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#B96A73] uppercase tracking-wider border-b border-pink-100 pb-2">
              {tx('2. Payment Method', '2. 支付方式')}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPaymentMethod('manual')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'manual' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <Landmark className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{tx('Manual Payment', '人工付款')}</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{tx('Card (Stripe)', '信用卡 (Stripe)')}</span>
              </button>
            </div>

            {paymentMethod === 'manual' && (
              <div className="p-4 bg-[#FFFBF7] border border-amber-900/10 rounded-xl text-xs text-zinc-600 leading-relaxed space-y-3">
                <p className="font-bold text-zinc-800">{tx('DuitNow QR Transfer', 'DuitNow QR 转账')}</p>
                <img src="/assets/payment/duitnow-qr.jpg" alt="DuitNow QR" className="w-32 mx-auto rounded-lg border border-amber-900/10" />
                <p className="text-red-700 font-semibold bg-red-50 border border-red-100 rounded-lg p-2">
                  {tx('Please transfer the exact order amount only — not more, not less — for verification and anti-money-laundering compliance.', '请务必转账订单确切金额，不要多转或少转，以便核实并符合反洗黑钱规范。')}
                </p>
                <p>{tx('After transferring, upload your DuitNow receipt below (or send it via WhatsApp) — we will confirm within 1 hour.', '转账后请在下方上传 DuitNow 转账凭证（或通过 WhatsApp 发送），我们会在 1 小时内为您确认。')}</p>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block">{tx('Upload DuitNow Receipt', '上传 DuitNow 转账凭证')}</span>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-white border border-pink-200 hover:border-pink-300 rounded-lg px-3 py-1.5 text-[10px] text-zinc-600 font-semibold transition-all">
                      {tx('Browse File', '浏览选择文件')}
                      <input type="file" accept="image/*" onChange={handleProofSelect} className="hidden" />
                    </label>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                      {proofFile ? proofFile.name : tx('No file chosen', '未选择任何凭证')}
                    </span>
                  </div>
                  {proofPreviewUrl && (
                    <div className="mt-2 w-14 h-18 rounded overflow-hidden border border-zinc-200">
                      <img src={proofPreviewUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'stripe' && (
              <div className="p-4 bg-pink-50/10 border border-pink-100 rounded-xl text-xs text-zinc-600 leading-relaxed flex items-start gap-2">
                <Upload className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p>{tx("You'll be redirected to Stripe's secure checkout page to enter your card details.", '您将被跳转至 Stripe 安全结账页面填写卡片信息。')}</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{errorMsg}</div>
          )}

          {stripeRedirectUrl && (
            <a
              href={stripeRedirectUrl}
              className="block text-center p-3 bg-[#FFF0F2] border border-pink-200 rounded-xl text-xs font-bold text-[#B96A73] hover:bg-[#FFE4E8] transition-colors"
            >
              {tx('Your order is ready — tap here to continue to Stripe payment', '订单已就绪 — 点击这里前往 Stripe 完成付款')}
            </a>
          )}

          <button
            onClick={paymentMethod === 'manual' ? handleManualSubmit : handleStripeSubmit}
            disabled={isPlacing || isUploadingProof}
            className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isPlacing ? tx('Processing...', '处理中...') : tx('Place Order', '确认订购')}
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-5">
          {orderSummary}
        </div>
      </div>
    </div>
  );
}
