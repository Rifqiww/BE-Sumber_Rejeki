import { compressAndUpload } from "./src/services/imageOptimization";
import fs from "fs";

async function testUpload() {
  console.log("Starting verification test...");
  const minimalPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  try {
    console.log("Testing compressAndUpload with 1x1 PNG...");
    const result = await compressAndUpload(
      minimalPng,
      "umkm-mamah/test_verification"
    );
    console.log("Verification Success!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  } catch (error) {
    console.error("Verification Failed:", error);
  }
}

testUpload();
