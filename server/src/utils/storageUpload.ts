import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import s3 from "../config/s3";

/**
 * Upload a PDF buffer to S3 (private, no public URL stored).
 * @returns The S3 object key (not a URL).
 */
export const uploadPdfToS3 = async (
  key: string,
  buffer: Buffer,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "application/pdf",
    StorageClass: "STANDARD_IA", // cost-efficient for infrequent downloads
  });

  await s3.send(command);
  return key;
};

/**
 * Generate a pre-signed GET URL for a private S3 object.
 * @param key - S3 object key
 * @param expiresIn - seconds until the URL expires (default: 3600 = 1 hour)
 */
export const getSignedDownloadUrl = async (
  key: string,
  expiresIn = 3600,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  });

  return getSignedUrl(s3, command, { expiresIn });
};
