import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Trash2, ArrowRight, Check, Sparkles, MapPin, Gift, CreditCard, Landmark, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: 'S' | 'M', change: number) => void;
  onRemoveItem: (productId: string, size: 'S' | 'M') => void;
  onClearCart: () => void;
  lang: 'en' | 'zh';
  currentUser: any; // Supabase auth user
  userProfile?: { points: number; total_spent: number; tier: string } | null;
  onRefreshProfileAndOrders?: () => void;
}

const MALAYSIAN_STATES = [
  "Kuala Lumpur", "Selangor", "Penang", "Johor", "Sabah", "Sarawak",
  "Perak", "Kedah", "Melaka", "Negeri Sembilan", "Pahang", "Kelantan",
  "Terengganu", "Perlis", "Labuan", "Putrajaya"
];

export default function ShoppingBagDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  lang,
  currentUser,
  userProfile,
  onRefreshProfileAndOrders
}: ShoppingBagProps) {
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.user_metadata?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Selangor");
  const [postalCode, setPostalCode] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'duitnow' | 'cod'>('stripe');
  const [giftBoxTopup, setGiftBoxTopup] = useState(false);

  // Credit card state
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvc, setCcCvc] = useState("");

  // DuitNow Slip upload mock
  const [uploadedReceipt, setUploadedReceipt] = useState<File | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  // Auto fill details if user logged in
  React.useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.user_metadata?.name || "");
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const giftBoxFee = giftBoxTopup ? 10 : 0;

  // Free shipping threshold at RM 150 (as in legacy cart.html)
  const shippingThreshold = 150;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 10;
  const grandTotal = subtotal + shippingCost + giftBoxFee;
  const gapToFreeShipping = shippingThreshold - subtotal;

  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedReceipt(file);
      setUploadedReceiptUrl(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !postalCode) {
      alert(tx(
        "Please fill in all required delivery details!",
        "请填写所有必填的配送信息哦。"
      ));
      return;
    }

    if (paymentMethod === 'stripe' && (!ccNumber || !ccExpiry || !ccCvc)) {
      alert(tx(
        "Please fill in your credit card details!",
        "请填写完整的信用卡信息！"
      ));
      return;
    }

    setIsPlacing(true);
    // Generate order number CPY-XXXXXX
    const orderNo = "CPY-" + Math.floor(100000 + Math.random() * 900000);

    try {
      // Structure cart items for database storage
      const dbItems = cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price_myr: item.product.price,
        qty: item.quantity,
        size: item.selectedSize
      }));

      // Insert order details to Supabase `orders` table if logged in
      if (supabase && currentUser) {
        const { error } = await supabase.from('orders').insert([{
          order_id: orderNo,
          user_id: currentUser.id,
          user_email: currentUser.email,
          customer_name: fullName,
          customer_phone: phone,
          shipping_address: `${address}, ${postalCode} ${state}, Malaysia`,
          items: dbItems,
          subtotal: subtotal,
          shipping_fee: shippingCost,
          gift_box_fee: giftBoxFee,
          total_price: grandTotal,
          payment_method: paymentMethod,
          special_notes: specialNotes,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

        if (error) {
          console.error("Error inserting order into Supabase:", error);
        } else {
          // Calculate and update client reward points (5% cashback / spent) in Supabase
          const earnedPoints = Math.floor(grandTotal);
          const { data: profile } = await supabase
            .from('profiles')
            .select('points, total_spent')
            .eq('id', currentUser.id)
            .single();

          if (profile) {
            const currentPoints = Number(profile.points || 0);
            const currentSpent = Number(profile.total_spent || 0);
            const nextPoints = currentPoints + earnedPoints;
            const nextSpent = currentSpent + grandTotal;

            // Simple tiering: Silver >= 300, Gold >= 800, Platinum >= 1500
            let nextTier = 'Bronze';
            if (nextSpent >= 1500) nextTier = 'Platinum';
            else if (nextSpent >= 800) nextTier = 'Gold';
            else if (nextSpent >= 300) nextTier = 'Silver';

            await supabase
              .from('profiles')
              .update({
                points: nextPoints,
                total_spent: nextSpent,
                tier: nextTier,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentUser.id);

            // Trigger refresh callback
            onRefreshProfileAndOrders?.();
          }
        }
      }
    } catch (e) {
      console.error("Order insertion failed. Falling back to local confirmation.", e);
    } finally {
      setIsPlacing(false);
      setPlacedOrderNumber(orderNo);
      setIsOrderPlaced(true);
    }
  };

  const handleResetCartAndDrawer = () => {
    onClearCart();
    setIsCheckoutMode(false);
    setIsOrderPlaced(false);
    setFullName("");
    setPhone("");
    setAddress("");
    setPostalCode("");
    setSpecialNotes("");
    setGiftBoxTopup(false);
    setUploadedReceipt(null);
    setUploadedReceiptUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Soft overlay */}
      <div
        className="absolute inset-0 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDFC] shadow-2xl flex flex-col border-l border-pink-100">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/40">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B96A73]" />
              <h2 className="text-lg font-serif font-semibold text-zinc-800">
                {isCheckoutMode ? tx("Secure Checkout · 结账中心", "安全结账 · 收件配送") : tx("Your Shopping Bag · 购物袋", "您的购物袋 · 浪漫邂逅")}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-pink-100/60 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {isOrderPlaced ? (
              /* Success Page */
              <div className="text-center py-8 space-y-5 animate-gentle-bounce">
                <div className="w-20 h-20 bg-pink-100 rounded-full mx-auto flex items-center justify-center border-2 border-pink-200">
                  <Check className="w-10 h-10 text-[#B96A73]" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-zinc-800">
                    {tx("Order Placed Successfully!", "订购下单成功啦！")}
                  </h3>
                  <h4 className="text-sm font-serif text-[#B96A73] font-medium">
                    {tx("Your premium wear is being hand-wrapped with ribbon tags", "大马仙子已将您的衣物打结装箱，并注入柔和香氛")}
                  </h4>
                </div>

                <div className="bg-[#FFF9FB] rounded-2xl p-5 border border-pink-100/50 space-y-3 text-left text-xs text-zinc-600 leading-relaxed">
                  <div className="flex justify-between border-b border-pink-100/30 pb-1.5">
                    <span className="text-zinc-400 uppercase font-mono">{tx("Order Number:", "订单编号:")}</span>
                    <strong className="font-mono text-zinc-800 text-sm">{placedOrderNumber}</strong>
                  </div>
                  <div className="flex justify-between border-b border-pink-100/30 pb-1.5">
                    <span className="text-zinc-400">{tx("Recipient / 收件人:", "收件人:")}</span>
                    <strong className="text-zinc-800">{fullName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-pink-100/30 pb-1.5">
                    <span className="text-zinc-400">{tx("Destination / 配送地址:", "配送地址:")}</span>
                    <strong className="text-zinc-800 truncate max-w-[180px]">{address}, {state}</strong>
                  </div>
                  <div className="flex justify-between border-b border-pink-100/30 pb-1.5">
                    <span className="text-zinc-400">{tx("Payment Method / 支付方式:", "支付方式:")}</span>
                    <strong className="text-zinc-800 uppercase font-mono">{paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">{tx("Total Paid / 实付款项:", "实付款项:")}</span>
                    <strong className="text-[#B96A73] font-mono text-sm">RM {grandTotal}.00</strong>
                  </div>

                  {currentUser && (
                    <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-800 text-center font-medium">
                      ✨ {tx(`You earned ${Math.floor(grandTotal)} member points from this order!`, `本次下单您已成功累积 ${Math.floor(grandTotal)} 会员积分！`)}
                    </div>
                  )}
                  
                  <p className="text-[10px] text-zinc-400 italic text-center pt-2 leading-relaxed">
                    * {tx("Estimated shipping within Malaysia: 2-4 working days (via DHL Express).", "马来西亚本土寄送预估：2-4 个工作日（DHL 快捷交付）。")}
                    <br />
                    {tx("A fairytale box with fine custom ribbons is on its way!", "香气弥漫的蝴蝶结奢华礼盒正在打包中！")}
                  </p>
                </div>

                <button
                  onClick={handleResetCartAndDrawer}
                  className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-sans font-semibold text-xs py-3 rounded-xl transition-all duration-300 cursor-pointer shadow-sm"
                >
                  {tx("Return to Boutique · 漫步回商店", "返回精品商店")}
                </button>
              </div>
            ) : isCheckoutMode ? (
              /* Checkout Form */
              <form onSubmit={handlePlaceOrder} className="space-y-5 text-xs">
                
                {/* Auth Check Info */}
                {!currentUser && (
                  <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100/30 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-bold text-zinc-800 text-[11px] block">{tx("Checking out as Guest", "正在以访客身份结账")}</span>
                      <span className="text-[10px] text-zinc-500 block">{tx("Sign in to accumulate 5% points & cashback", "登录账户可累积 5% 消费积分与返现")}</span>
                    </div>
                  </div>
                )}

                <span className="text-[11px] font-sans text-[#B96A73] font-bold tracking-wider uppercase block border-b border-pink-100 pb-1">
                  {tx("1. Shipping Information", "1. 配送信息")}
                </span>

                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-medium">{tx("Full Name *", "收件人姓名 *")}</label>
                  <input
                    type="text"
                    required
                    placeholder={tx("Enter recipient name", "收件人真实姓名")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-medium">{tx("Phone Number (WhatsApp Active) *", "联系电话 (微信/WhatsApp) *")}</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +6012-345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-medium">{tx("Delivery Address (Line 1) *", "收件详细地址 *")}</label>
                  <textarea
                    required
                    rows={2}
                    placeholder={tx("Unit number, floor, building name, street name", "写字楼/公寓单元号，街道名称")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2 text-zinc-700 focus:outline-none focus:border-pink-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-500 font-medium">{tx("State *", "收件州属 *")}</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300"
                    >
                      {MALAYSIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-zinc-500 font-medium">{tx("Postcode *", "邮政编码 *")}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 50000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-zinc-500 font-medium">{tx("Gift Note (Optional)", "附赠祝福语 (非必填)")}</label>
                  <input
                    type="text"
                    placeholder={tx("Leave a lovely card message inside...", "希望仙子手写卡片祝福，请写在这里...")}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full text-sm font-sans bg-pink-50/10 border border-pink-100 rounded-xl px-3 py-2.5 text-zinc-700 focus:outline-none focus:border-pink-300"
                  />
                </div>

                {/* Payment Selection Block */}
                <span className="text-[11px] font-sans text-[#B96A73] font-bold tracking-wider uppercase block border-b border-pink-100 pt-3 pb-1">
                  {tx("2. Secure Payment", "2. 支付方式")}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]'
                        : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[9px] font-semibold">{tx("Card", "信用卡")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('duitnow')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'duitnow'
                        ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]'
                        : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[9px] font-semibold">{tx("DuitNow", "银行转账")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73]'
                        : 'border-zinc-200 text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-[9px] font-semibold">{tx("COD", "货到付款")}</span>
                  </button>
                </div>

                {/* Sub-form based on payment method */}
                {paymentMethod === 'stripe' && (
                  <div className="p-3 bg-pink-50/10 border border-pink-100 rounded-xl space-y-3 animate-fade-in">
                    <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">{tx("CREDIT / DEBIT CARD DETAIL", "安全卡片输入区域")}</p>
                    <input
                      type="text"
                      placeholder={tx("Card Number (16 digits)", "16 位卡号")}
                      value={ccNumber}
                      onChange={(e) => setCcNumber(e.target.value.replace(/\s+/g, ''))}
                      className="w-full text-xs font-mono bg-white border border-pink-100 rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={ccExpiry}
                        onChange={(e) => setCcExpiry(e.target.value)}
                        className="w-full text-xs font-mono bg-white border border-pink-100 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                      <input
                        type="password"
                        placeholder="CVC"
                        value={ccCvc}
                        onChange={(e) => setCcCvc(e.target.value)}
                        className="w-full text-xs font-mono bg-white border border-pink-100 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'duitnow' && (
                  <div className="p-4 bg-[#FFFBF7] border border-amber-900/10 rounded-xl space-y-3 text-[11px] leading-relaxed text-zinc-600 animate-fade-in">
                    <p className="font-bold text-zinc-800">{tx("Instant Bank Transfer (DuitNow) Details:", "DuitNow 银行快捷转账说明：")}</p>
                    <div className="bg-white/80 p-3 rounded-lg border border-amber-900/5 font-mono space-y-1">
                      <div>{tx("Bank Name: CIMB BANK MALAYSIA", "收款银行：大马联昌银行 (CIMB BANK)")}</div>
                      <div>{tx("Account Name: CIPPY STUDIO ENT", "收款姓名：CIPPY STUDIO ENT")}</div>
                      <div>{tx("Account Number: 8605 9182 3200", "收款账号：8605 9182 3200")}</div>
                    </div>
                    
                    {/* Mock upload field */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono block">{tx("UPLOAD PAYMENT PROOF / TRANSFERRED SLIP *", "请上传转账凭证/水单 *")}</span>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-white border border-pink-200 hover:border-pink-300 rounded-lg px-3 py-1.5 text-[10px] text-zinc-600 font-semibold transition-all">
                          {tx("Browse File", "浏览选择文件")}
                          <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                        </label>
                        <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                          {uploadedReceipt ? uploadedReceipt.name : tx("No file chosen", "未选择任何凭证")}
                        </span>
                      </div>
                      {uploadedReceiptUrl && (
                        <div className="mt-2 w-14 h-18 rounded overflow-hidden border border-zinc-200">
                          <img src={uploadedReceiptUrl} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-500 leading-relaxed animate-fade-in">
                    {tx(
                      "Cash On Delivery (COD) is available for Klang Valley areas only. Surcharges of RM 5 apply upon courier arrival.",
                      "货到付款 (COD) 服务现仅限巴生谷 (Klang Valley) 区域。快递送达时需额外向邮差支付 RM 5 服务费。"
                    )}
                  </div>
                )}

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setIsCheckoutMode(false)}
                  className="w-full text-center text-xs text-[#B96A73] hover:text-[#a55962] font-semibold py-1 cursor-pointer"
                >
                  ← {tx("Edit Shopping Bag / 返回修改购物袋", "返回修改购物袋")}
                </button>
              </form>
            ) : cartItems.length === 0 ? (
              /* Empty state */
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-50 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-pink-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-600 font-serif font-medium text-sm">{tx("Your shopping bag is empty.", "购物袋里空荡荡的")}</p>
                  <p className="text-xs text-zinc-400 font-sans">{tx("Let's add some lovely Korean styles inside!", "大马仙子还没往包里放衣服呢~")}</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-pink-100 hover:bg-pink-200 text-[#B96A73] rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer"
                >
                  {tx("Explore Collections · 漫步商店", "前往漫步挑选")}
                </button>
              </div>
            ) : (
              /* Item list */
              <div className="space-y-4">
                {/* Free shipping progress bar */}
                <div className="bg-pink-50/50 rounded-xl p-3.5 border border-pink-100/50 space-y-2">
                  <div className="flex justify-between text-[11px] font-sans">
                    <span className="text-zinc-600 font-medium">
                      {isFreeShipping
                        ? tx("🎉 Free shipping unlocked in Malaysia!", "🎉 恭喜！西马/东马/新加坡包邮已解锁！")
                        : tx(`RM ${gapToFreeShipping.toFixed(2)} more to unlock FREE shipping!`, `还差 RM ${gapToFreeShipping.toFixed(2)} 即可享受西马/东马/新加坡包邮！`)}
                    </span>
                    <span className="font-mono text-[#B96A73] font-bold">
                      RM {subtotal} / {shippingThreshold}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B96A73] transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / shippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Item List */}
                <div className="space-y-3 divide-y divide-pink-50">
                  {cartItems.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className={`flex items-center gap-4 py-3 ${idx > 0 ? 'border-t border-pink-100/30' : ''}`}
                    >
                      {/* Product Image Thumbnail / Fallback SVG */}
                      <div className="w-14 h-18 rounded-lg overflow-hidden bg-gradient-to-b from-pink-50 to-pink-100 flex items-center justify-center shrink-0 border border-pink-100/40">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          item.product.svgPath && (
                            <svg viewBox="0 0 100 100" fill="none" className="w-9 h-9" style={{ color: item.product.color }}>
                              <path d={item.product.svgPath} fill="currentColor" />
                            </svg>
                          )
                        )}
                      </div>

                      {/* Name & details */}
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <h4 className="text-xs font-sans font-semibold text-zinc-800 truncate leading-tight">
                          {tx(item.product.name, item.product.cnName)}
                        </h4>
                        <p className="text-[10px] font-serif text-[#B96A73] truncate">
                          {tx(item.product.cnName, item.product.name)}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-400">
                          {tx("Size:", "尺码:")} <strong className="text-zinc-700">{item.selectedSize}</strong>
                        </p>
                      </div>

                      {/* Quantity selector & price */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-mono font-bold text-zinc-700">
                          RM {item.product.price * item.quantity}
                        </span>
                        
                        <div className="flex items-center border border-pink-100 rounded-md overflow-hidden bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:bg-pink-50 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono font-semibold text-zinc-700 bg-pink-50/20">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                            className="px-2 py-0.5 text-xs text-zinc-400 hover:bg-pink-50 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          className="text-[10px] text-zinc-400 hover:text-red-400 font-sans mt-0.5 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> {tx("Remove", "移除")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Luxury Gift wrap Top-up Option */}
                <div className="border-t border-pink-100/40 pt-4">
                  <label className="flex items-center gap-3 p-3 bg-pink-50/20 rounded-xl border border-pink-100/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={giftBoxTopup}
                      onChange={(e) => setGiftBoxTopup(e.target.checked)}
                      className="accent-[#B96A73] w-4 h-4 cursor-pointer"
                    />
                    <Gift className="w-4 h-4 text-[#B96A73] shrink-0" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-zinc-800">
                        <span>{tx("Add Luxury Fairytale Wrapping (+ RM 10)", "极奢童话礼盒丝带包装 (+ RM 10)")}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        {tx("Includes velvet perfume-infused papers, hand-braided ribbons and fairy cardboards.", "内含高级定制天鹅绒香氛插卡，烫金礼盒与手工编织蝴蝶结。")}
                      </p>
                    </div>
                  </label>
                </div>

              </div>
            )}
          </div>

          {/* Drawer Footer (Only when not empty and not placed) */}
          {!isOrderPlaced && cartItems.length > 0 && (
            <div className="p-6 border-t border-pink-100 bg-[#FFFDFC] space-y-4 shadow-inner">
              
              {/* Cost calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>{tx("Bag Subtotal / 成衣小计:", "小计:")}</span>
                  <span className="font-mono text-zinc-800">RM {subtotal}.00</span>
                </div>
                {giftBoxTopup && (
                  <div className="flex justify-between text-zinc-500">
                    <span>{tx("Luxury Gift Wrapping / 奢礼包装:", "奢华礼盒:")}</span>
                    <span className="font-mono text-zinc-800">RM 10.00</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>{tx("Malaysian Shipping / 快递配送:", "快递运费:")}</span>
                  <span className="font-mono text-zinc-800">
                    {isFreeShipping ? tx("FREE", "包邮") : `RM ${shippingCost}.00`}
                  </span>
                </div>
                <div className="flex justify-between items-end border-t border-pink-100/50 pt-2 text-sm">
                  <span className="font-serif font-semibold text-zinc-800">{tx("Total Charged / 实付总额:", "实付总额:")}</span>
                  <span className="font-mono text-xl font-bold text-[#B96A73]">RM {grandTotal}.00</span>
                </div>
              </div>

              {/* Action buttons */}
              {isCheckoutMode ? (
                <button
                  type="submit"
                  disabled={isPlacing}
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-sans font-semibold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isPlacing ? tx("Placing Order...", "正在提交订单...") : tx("Place Storybook Order", "确认订购")}
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckoutMode(true)}
                  className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-sans font-semibold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span>{tx("Proceed to Delivery · 填写地址", "前往结算中心 · 填写地址")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <p className="text-[10px] text-zinc-400 text-center leading-normal">
                {tx("Secure SSL checkout with Cippy. Safe transit and perfect presentation.", "Cippy 极速交付保障。香水防撞防褶皱双层保护寄送。")}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
