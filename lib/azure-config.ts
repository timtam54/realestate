let sasTokenWarningShown = false

export function getPhotoUrl(photobloburl: string | null): string | null {
  if (!photobloburl) return null
  
  // Use hardcoded values as fallback for production
  const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || 'https://buyselstore.blob.core.windows.net'
  const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || 'photosdocs'
  
  // Check if SAS token is available
  const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN
  
  if (!sasToken) {
    console.error('Azure Blob SAS token not configured. Photo URLs will not work.')
    console.error('Set NEXT_PUBLIC_AZUREBLOB_SASTOKEN in environment variables')
    
    // Show alert only once
    if (!sasTokenWarningShown && typeof window !== 'undefined') {
      sasTokenWarningShown = true
      setTimeout(() => {
        alert('⚠️ Azure Configuration Error\n\nNEXT_PUBLIC_AZUREBLOB_SASTOKEN is not configured.\n\nPhotos will not display. Please check Azure App Service environment variables.')
      }, 1000)
    }
    
    // Return URL without SAS token - will fail but at least shows the issue
    return `${baseUrl}/${containerName}/${photobloburl}`
  }
  
  return `${baseUrl}/${containerName}/${photobloburl}?${sasToken}`
}
