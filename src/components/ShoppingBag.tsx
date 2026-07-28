import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Trash2, ArrowRight, Gift } from 'lucide-react';

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
  giftBoxTopup: boolean;
  onToggleGiftBoxTopup: (checked: boolean) => void;
  onProceedToCheckout: () => void;
}

export default function ShoppingBagDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  lang,
  giftBoxTopup,
  onToggleGiftBoxTopup,
  onProceedToCheckout
}: ShoppingBagProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // Free shipping threshold at RM 150 (as in legacy cart.html)
  const shippingThreshold = 150;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingCost = isFreeShipping ? 0 : 10;
  const giftBoxFee = giftBoxTopup ? 10 : 0;
  const grandTotal = subtotal + shippingCost + giftBoxFee;
  const gapToFreeShipping = shippingThreshold - subtotal;

  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);

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
                {tx("Your Shopping Bag · 购物袋", "您的购物袋 · 浪漫邂逅")}
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

            {cartItems.length === 0 ? (
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
                      onChange={(e) => onToggleGiftBoxTopup(e.target.checked)}
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

          {/* Drawer Footer (Only when not empty) */}
          {cartItems.length > 0 && (
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
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#B96A73] hover:bg-[#a55962] text-white font-sans font-semibold text-xs py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{tx("Proceed to Secure Checkout", "前往安全结账")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

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
