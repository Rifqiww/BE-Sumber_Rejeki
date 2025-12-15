import tinify from "tinify";
import cloudinary from "../config/cloudinary";
import dotenv from "dotenv";

dotenv.config();
if (process.env.TINYJPG_API_KEY) {
  tinify.key = process.env.TINYJPG_API_KEY;
} else {
  console.warn("TINYJPG_API_KEY is not set in environment variables");
}

export const compressAndUpload = async (
  buffer: Buffer,
  folder: string = "umkm-mamah/product"
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    // Timeout jika terlalu lama
    console.log("Compressing image with TinyJPG...");

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Compression timeout"));
      }, 20000);
    });

    // Perbandingan antara compress dan timeout
    const compressedBuffer = await Promise.race([
      tinify.fromBuffer(buffer).toBuffer(),
      timeoutPromise,
    ]);

    console.log("Uploading to Cloudinary folder:", folder);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary upload returned undefined result"));
            return;
          }
          console.log("Upload success:", result.secure_url);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      uploadStream.end(compressedBuffer);
    });
  } catch (error) {
    console.error("Image optimization failed:", error);
    throw error;
  }
};
