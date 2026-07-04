import { api } from '../../api/client';

/**
 * Document upload flow skeleton:
 * 1. Ask backend for a pre-signed S3 PUT URL.
 * 2. PUT the file bytes to S3 (wire up expo-image-picker + fetch PUT here).
 * 3. Return the resulting public URL / key to store on the driver.
 *
 * Left as a stub returning the key so the registration screen compiles and the
 * end-to-end shape is clear.
 */
export async function uploadDocument(
  docType: string,
  contentType = 'image/jpeg',
): Promise<string | null> {
  try {
    const { data } = await api.post('/uploads/presign', { docType, contentType });
    // TODO: pick a file and PUT it to data.uploadUrl with the given contentType.
    return data.publicUrl as string;
  } catch {
    return null;
  }
}
