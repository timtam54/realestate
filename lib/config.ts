// Configuration for client-side environment variables
// These values are embedded at build time by Next.js

export const config = {
  azure: {
    blobSasToken: process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN || '',
    blobSasUrlBase: process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || '',
    blobContainer: process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || '',
  },
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API || '',
  },
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  }
}

// Helper function to build Azure Blob URLs
export function getAzureBlobUrl(filename: string): string {
  const { blobSasUrlBase, blobContainer, blobSasToken } = config.azure
  
  if (!blobSasUrlBase || !blobContainer || !blobSasToken) {
    console.error('Azure Blob configuration is missing')
    return ''
  }
  
  return `${blobSasUrlBase}/${blobContainer}/${filename}?${blobSasToken}`
}