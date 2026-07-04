import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

const s3 = new AWS.S3({
  region: env.aws.region,
  accessKeyId: env.aws.accessKeyId || undefined,
  secretAccessKey: env.aws.secretAccessKey || undefined,
});

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

/**
 * Issue a pre-signed PUT URL for a driver document upload. The client PUTs the
 * file directly to S3 and then sends back the returned `key`.
 */
export function createPresignedUpload(
  driverId: string,
  docType: string,
  contentType: string,
): PresignedUpload {
  const key = `drivers/${driverId}/${docType}-${randomUUID()}`;
  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: env.aws.s3Bucket,
    Key: key,
    ContentType: contentType,
    Expires: 60 * 5,
  });
  const publicUrl = `https://${env.aws.s3Bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
  return { uploadUrl, key, publicUrl };
}
