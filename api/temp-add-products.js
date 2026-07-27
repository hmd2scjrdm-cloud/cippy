import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ilzeziznxzaxxudzhdmu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Service role key not found in env' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const newProducts = [
    {
      name: "Flattering Silhouette | Waist-Fit Crewneck Ribbed Tee - White",
      name_zh: "版型超正圆领T｜修身收腰螺纹短袖 - 白色",
      category: "top",
      price: 15,
      price_myr: 15,
      cost: 5,
      cost_rmb: 8,
      stock: 2,
      in_stock: true,
      is_new: true,
      image_url: "/images/product_ribbed_tee_011.jpg",
      description: "A super flattering waist-fit crewneck ribbed tee in White. Crafted from lightweight, breathable ribbed fabric. Freesize, suitable for 45-50kg.",
      description_zh: "版型超级正的圆领T！白色。螺纹面料，清爽透气。特别添加修身收腰设计。Freesize 均码，适合体重 45-50kg。",
      sku: "011-W",
      series: "Cippy Basic",
      fabric: "螺纹棉混纺",
      clothing_type: "短袖上衣、T恤",
      sizes: ["S", "M"],
      lining: "无内衬",
      stretch: "高弹力",
      transparency: "微透",
      care: "冷水轻柔手洗 / 悬挂晾干"
    },
    {
      name: "Flattering Silhouette | Waist-Fit Crewneck Ribbed Tee - Pink",
      name_zh: "版型超正圆领T｜修身收腰螺纹短袖 - 粉色",
      category: "top",
      price: 15,
      price_myr: 15,
      cost: 5,
      cost_rmb: 8,
      stock: 2,
      in_stock: true,
      is_new: true,
      image_url: "/images/product_ribbed_tee_011.jpg",
      description: "A super flattering waist-fit crewneck ribbed tee in Pink. Crafted from lightweight, breathable ribbed fabric. Freesize, suitable for 45-50kg.",
      description_zh: "版型超级正的圆领T！粉色。螺纹面料，清爽透气。特别添加修身收腰设计。Freesize 均码，适合体重 45-50kg。",
      sku: "011-P",
      series: "Cippy Basic",
      fabric: "螺纹棉混纺",
      clothing_type: "短袖上衣、T恤",
      sizes: ["S", "M"],
      lining: "无内衬",
      stretch: "高弹力",
      transparency: "微透",
      care: "冷水轻柔手洗 / 悬挂晾干"
    },
    {
      name: "Flattering Silhouette | Waist-Fit Crewneck Ribbed Tee - Black",
      name_zh: "版型超正圆领T｜修身收腰螺纹短袖 - 黑色",
      category: "top",
      price: 15,
      price_myr: 15,
      cost: 5,
      cost_rmb: 8,
      stock: 2,
      in_stock: true,
      is_new: true,
      image_url: "/images/product_ribbed_tee_011.jpg",
      description: "A super flattering waist-fit crewneck ribbed tee in Black. Crafted from lightweight, breathable ribbed fabric. Freesize, suitable for 45-50kg.",
      description_zh: "版型超级正的圆领T！黑色。螺纹面料，清爽透气。特别添加修身收腰设计。Freesize 均码，适合体重 45-50kg。",
      sku: "011-B",
      series: "Cippy Basic",
      fabric: "螺纹棉混纺",
      clothing_type: "短袖上衣、T恤",
      sizes: ["S", "M"],
      lining: "无内衬",
      stretch: "高弹力",
      transparency: "微透",
      care: "冷水轻柔手洗 / 悬挂晾干"
    }
  ];

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(newProducts)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, inserted: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
