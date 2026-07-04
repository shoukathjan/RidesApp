import { Request, Response } from 'express';
import { createPresignedUpload } from '../../services/s3';
import { badRequest } from '../../utils/http';

/**
 * Issue a pre-signed S3 PUT URL for a driver document. Body: { docType, contentType }.
 * The driver may be registering (no token) or updating (token) — we key by the
 * authenticated driver id when available, else a temp namespace.
 */
export async function presign(req: Request, res: Response) {
  const { docType, contentType } = req.body;
  if (!docType || !contentType) {
    throw badRequest('docType and contentType are required');
  }
  const driverId = req.auth?.sub ?? 'registration';
  res.json(createPresignedUpload(driverId, docType, contentType));
}
