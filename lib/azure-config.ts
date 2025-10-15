export function getPhotoUrl(photobloburl: string | null): string | null {
  if (!photobloburl) return null
  
  const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || 'https://buyselstore.blob.core.windows.net'
  const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN || ''
  const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || 'photosdocs'
  
  if (!sasToken) {
    console.error('Azure Blob SAS token not configured')
    return null
  }
  
  return `${baseUrl}/${containerName}/${photobloburl}?${sasToken}`
}
