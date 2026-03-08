import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { getSession } from '@/lib/auth/session';
import { requireCsrf } from '@/lib/auth/csrf';
import { z } from 'zod';

// SAS token should be server-side only (not NEXT_PUBLIC_)
const BLOB_SAS_TOKEN = process.env.AZUREBLOB_SASTOKEN;
const BLOB_ACCOUNT_NAME = process.env.NEXT_PUBLIC_AZUREBLOB_STORAGEACCOUNTNAME;
const BLOB_CONTAINER = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINERNAME;

// Allowed file types for upload
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Input validation schema
const uploadSchema = z.object({
  filename: z.string().min(1).max(255).regex(/^[\w\-. ]+$/, 'Invalid filename'),
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  folder: z.string().regex(/^[a-zA-Z0-9\-_/]+$/).optional(),
});

export async function POST(request: NextRequest) {
  // Validate CSRF token
  const csrfResult = await requireCsrf(request);
  if (!csrfResult.valid) {
    return NextResponse.json({ error: csrfResult.error }, { status: 403 });
  }

  // Require authentication
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check server-side configuration
  if (!BLOB_SAS_TOKEN || !BLOB_ACCOUNT_NAME || !BLOB_CONTAINER) {
    console.error('Blob storage not configured');
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Validate content type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate input
    const parseResult = uploadSchema.safeParse({
      filename: file.name,
      contentType: file.type,
      folder: folder || undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const extension = file.name.split('.').pop() || 'jpg';
    const sanitizedFilename = `${timestamp}-${randomId}.${extension}`;

    // Build blob path
    const blobPath = folder
      ? `${folder}/${sanitizedFilename}`
      : sanitizedFilename;

    // Create blob client
    const blobServiceClient = new BlobServiceClient(
      `https://${BLOB_ACCOUNT_NAME}.blob.core.windows.net?${BLOB_SAS_TOKEN}`
    );
    const containerClient = blobServiceClient.getContainerClient(BLOB_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
      blobHTTPHeaders: {
        blobContentType: file.type,
        blobCacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Return the public URL (without SAS token for read access)
    const publicUrl = `https://${BLOB_ACCOUNT_NAME}.blob.core.windows.net/${BLOB_CONTAINER}/${blobPath}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: sanitizedFilename,
    });
  } catch (error) {
    console.error('Blob upload error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
