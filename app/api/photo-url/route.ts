import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photobloburl = searchParams.get('url')

  if (!photobloburl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_AZUREBLOB_SASURL_BASE || 'https://buyselstore.blob.core.windows.net'
  const sasToken = process.env.NEXT_PUBLIC_AZUREBLOB_SASTOKEN || ''
  const containerName = process.env.NEXT_PUBLIC_AZUREBLOB_CONTAINER || 'photosdocs'

  if (!sasToken) {
    return NextResponse.json({ error: 'SAS token not configured' }, { status: 500 })
  }

  const fullUrl = `${baseUrl}/${containerName}/${photobloburl}?${sasToken}`

  return NextResponse.json({ url: fullUrl })
}
