import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let clientInstance: S3Client | null = null;

function getR2Client(): S3Client {
  if (!clientInstance) {
    clientInstance = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY || '',
        secretAccessKey: process.env.R2_SECRET_KEY || '',
      },
    });
  }
  return clientInstance;
}

const BUCKET = process.env.R2_BUCKET || 'cms-assets';
const PUBLIC_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://geralddagher.com';

export async function uploadAsset(file: Buffer, key: string, contentType: string) {
  const client = getR2Client();
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));
  return `/api/assets/${key}`;
}

export async function deleteAsset(key: string) {
  const client = getR2Client();
  await client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

export async function listAssets(prefix?: string) {
  const client = getR2Client();
  const response = await client.send(new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  }));
  return response.Contents || [];
}

export async function getAssetUrl(key: string) {
  return `/api/assets/${key}`;
}

export function getPublicAssetUrl(filename: string) {
  return `/api/assets/${filename}`;
}
