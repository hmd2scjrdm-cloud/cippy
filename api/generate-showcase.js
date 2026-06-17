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
    scene: "an elegant flat lay on a clean cream linen surface, surrounded by minimal props like dried flowers and a small ceramic dish, top-down shot",
    style: "minimalist flat lay, natural side lighting, soft shadows, Instagram-worthy composition",
  },
  detail: {
    scene: "an extreme close-up macro shot highlighting the fabric texture, stitching details, and material quality of the item",
    style: "product detail photography, sharp focus, neutral background, luxury feel",
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
            text: `You are a professional fashion product photographer. Analyze this clothing/accessory item and describe it in precise detail for an AI image generation prompt. Include: item type, colors, fabric texture, pattern, cut/silhouette, key design details (collars, buttons, embroidery, etc.), and overall style. Be specific and concise. Output only the product description, no extra commentary.`,
          },
        ],
      }],
    });

    const productDescription = analysis.content[0].text;
    const scene = SCENE_CONFIGS[type];

    // Step 2: Build OpenAI image generation prompt
    const prompt = `High-quality fashion photography: ${productDescription}. Scene: ${scene.scene}. Style: ${scene.style}. Premium Korean fashion brand aesthetic, soft warm lighting, clean and aspirational mood.`;

    // Step 3: Generate showcase image with OpenAI
    const generation = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
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
