import sharp from "sharp";

export const compressBase64Image = async (base64String) => {
  try {
    if (!base64String) {
      throw new Error("No image provided");
    }

    // 🔥 safer parsing
    const base64Data = base64String.split(",")[1];

    if (!base64Data) {
      throw new Error("Invalid Base64 format");
    }

    const buffer = Buffer.from(base64Data, "base64");

    // 🔥 HARD CHECK
    if (!Buffer.isBuffer(buffer) || buffer.length < 10) {
      throw new Error("Invalid or corrupted image buffer");
    }

    const compressedBuffer = await sharp(buffer)
      .resize({ width: 800 })
      .toFormat("jpeg", { quality: 60 })
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;

  } catch (err) {
    console.log("🔥 SHARP ERROR:", err.message);
    throw new Error("Image compression failed: corrupted image");
  }
};