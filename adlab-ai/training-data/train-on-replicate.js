const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error("Set REPLICATE_API_TOKEN environment variable.");
  console.error("Get one at: https://replicate.com/account/api-tokens");
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, "images");
const ZIP_PATH = path.join(__dirname, "training-images.zip");
const TRIGGER_WORD = "RAZZBUZZ_AD";

async function main() {
  // 1. Package images into a ZIP with captions
  console.log("📦 Packaging training images...");

  const images = fs.readdirSync(IMAGES_DIR).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  if (images.length < 5) {
    console.error(`Only ${images.length} images found. Need at least 5. Run generate-training-set.js first.`);
    process.exit(1);
  }

  // Create caption files for each image
  for (const img of images) {
    const name = path.parse(img).name;
    const captionFile = path.join(IMAGES_DIR, `${name}.txt`);
    if (!fs.existsSync(captionFile)) {
      const style = name.includes("pepsi")
        ? "high-energy neon commercial beverage ad"
        : name.includes("coke")
          ? "warm authentic lifestyle beverage ad"
          : name.includes("product")
            ? "studio product photography beverage ad"
            : name.includes("tiktok")
              ? "vertical social media beverage ad"
              : "billboard outdoor beverage ad";
      fs.writeFileSync(captionFile, `${TRIGGER_WORD} ${style}, premium advertising photography, RazzBuzz Raspberry Rush drink`);
    }
  }

  // Create ZIP
  execSync(`cd "${IMAGES_DIR}" && zip -j "${ZIP_PATH}" *.png *.jpg *.jpeg *.webp *.txt 2>/dev/null || true`);
  const zipSize = (fs.statSync(ZIP_PATH).size / 1024 / 1024).toFixed(1);
  console.log(`✅ ZIP created: ${zipSize}MB with ${images.length} images\n`);

  // 2. Upload to Replicate and start training
  console.log("🚀 Starting Flux LoRA training on Replicate...");
  console.log(`   Trigger word: "${TRIGGER_WORD}"`);
  console.log(`   Training images: ${images.length}`);
  console.log(`   Estimated cost: ~$5-10`);
  console.log(`   Estimated time: ~20-30 minutes\n`);

  const zipData = fs.readFileSync(ZIP_PATH);
  const base64Zip = zipData.toString("base64");

  // Create training via Replicate API
  const response = await fetch("https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions", {
    headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
  });
  const versions = await response.json();
  const latestVersion = versions.results?.[0]?.id;

  if (!latestVersion) {
    // Use the training endpoint directly
    console.log("Using Replicate training API...");
  }

  // Create a model destination for the trained LoRA
  const owner = await fetch("https://api.replicate.com/v1/account", {
    headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
  }).then((r) => r.json());

  const username = owner.username;
  console.log(`   Replicate user: ${username}`);

  // First, create the destination model
  const modelName = "razzbuzz-ad-style";
  try {
    await fetch("https://api.replicate.com/v1/models", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        owner: username,
        name: modelName,
        visibility: "private",
        hardware: "gpu-a40-large",
      }),
    });
    console.log(`   Created model: ${username}/${modelName}`);
  } catch {
    console.log(`   Model ${username}/${modelName} may already exist`);
  }

  // Upload ZIP as a file URL using Replicate's file upload API
  const uploadResponse = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/zip",
      "X-Filename": "training-images.zip",
    },
    body: zipData,
  });
  const uploadResult = await uploadResponse.json();
  const fileUrl = uploadResult.urls?.get;
  console.log(`   Uploaded training data: ${fileUrl ? "OK" : "FAILED"}`);

  if (!fileUrl) {
    console.error("Failed to upload training data:", JSON.stringify(uploadResult));
    process.exit(1);
  }

  // Start training
  const trainingResponse = await fetch("https://api.replicate.com/v1/models/ostris/flux-dev-lora-trainer/versions/d995297071a44dcb72244e6c19462111649ec86a9646c02b5ee0837f6c5ec7c6/trainings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination: `${username}/${modelName}`,
      input: {
        input_images: fileUrl,
        trigger_word: TRIGGER_WORD,
        steps: 1000,
        lora_rank: 16,
        optimizer: "adamw8bit",
        batch_size: 1,
        resolution: "512,768,1024",
        autocaption: true,
        autocaption_prefix: TRIGGER_WORD,
        learning_rate: 0.0004,
      },
    }),
  });

  const training = await trainingResponse.json();

  if (training.error) {
    console.error("Training failed to start:", training.error);
    process.exit(1);
  }

  console.log(`\n🎯 Training started!`);
  console.log(`   Training ID: ${training.id}`);
  console.log(`   Status URL: https://replicate.com/p/${training.id}`);
  console.log(`   Model will be at: https://replicate.com/${username}/${modelName}`);
  console.log(`\n⏰ Training takes ~20-30 minutes. Run this to check status:`);
  console.log(`   curl -s -H "Authorization: Bearer $REPLICATE_API_TOKEN" https://api.replicate.com/v1/trainings/${training.id} | python3 -m json.tool`);
  console.log(`\nOnce complete, set this in .env:`);
  console.log(`   REPLICATE_MODEL=${username}/${modelName}`);
  console.log(`   REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}`);

  // Save training info
  fs.writeFileSync(
    path.join(__dirname, "training-info.json"),
    JSON.stringify(
      {
        trainingId: training.id,
        model: `${username}/${modelName}`,
        triggerWord: TRIGGER_WORD,
        startedAt: new Date().toISOString(),
        imageCount: images.length,
      },
      null,
      2,
    ),
  );
}

main().catch(console.error);
