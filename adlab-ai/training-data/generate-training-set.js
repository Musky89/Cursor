const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const OUTPUT_DIR = path.join(__dirname, "images");

const TRIGGER_WORD = "RAZZBUZZ_AD";

const trainingPrompts = [
  // --- PEPSI-STYLE: High energy, neon, youth culture ---
  {
    filename: "pepsi_hero_01",
    prompt: `A premium beverage advertisement photograph in the style of ${TRIGGER_WORD}. A bold magenta raspberry drink can center-frame with dramatic condensation droplets, electric blue neon rim lighting, liquid splash frozen mid-air behind the can. Two young Black South African women in trendy streetwear dancing in the background with motion blur. Graffiti wall behind them in hot pink and cyan. Text overlay reading "RAZZBUZZ" in bold condensed sans-serif. Shot on Hasselblad, 8K, commercial product photography. Vivid, high-contrast, energetic.`,
  },
  {
    filename: "pepsi_hero_02",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Close-up macro product shot of a magenta RazzBuzz can at 45-degree angle, extreme detail on condensation beads and metallic surface. Fresh raspberries exploding outward from the can in a dynamic burst. Dark background with electric blue and magenta gradient. Studio lighting with strong rim light. "RASPBERRY RUSH" in bold graffiti-style typography. Professional commercial photography, Hasselblad H6D quality.`,
  },
  {
    filename: "pepsi_lifestyle_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Wide shot of a South African university campus quad at golden hour. Group of five diverse Gen-Z students sitting on steps, laughing, one holding up a magenta RazzBuzz can. Natural candid energy. Warm backlight creating rim lighting on subjects. Campus buildings in soft focus background. Brand text "YOUR MOMENT. YOUR RUSH." in clean white sans-serif overlay. Cinematic 2.39:1 aspect feel, shot on RED V-RAPTOR.`,
  },
  {
    filename: "pepsi_street_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. South African township spaza shop exterior at dusk. Warm tungsten light spilling from the shop. A young man in a bucket hat buying a magenta RazzBuzz can from the counter. Colorful hand-painted signage on the shop. Street scene feels authentic and vibrant. Product prominently visible. "R19.99" price tag. Shot in documentary photography style with cinematic color grade.`,
  },
  {
    filename: "pepsi_event_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Amapiano music event at night, outdoor stage with LED screens showing magenta and blue visuals. Crowd of young South Africans dancing, one person in foreground holding a RazzBuzz can up triumphantly. Neon magenta spotlights cutting through haze. Energy and movement everywhere. Brand logo "RAZZBUZZ" on the LED screen. Concert photography style, high ISO grain, dynamic composition.`,
  },

  // --- COKE-STYLE: Warm, authentic, connection ---
  {
    filename: "coke_braai_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Weekend braai scene in a South African backyard. Golden hour sunlight. Friends gathered around a fire, laughing genuinely. Multiple RazzBuzz cans on the table alongside food. One person pouring from a can into a glass with ice. Warm, nostalgic color grade. Shallow depth of field. Film grain texture. Feels like a memory, not an ad. Shot on 35mm Portra 400 film aesthetic.`,
  },
  {
    filename: "coke_friends_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Two young South African women sharing a moment on a park bench at sunset. One handing the other a cold RazzBuzz can. Genuine smiles, natural light, warm golden tones. Bokeh background of trees and distant buildings. Product naturally integrated into the scene. Intimate, authentic feel. No text overlay needed — the image tells the story. Annie Leibovitz portrait style.`,
  },
  {
    filename: "coke_campus_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. University library steps. A young Black South African student taking a study break, leaning back with eyes closed, holding an ice-cold RazzBuzz can against their forehead. Books and laptop beside them. Late afternoon light streaming through trees. Peaceful, relatable moment. The product is the reward after hard work. Warm, natural photography style.`,
  },

  // --- PRODUCT-FOCUSED: Studio shots for versatility ---
  {
    filename: "product_studio_01",
    prompt: `A premium beverage product photograph in the style of ${TRIGGER_WORD}. Single RazzBuzz Raspberry Rush 330ml can, hero shot on a reflective dark surface. Perfect condensation. Fresh raspberries arranged artfully around the base. Clean gradient background transitioning from deep purple to magenta. Triple-point studio lighting. Every detail razor sharp. The can label reads "RAZZBUZZ RASPBERRY RUSH" clearly. Professional commercial product photography, focus-stacked.`,
  },
  {
    filename: "product_studio_02",
    prompt: `A premium beverage product photograph in the style of ${TRIGGER_WORD}. Three RazzBuzz cans arranged in a triangular formation, slightly overlapping. Each can at a different angle showing different parts of the label. Raspberry fruit slices and ice cubes frozen mid-splash between the cans. White background with subtle shadow. Clean, minimal, high-end. Magazine advertisement quality. Shot for print at 300dpi.`,
  },
  {
    filename: "product_pour_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}. Dramatic pour shot. RazzBuzz being poured from the magenta can into a crystal-clear glass filled with ice. The liquid is a beautiful deep raspberry pink. Splash and bubbles captured at 1/8000 shutter speed. Dark moody background with single spotlight. The glass is on a wet slate surface with water droplets. Hyper-detailed commercial beverage photography.`,
  },

  // --- SOCIAL MEDIA FORMAT: TikTok/Reels vertical ---
  {
    filename: "tiktok_vertical_01",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}, vertical 9:16 format for TikTok. A young South African man doing a dance challenge while holding a RazzBuzz can. Colorful mural wall behind him. Action freeze frame mid-move. Bold text overlay: "THE RASPBERRY RUSH CHALLENGE" at top. Product visible and prominent. Neon magenta color cast. Feels like the start of a viral video. Social-first content.`,
  },
  {
    filename: "tiktok_vertical_02",
    prompt: `A premium beverage advertisement in the style of ${TRIGGER_WORD}, vertical 9:16 format for TikTok. Close-up face of a young woman reacting with wide eyes and a huge smile as she tastes RazzBuzz for the first time. The magenta can held up next to her face. Ring light reflected in her eyes. Clean background. Text: "FIRST SIP REACTION 🤯" at top. Authentic, relatable, would stop scrolling. Social media native content.`,
  },

  // --- BILLBOARD / OOH ---
  {
    filename: "billboard_01",
    prompt: `A premium beverage billboard advertisement in the style of ${TRIGGER_WORD}. Ultra-wide 3:1 aspect ratio. Simple, bold composition. Giant RazzBuzz can on the right third, hero product shot with condensation. Left two-thirds: solid magenta background with massive white text "SHARP. LEKKER. RUSH." Three words stacked. Small "R19.99 at your local spaza" at bottom. Clean, punchy, readable at highway speed. Outdoor advertising format.`,
  },
  {
    filename: "billboard_02",
    prompt: `A premium beverage billboard advertisement in the style of ${TRIGGER_WORD}. Ultra-wide format. Split design: left half shows a boring grey desk with a sad warm flat soda, right half explodes with color — a party scene, raspberries flying, RazzBuzz can center of the energy burst. Text bridging both halves: "BEFORE → AFTER" in bold typography. Clean concept, instant understanding, billboard-grade simplicity.`,
  },
];

async function generateImage(prompt, filename) {
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: { responseModalities: ["image", "text"] },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const ext = part.inlineData.mimeType?.includes("png") ? "png" : "jpg";
          const filepath = path.join(OUTPUT_DIR, `${filename}.${ext}`);
          fs.writeFileSync(filepath, Buffer.from(part.inlineData.data, "base64"));
          console.log(`✅ ${filename} — saved (${(part.inlineData.data.length / 1024).toFixed(0)}KB)`);
          return true;
        }
      }
      console.log(`⚠️ ${filename} — no image in response (attempt ${attempt})`);
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("429")) {
        console.log(`⏳ ${filename} — quota limit, waiting 60s (attempt ${attempt})...`);
        await new Promise((r) => setTimeout(r, 60000));
      } else {
        console.log(`❌ ${filename} — error: ${msg.substring(0, 120)} (attempt ${attempt})`);
      }
    }
  }
  return false;
}

async function main() {
  console.log(`Generating ${trainingPrompts.length} training images...\n`);
  let success = 0;
  let failed = 0;

  for (const { filename, prompt } of trainingPrompts) {
    const filepath = path.join(OUTPUT_DIR, `${filename}.png`);
    const jpgpath = path.join(OUTPUT_DIR, `${filename}.jpg`);
    if (fs.existsSync(filepath) || fs.existsSync(jpgpath)) {
      console.log(`⏭️  ${filename} — already exists, skipping`);
      success++;
      continue;
    }

    const ok = await generateImage(prompt, filename);
    if (ok) success++;
    else failed++;

    // Rate limit buffer
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\nDone: ${success} generated, ${failed} failed out of ${trainingPrompts.length} total`);
}

main();
