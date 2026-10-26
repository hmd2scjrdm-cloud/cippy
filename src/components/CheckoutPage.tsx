import React, { useState } from 'react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { Landmark, CreditCard, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2, XCircle, BookUser, X, ClipboardPaste } from 'lucide-react';
import { sizeLabel } from '../lib/productLocalization';
import { useSiteConfig } from '../lib/siteConfig';
import { splitStreetIntoLines } from '../lib/checkoutAddressImport';

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
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state: string;
  postalCode: string;
}

const ADDRESS_BOOK_KEY = 'cippy_saved_addresses';

interface PastedDeliveryDetails {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
}

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
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [address3, setAddress3] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [pastedDeliveryText, setPastedDeliveryText] = useState("");
  const [pasteResult, setPasteResult] = useState<string | null>(null);
  const [needsAddressConfirmation, setNeedsAddressConfirmation] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
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
  const siteConfig = useSiteConfig();
  const shippingThreshold = siteConfig.freeShippingMin;
  const isFreeShipping = subtotal >= shippingThreshold;
  const isEastMalaysia = ['Sabah', 'Sarawak', 'Labuan'].includes(state);
  const shippingCost = isFreeShipping ? 0 : (isEastMalaysia ? siteConfig.shippingEast : siteConfig.shippingWest);
  const giftBoxFee = giftBoxTopup ? 10 : 0;
  const grandTotal = subtotal + shippingCost + giftBoxFee;
  const hasPreorderItems = cartItems.some(item => item.product.isPreorder);

  const applySavedAddress = (addr: SavedAddress) => {
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddress1(addr.address1 || addr.address || "");
    setAddress2(addr.address2 || "");
    setAddress3(addr.address3 || "");
    setCity(addr.city || "");
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setNeedsAddressConfirmation(false);
    setAddressConfirmed(false);
  };

  const fillFromPastedText = () => {
    const parser = (window as Window & { parseCippyOrderText?: (text: string) => PastedDeliveryDetails }).parseCippyOrderText;
    if (!pastedDeliveryText.trim() || !parser) {
      setPasteResult(tx('Paste your delivery details first.', '请先粘贴收件资料。'));
      return;
    }
    const parsed = parser(pastedDeliveryText);
    const addressLines = splitStreetIntoLines(parsed.street);
    if (parsed.street && !addressLines.length) {
      setPasteResult(tx('The address is too long to split safely. Please enter it manually.', '地址太长，无法安全分成三行，请手动填写。'));
      return;
    }
    const found = [parsed.name, parsed.phone, parsed.email, parsed.street, parsed.city, parsed.state, parsed.postcode].filter(Boolean).length;
    if (!found) {
      setPasteResult(tx('We could not recognise delivery details. Please fill in the form manually.', '未能识别收件资料，请手动填写。'));
      return;
    }
    if (parsed.name) setFullName(parsed.name.slice(0, 35));
    if (!currentUser && parsed.email) setEmail(parsed.email);
    setPhone(parsed.phone || '');
    setAddress1(addressLines[0] || '');
    setAddress2(addressLines[1] || '');
    setAddress3(addressLines[2] || '');
    setCity(parsed.city || '');
    setState(MALAYSIAN_STATES.includes(parsed.state) ? parsed.state : '');
    setPostalCode(parsed.postcode || '');
    setNeedsAddressConfirmation(true);
    setAddressConfirmed(false);
    setErrorMsg(null);
    setPasteResult(tx('Details filled. Check every field below, especially your address, state and postcode.', '已填入资料。请逐项核对，特别是地址、州属和邮编。'));
  };

  const removeSavedAddress = (id: string) => {
    const next = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(next);
    localStorage.setItem(ADDRESS_BOOK_KEY, JSON.stringify(next));
  };

  const maybeSaveAddress = () => {
    if (!saveAddressChecked) return;
    const exists = savedAddresses.some(a => a.address1 === address1 && a.address2 === address2 && a.address3 === address3 && a.city === city && a.postalCode === postalCode && a.phone === phone);
    if (exists) return;
    const next = [...savedAddresses, { id: `addr-${Date.now()}`, fullName, phone, address: [address1, address2, address3, city].filter(Boolean).join(', '), address1, address2, address3, city, state, postalCode }];
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
      color: item.product.selectedColor,
      preorder: item.product.isPreorder,
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
    if (!fullName.trim() || !phone.trim() || !address1.trim() || !city.trim() || !state || !postalCode.trim()) {
      setErrorMsg(tx("Please fill in all required delivery details!", "请填写所有必填的配送信息哦。"));
      return false;
    }
    if (needsAddressConfirmation && !addressConfirmed) {
      setErrorMsg(tx('Please check the auto-filled delivery details and confirm the address.', '请先核对自动填入的收件资料，并确认地址无误。'));
      return false;
    }
    if (!currentUser && !email) {
      setErrorMsg(tx("Please enter your email for guest checkout.", "访客结账需要填写邮箱地址。"));
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(tx("Please enter a valid email address.", "请输入有效的邮箱地址。"));
      return false;
    }
    const normalizedPhone = phone.replace(/[\s-]/g, '');
    if (!/^(?:\+?60|0)1\d{8,9}$/.test(normalizedPhone)) {
      setErrorMsg(tx("Please enter a valid Malaysian mobile number, for example 012-3456789.", "请输入有效的马来西亚手机号码，例如 012-3456789。"));
      return false;
    }
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setErrorMsg(tx("Malaysian postcodes must contain 5 digits.", "马来西亚邮政编码应为 5 位数字。"));
      return false;
    }
    if ([fullName, address1, address2, address3, city].some(value => value.trim().length > 35)) {
      setErrorMsg(tx('Each recipient name, address line and city must be 35 characters or fewer.', '收件姓名、每行地址和城市不可超过 35 个字符。'));
      return false;
    }
    return true;
  };

  const buildRequestBody = (proofUrl?: string | null) => ({
    customer: {
      name: fullName,
      email: email || currentUser?.email,
      phone,
      address: `${[address1, address2, address3, city].map(value => value.trim()).filter(Boolean).join(', ')}, ${postalCode.trim()} ${state}, Malaysia`,
      address1: address1.trim(),
      address2: address2.trim(),
      address3: address3.trim(),
      city: city.trim(),
      state,
      postcode: postalCode.trim(),
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
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : { error: await res.text() };
      if (!res.ok) {
        throw new Error(data.error || tx('Could not start Stripe checkout. Please choose DuitNow or try again later.', '无法启动信用卡结账，请先使用 DuitNow 或稍后再试。'));
      }
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
      {hasPreorderItems && (
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-[11px] leading-relaxed text-violet-700">
          <strong className="block">{tx('This order contains preorder items', '此订单包含预购商品')}</strong>
          {tx('Preorder items are expected to ship in 7–21 working days. Ready-stock items in the same order may ship together with the preorder items.', '预购商品预计 7–21 个工作日发货。同一订单内的现货可能会等待预购商品到货后一起寄出。')}
        </div>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {cartItems.map(item => (
          <div key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-2 text-xs">
            <div className="w-10 h-12 rounded-md overflow-hidden bg-pink-50 shrink-0">
              {item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.name} referrerPolicy="no-referrer" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-zinc-700">{tx(item.product.name, item.product.cnName)}</p>
              <p className="text-zinc-400">{sizeLabel(item.selectedSize, lang)} × {item.quantity}</p>
              {item.product.isPreorder && (
                <span className="mt-1 inline-flex rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {tx('PREORDER · 7–21 working days', '预购商品 · 预计 7–21 个工作日')}
                </span>
              )}
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
          <img src="/assets/payment/duitnow-cippy-kl.jpeg" alt="CIPPY.KL DuitNow QR" className="w-full max-w-60 h-auto mx-auto" />
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

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-600">
        <div className="rounded-xl border border-pink-100 bg-white px-3 py-2.5">{tx('Ready stock: dispatch in 1-3 working days', '现货：1–3 个工作日内发货')}</div>
        <div className="rounded-xl border border-pink-100 bg-white px-3 py-2.5">{tx(`West MY RM${siteConfig.shippingWest} · East MY RM${siteConfig.shippingEast} · Free from RM${siteConfig.freeShippingMin}`, `西马 RM${siteConfig.shippingWest} · 东马 RM${siteConfig.shippingEast} · 满 RM${siteConfig.freeShippingMin} 免邮`)}</div>
        <div className="rounded-xl border border-pink-100 bg-white px-3 py-2.5">{tx('Card via Stripe or DuitNow QR', 'Stripe 信用卡或 DuitNow QR')}</div>
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

            <details className="border-b border-pink-100 pb-4 text-xs">
              <summary className="flex cursor-pointer items-center gap-2 text-[#B96A73] font-semibold">
                <ClipboardPaste className="h-4 w-4" />
                {tx('Paste delivery details to fill this form', '粘贴收件资料，自动填表')}
              </summary>
              <div className="mt-3 space-y-2">
                <label htmlFor="checkout-paste" className="block text-zinc-500">{tx('Your delivery details', '收件资料')}</label>
                <textarea id="checkout-paste" rows={4} maxLength={3000} value={pastedDeliveryText} onChange={e => setPastedDeliveryText(e.target.value)}
                  placeholder={tx('Name: Amy Tan\nPhone: 012-3456789\nAddress: No. 12 Jalan Mawar, 43000 Kajang, Selangor', '收件人：Amy Tan\n电话：012-3456789\n地址：No. 12 Jalan Mawar, 43000 Kajang, Selangor')}
                  className="w-full resize-y rounded-lg border border-pink-100 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:border-pink-300" />
                <button type="button" onClick={fillFromPastedText} className="border border-[#B96A73] px-3 py-2 text-[#B96A73] font-semibold hover:bg-pink-50">
                  {tx('Fill delivery form', '识别并填入')}
                </button>
                <p className="text-[11px] leading-relaxed text-zinc-500">{tx('Auto-fill may be inaccurate. Please double-check the recipient name, phone, full address, state and postcode before ordering.', '自动识别不一定准确。下单前请再次核对收件人、电话、完整地址、州属和邮编。')}</p>
                {pasteResult && <p role="status" className="text-[11px] font-medium text-[#8f545d]">{pasteResult}</p>}
              </div>
            </details>

            {!currentUser && (
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('Email *', '邮箱 *')}</label>
                <input id="checkout-email" name="email" autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Full Name *', '收件人姓名 *')}</label>
              <input id="checkout-name" name="name" autoComplete="name" type="text" required maxLength={35} value={fullName} onChange={e => setFullName(e.target.value)} placeholder={tx('Full name', '收件人姓名')}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Phone Number *', '联系电话 *')}</label>
              <input id="checkout-phone" name="tel" autoComplete="tel" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="012-3456789" inputMode="tel"
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Address line 1 *', '地址第 1 行 *')}</label>
              <input id="checkout-address" name="address-line1" autoComplete="address-line1" required maxLength={35} value={address1} onChange={e => setAddress1(e.target.value)} placeholder={tx('Unit / house number and street', '门牌、楼层及街道')}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Address line 2 (optional)', '地址第 2 行（选填）')}</label>
              <input id="checkout-address2" name="address-line2" autoComplete="address-line2" maxLength={35} value={address2} onChange={e => setAddress2(e.target.value)} placeholder={tx('Building or neighbourhood', '大厦或住宅区')}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('Address line 3 (optional)', '地址第 3 行（选填）')}</label>
              <input id="checkout-address3" maxLength={35} value={address3} onChange={e => setAddress3(e.target.value)} placeholder={tx('Additional address details', '其他地址补充')}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="block text-zinc-500 font-medium">{tx('City *', '城市 *')}</label>
              <input id="checkout-city" name="address-level2" autoComplete="address-level2" required maxLength={35} value={city} onChange={e => setCity(e.target.value)} placeholder={tx('City / town', '城市 / 城镇')}
                className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('State *', '收件州属 *')}</label>
                <select id="checkout-state" name="address-level1" autoComplete="address-level1" value={state} onChange={e => setState(e.target.value)}
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300">
                  <option value="">{tx('Select state', '选择州属')}</option>
                  {MALAYSIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="block text-zinc-500 font-medium">{tx('Postcode *', '邮政编码 *')}</label>
                <input id="checkout-postcode" name="postal-code" autoComplete="postal-code" inputMode="numeric" maxLength={5} type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="50000"
                  className="w-full text-sm bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300" />
              </div>
            </div>

            {needsAddressConfirmation && (
              <label className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-600 cursor-pointer">
                <input type="checkbox" checked={addressConfirmed} onChange={e => setAddressConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#B96A73]" />
                <span>{tx('I have checked the auto-filled name, phone and full delivery address.', '我已再次核对自动填入的姓名、电话和完整收件地址。')}</span>
              </label>
            )}

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
                <span className="text-[10px] font-semibold">{tx('DuitNow QR', 'DuitNow QR')}</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('stripe')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 cursor-pointer transition-all ${paymentMethod === 'stripe' ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]' : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}>
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{tx('Debit / Credit Card', '银行卡 / 信用卡')}</span>
              </button>
            </div>

            {paymentMethod === 'manual' && (
              <div className="p-4 bg-[#FFFBF7] border border-amber-900/10 rounded-xl text-xs text-zinc-600 leading-relaxed space-y-3">
                <p className="font-bold text-zinc-800">{tx('DuitNow QR Transfer', 'DuitNow QR 转账')}</p>
                <img src="/assets/payment/duitnow-cippy-kl.jpeg" alt="CIPPY.KL DuitNow QR" className="w-full max-w-60 h-auto mx-auto" />
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
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-[11px] leading-relaxed text-zinc-600">
                {tx('You will be redirected to Stripe’s secure checkout to enter your Visa or Mastercard details. Cippy does not store your card number.', '您将跳转至 Stripe 安全付款页面输入 Visa 或 Mastercard 资料。Cippy 不会储存您的银行卡号码。')}
              </div>
            )}

            <p className="text-[10px] leading-relaxed text-zinc-400">
              {tx('FPX and TNG eWallet are not currently available. Please use DuitNow QR or card payment.', '目前暂不支持 FPX 与 TNG eWallet，请使用 DuitNow QR 或银行卡付款。')}
            </p>

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
            data-track-conversion="place_order"
            className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isPlacing
              ? tx('Processing...', '处理中...')
              : hasPreorderItems
                ? tx('Confirm Preorder', '确认预购订单')
                : tx('Place Order', '确认订购')}
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
