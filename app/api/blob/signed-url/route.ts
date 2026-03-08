import { NextRequest, NextResponse } from 'next/server';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

// Server-side only credentials
const BLOB_ACCOUNT_NAME = process.env.NEXT_PUBLIC_AZUREBLOB_STORAGEACCOUNTNAME;
const BLOB_ACCOUNT_KEY = process.env.AZUREBLOB_ACCOUNTKEY; // Add this to your env
const BLOB_CONTAINER = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINERNAME;

// Input validation
const signedUrlSchema = z.object({
  blobPath: z.string().min(1).max(500).regex(/^[\w\-./]+$/, 'Invalid blob path'),
  expiresInMinutes: z.number().int().min(1).max(60).optional().default(15),
});

export async function POST(request: NextRequest) {
  // Require authentication
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check server-side configuration
  if (!BLOB_ACCOUNT_NAME || !BLOB_ACCOUNT_KEY || !BLOB_CONTAINER) {
    console.error('Blob storage not fully configured for signed URLs');
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate input
  const parseResult = signedUrlSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { blobPath, expiresInMinutes } = parseResult.data;

  try {
    // Create shared key credential
    const sharedKeyCredential = new StorageSharedKeyCredential(
      BLOB_ACCOUNT_NAME,
      BLOB_ACCOUNT_KEY
    );

    // Generate SAS token with short expiry
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.getTime() + expiresInMinutes * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: BLOB_CONTAINER,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('r'), // Read only
        startsOn,
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    const signedUrl = `https://${BLOB_ACCOUNT_NAME}.blob.core.windows.net/${BLOB_CONTAINER}/${blobPath}?${sasToken}`;

    return NextResponse.json({
      success: true,
      url: signedUrl,
      expiresAt: expiresOn.toISOString(),
    });
  } catch (error) {
    console.error('Signed URL generation error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
