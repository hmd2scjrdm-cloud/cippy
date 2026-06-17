import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Scene configs for each showcase type
const SCENE_CONFIGS = {
  tryOn: {
    scene: "a stylish Korean fashion model wearing the item, standing in a minimalist sunlit studio with soft white walls, editorial fashion photography, full body shot",
    style: "Korean fashion editorial, clean background, professional lighting",
  },
  background: {
    scene: "the product displayed in a chic Seoul street café setting, warm afternoon light, bokeh background, lifestyle fashion photography",
    style: "lifestyle editorial, warm tones, aspirational Korean aesthetic",
  },
  flatlay: {
    scene: "a Korean fashion blogger style complete outfit flat lay shot from directly above. The clothing item is the centerpiece, styled with coordinating accessories: a matching small handbag placed to the left, a pair of cute shoes or ballet flats to the right, and optional accessories like leg warmers or hair clips. All items arranged neatly on a warm natural surface — either a light oak wooden floor, a cream linen cloth, or a woven rattan mat. The composition mirrors popular Xiaohongshu (小红书) and Douyin outfit flat lay posts",
    style: "top-down flat lay, Korean fashion blogger aesthetic, warm natural surface, complete outfit set with bag and shoes, soft natural daylight, cozy and aspirational mood, Xiaohongshu style",
  },
  detail: {
    scene: "an extreme close-up macro shot highlighting the fabric texture, stitching details, and material quality of the item",
    style: "product detail photography, sharp focus, neutral background, luxury feel",
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.ANTHROPIC_API_KEY || !process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "API keys not configured in Vercel environment variables" });
  }

  try {
    const { imageBase64, imageUrl, type = "background" } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: "Provide imageBase64 or imageUrl" });
    }
    if (!SCENE_CONFIGS[type]) {
      return res.status(400).json({ error: `type must be one of: ${Object.keys(SCENE_CONFIGS).join(", ")}` });
    }

    // Prepare image for Claude
    const imageSource = imageBase64
      ? { type: "base64", media_type: "image/jpeg", data: imageBase64.replace(/^data:image\/\w+;base64,/, "") }
      : { type: "url", url: imageUrl };

    // Step 1: Claude analyzes the product image
    const analysis = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: imageSource },
          {
            type: "text",
            text: `You are a professional Korean fashion stylist and product photographer. Analyze this clothing/accessory item and describe it precisely for an AI image generation prompt. Include: item type, colors, fabric texture, pattern, cut/silhouette, key design details (collars, buttons, embroidery, etc.), and overall style. Then suggest 2-3 coordinating accessories (bag style, shoe style, optional extras) that would pair well with this item for a complete Korean fashion outfit. Be specific and concise. Output only the product description and styling suggestions, no extra commentary.`,
          },
        ],
      }],
    });

    const productDescription = analysis.content[0].text;
    const scene = SCENE_CONFIGS[type];

    // Step 2: Build edit prompt — instruct AI to keep the product exactly as-is
    const prompt = `Keep the clothing/product EXACTLY as it appears in the original image — do not change its design, color, pattern, cut, or any detail. Only change the setting and composition: ${scene.scene}. Style: ${scene.style}. The product must be pixel-accurate to the original. Premium Korean fashion brand aesthetic.`;

    // Step 3: Edit the actual product image (image-to-image, not text-to-image)
    // Convert base64 to Buffer for OpenAI
    const rawBase64 = (imageBase64 || "").replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(rawBase64, "base64");
    const imageFile = await OpenAI.toFile(imageBuffer, "product.jpg", { type: "image/jpeg" });

    const generation = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const resultImage = generation.data[0];

    return res.status(200).json({
      success: true,
      type,
      productDescription,
      prompt,
      image: {
        url: resultImage.url ?? null,
        base64: resultImage.b64_json ?? null,
      },
    });
  } catch (err) {
    console.error("generate-showcase error:", err);
    return res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
}
