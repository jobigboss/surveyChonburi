// api/servey/upload

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return new Response(JSON.stringify({ error: "Missing filename or contentType" }), { status: 400 });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    // เปลี่ยนที่นี่เพื่อบังคับให้อัพลงในโฟลเดอร์ img-store/
    const key = `img-store/${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });

    return new Response(JSON.stringify({ url, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in presign API:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
