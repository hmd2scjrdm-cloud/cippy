export interface Product {
  id: string;
  name: string;
  cnName: string;
  category: string;
  price: number; // In RM (Malaysian Ringgit)
  sizes: string[];
  description: string;
  cnDescription: string;
  story: string; // The "storybook" fairytale style description
  cnStory: string;
  details: string[];
  cnDetails: string[];
  color: string; // Hex color or Tailwind name
  bgGradient: string; // Tailwind gradient for the product thumbnail backing
  svgPath?: string; // Optional: Beautiful SVG drawing instructions to render the item in high-end vector style
  imageUrl?: string; // Optional: Real image url from database
  detailImages?: string[]; // Optional: Detail images
  images?: string[]; // Optional: Additional slider images
  inStock?: boolean;
  stock?: number;
  series?: string;
  fabric?: string;
  clothingType?: string;
  lining?: string;
  stretch?: string;
  transparency?: string;
  care?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: 'S' | 'M';
  quantity: number;
}

export interface StoryChapter {
  id: number;
  title: string;
  cnTitle: string;
  subtitle: string;
  cnSubtitle: string;
  content: string;
  cnContent: string;
  illustrationType: 'bow' | 'dress' | 'cloud' | 'stars';
}

export interface SizeRecommendation {
  height: number; // in cm
  weight: number; // in kg
  shoulderWidth: number; // in cm
  chestCircumference: number; // in cm
  recommendedSize: 'S' | 'M';
  fitDescription: string;
  cnFitDescription: string;
}
