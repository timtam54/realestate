import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { requireCsrf } from '@/lib/auth/csrf'

// Zod schema for comparables input validation
// Only allow URLs from specific trusted domains for security
const comparablesSchema = z.object({
  url: z.string().url().refine(
    (url) => {
      const hostname = new URL(url).hostname
      return ['homely.com.au', 'www.homely.com.au', 'domain.com.au', 'www.domain.com.au', 'realestate.com.au', 'www.realestate.com.au'].includes(hostname)
    },
    { message: 'URL must be from homely.com.au, domain.com.au, or realestate.com.au' }
  ).optional(),
  suburb: z.string().min(2).max(100).regex(/^[a-zA-Z\s-]+$/, 'Suburb must contain only letters, spaces, and hyphens').optional(),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits').optional()
}).refine(data => data.url || data.suburb || data.postcode, {
  message: 'Either url, suburb, or postcode must be provided'
})

export interface ComparableProperty {
  id: string
  type: 'House' | 'Apartment' | 'Townhouse' | 'Unit' | 'Land' | 'Unknown'
  address: string
  suburb: string
  bedrooms: number | null
  bathrooms: number | null
  carSpaces: number | null
  landArea: string | null
  buildingArea: string | null
  price: string
  priceNumeric: number | null
  source: string
  url?: string
  soldDate?: string
}

export async function POST(request: NextRequest) {
  // Validate CSRF token
  const csrfResult = await requireCsrf(request)
  if (!csrfResult.valid) {
    return NextResponse.json({ error: csrfResult.error }, { status: 403 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Validate input with Zod
  const parseResult = comparablesSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parseResult.error.flatten() },
      { status: 400 }
    )
  }

  const { url, suburb, postcode } = parseResult.data

  try {
    if (url) {
      // Attempt to scrape from a provided URL
      const properties = await scrapeFromUrl(url)
      return NextResponse.json({ properties, source: 'scraped' })
    }

    if (suburb || postcode) {
      // Try to find comparable properties from Homely
      const properties = await findComparables(suburb, postcode)
      return NextResponse.json({ properties, source: 'search' })
    }

    return NextResponse.json(
      { error: 'Please provide either a URL to scrape or suburb/postcode to search' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Web scraping error:', error)
    return NextResponse.json(
      { error: 'Web scraping error: No comparable properties found', details: String(error) },
      { status: 500 }
    )
  }
}

async function scrapeFromUrl(url: string): Promise<ComparableProperty[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()

    // Check if this is a Homely URL
    if (url.includes('homely.com.au')) {
      return scrapeHomely(html, url)
    }

    // Check if this is a Domain URL
    if (url.includes('domain.com.au')) {
      return scrapeDomain(html, url)
    }

    // Check if this is a realestate.com.au URL
    if (url.includes('realestate.com.au')) {
      return scrapeRealestateComAu(html, url)
    }

    // Generic scraping as fallback
    return scrapeGeneric(html, url)
  } catch (error) {
    console.error('Error scraping URL:', error)
    throw new Error(`Failed to scrape URL: ${error}`)
  }
}

// Scrape Homely.com.au - uses Next.js __NEXT_DATA__ embedded in page
function scrapeHomely(html: string, sourceUrl: string): ComparableProperty[] {
  const properties: ComparableProperty[] = []
  const $ = cheerio.load(html)

  // Homely uses Next.js with data in __NEXT_DATA__ script tag
  const nextDataScript = $('script#__NEXT_DATA__').html()

  if (nextDataScript) {
    try {
      const nextData = JSON.parse(nextDataScript)
      const ssrData = nextData?.props?.pageProps?.ssrData

      if (ssrData?.listings && Array.isArray(ssrData.listings)) {
        for (const listing of ssrData.listings) {
          const prop = parseHomelyNextListing(listing)
          if (prop) {
            properties.push({ ...prop, source: 'homely.com.au' })
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse Homely Next.js data:', e)
    }
  }

  // If no properties found from __NEXT_DATA__, try other script tags
  if (properties.length === 0) {
    $('script').each((_, script) => {
      const content = $(script).html() || ''

      // Try to find Apollo state
      if (content.includes('__APOLLO_STATE__')) {
        const match = content.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});?\s*(?:window\.|<\/script>|$)/)
        if (match) {
          try {
            const apolloData = JSON.parse(match[1])
            const listings = extractHomelyListings(apolloData)
            properties.push(...listings.map(listing => ({
              ...listing,
              source: 'homely.com.au',
            })))
          } catch (e) {
            console.error('Failed to parse Apollo state:', e)
          }
        }
      }
    })
  }

  // If still no JSON data found, try HTML parsing
  if (properties.length === 0) {
    $('[data-testid="property-card"], .property-card, [class*="ListingCard"], [class*="PropertyCard"]').each((_, el) => {
      const $el = $(el)
      const property = extractHomelyCard($, $el, sourceUrl)
      if (property) {
        properties.push(property)
      }
    })
  }

  return properties
}

// Parse a listing from Homely's Next.js __NEXT_DATA__ format
function parseHomelyNextListing(listing: Record<string, unknown>): Omit<ComparableProperty, 'source'> | null {
  try {
    const address = listing.address as Record<string, unknown> | undefined
    const features = listing.features as Record<string, unknown> | undefined
    const saleDetails = listing.saleDetails as Record<string, unknown> | undefined
    const landFeatures = listing.landFeatures as Record<string, unknown> | undefined
    const statusLabels = listing.statusLabels as Record<string, unknown> | undefined
    const priceDetails = listing.priceDetails as Record<string, unknown> | undefined

    // Get address
    let fullAddress = ''
    if (address) {
      fullAddress = (address.longAddress as string) ||
                    (address.streetAddress as string) || ''
    }

    if (!fullAddress) return null

    // Get price - check multiple sources
    let price = 'Contact Agent'
    let priceNumeric: number | null = null

    // First try priceDetails
    if (priceDetails) {
      price = (priceDetails.longDescription as string) ||
              (priceDetails.shortDescription as string) || price
    }

    // Then try saleDetails.soldDetails for sold properties
    if (saleDetails?.soldDetails) {
      const soldDetails = saleDetails.soldDetails as Record<string, unknown>
      const displayPrice = soldDetails.displayPrice as Record<string, unknown> | undefined
      if (displayPrice) {
        price = (displayPrice.longDescription as string) ||
                (displayPrice.shortDescription as string) || price
      }
    }

    priceNumeric = extractNumericPrice(price)

    // Get property type from statusLabels
    let propertyType: ComparableProperty['type'] = 'Unknown'
    if (statusLabels?.propertyTypeDescription) {
      propertyType = determinePropertyType(statusLabels.propertyTypeDescription as string)
    }

    // Get features
    const bedrooms = (features?.bedrooms as number) ?? null
    const bathrooms = (features?.bathrooms as number) ?? null
    const carSpaces = (features?.cars as number) ?? null

    // Get area
    let landArea: string | null = null
    if (landFeatures) {
      const area = landFeatures.areaSqm || landFeatures.landSize
      if (area) {
        landArea = `${area} sqm`
      }
    }

    // Get sold date
    let soldDate: string | undefined
    if (saleDetails?.soldDetails) {
      const soldDetails = saleDetails.soldDetails as Record<string, unknown>
      if (soldDetails.soldOn) {
        const date = new Date(soldDetails.soldOn as string)
        soldDate = date.toLocaleDateString('en-AU')
      }
    }

    // Get URL
    const listingUrl = listing.canonicalUri
      ? `https://www.homely.com.au${listing.canonicalUri}`
      : listing.uri
        ? `https://www.homely.com.au/homes/${listing.uri}/${listing.id}`
        : undefined

    return {
      id: `homely-${listing.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: propertyType,
      address: fullAddress,
      suburb: extractSuburbFromAddress(fullAddress),
      bedrooms,
      bathrooms,
      carSpaces,
      landArea,
      buildingArea: null,
      price,
      priceNumeric,
      url: listingUrl,
      soldDate,
    }
  } catch (error) {
    console.error('Error parsing Homely Next listing:', error)
    return null
  }
}

function extractSuburbFromAddress(address: string): string {
  // Australian address format: "123 Street Name, Suburb STATE POSTCODE"
  const parts = address.split(',')
  if (parts.length >= 2) {
    // Get the suburb part (after street, before or with state/postcode)
    const suburbPart = parts[1].trim()
    // Remove state and postcode
    return suburbPart
      .replace(/\b(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\b/gi, '')
      .replace(/\d{4}/, '')
      .trim()
  }
  return ''
}

// Extract listings from Homely's Apollo state
function extractHomelyListings(data: Record<string, unknown>): Omit<ComparableProperty, 'source'>[] {
  const properties: Omit<ComparableProperty, 'source'>[] = []

  // Homely stores listings in different ways - try multiple approaches

  // Method 1: Direct ssrData.listings
  const ssrData = (data as Record<string, unknown>).ssrData as Record<string, unknown> | undefined
  if (ssrData?.listings && Array.isArray(ssrData.listings)) {
    for (const listing of ssrData.listings) {
      const prop = parseHomelyListing(listing as Record<string, unknown>)
      if (prop) properties.push(prop)
    }
  }

  // Method 2: Look through all keys for listing objects
  for (const key of Object.keys(data)) {
    const value = data[key]
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>
      // Check if this looks like a listing
      if (obj.address && (obj.features || obj.saleDetails)) {
        const prop = parseHomelyListing(obj)
        if (prop) properties.push(prop)
      }

      // Check for nested listings array
      if (obj.listings && Array.isArray(obj.listings)) {
        for (const listing of obj.listings) {
          const prop = parseHomelyListing(listing as Record<string, unknown>)
          if (prop) properties.push(prop)
        }
      }
    }
  }

  // Method 3: Search for Listing: keys (Apollo cache format)
  for (const key of Object.keys(data)) {
    if (key.startsWith('Listing:') || key.startsWith('Property:')) {
      const listing = data[key] as Record<string, unknown>
      const prop = parseHomelyListing(listing)
      if (prop) properties.push(prop)
    }
  }

  return properties
}

function parseHomelyListing(listing: Record<string, unknown>): Omit<ComparableProperty, 'source'> | null {
  try {
    const address = listing.address as Record<string, unknown> | undefined
    const features = listing.features as Record<string, unknown> | undefined
    const saleDetails = listing.saleDetails as Record<string, unknown> | undefined
    const landFeatures = listing.landFeatures as Record<string, unknown> | undefined
    const statusLabels = listing.statusLabels as Record<string, unknown> | undefined

    // Get address
    let fullAddress = ''
    if (address) {
      fullAddress = (address.longAddress as string) ||
                    (address.streetAddress as string) ||
                    (address.displayAddress as string) || ''
    }

    if (!fullAddress) return null

    // Get price
    let price = 'Contact Agent'
    let priceNumeric: number | null = null

    if (saleDetails) {
      const soldDetails = saleDetails.soldDetails as Record<string, unknown> | undefined
      if (soldDetails) {
        const displayPrice = soldDetails.displayPrice as Record<string, unknown> | undefined
        if (displayPrice) {
          price = (displayPrice.longDescription as string) ||
                  (displayPrice.shortDescription as string) || price
        }
        priceNumeric = (soldDetails.price as number) || null
      }
    }

    // Extract numeric price if not already set
    if (!priceNumeric && price) {
      priceNumeric = extractNumericPrice(price)
    }

    // Get property type
    let propertyType: ComparableProperty['type'] = 'Unknown'
    if (statusLabels?.propertyTypeDescription) {
      propertyType = determinePropertyType(statusLabels.propertyTypeDescription as string)
    } else if (listing.propertyType) {
      propertyType = determinePropertyType(listing.propertyType as string)
    }

    // Get features
    const bedrooms = features?.bedrooms as number | null ?? null
    const bathrooms = features?.bathrooms as number | null ?? null
    const carSpaces = features?.cars as number | null ?? features?.carSpaces as number | null ?? null

    // Get area
    let landArea: string | null = null
    if (landFeatures?.areaSqm) {
      landArea = `${landFeatures.areaSqm} sqm`
    } else if (listing.landSize) {
      landArea = `${listing.landSize} sqm`
    }

    // Get sold date
    let soldDate: string | undefined
    if (saleDetails) {
      const soldDetails = saleDetails.soldDetails as Record<string, unknown> | undefined
      if (soldDetails?.soldOn) {
        soldDate = soldDetails.soldOn as string
      }
    }

    // Extract suburb from address
    const suburb = address?.suburb as string || extractSuburb(fullAddress)

    return {
      id: `homely-${listing.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: propertyType,
      address: fullAddress,
      suburb,
      bedrooms,
      bathrooms,
      carSpaces,
      landArea,
      buildingArea: null,
      price,
      priceNumeric,
      url: listing.url as string || listing.href as string || undefined,
      soldDate,
    }
  } catch (error) {
    console.error('Error parsing Homely listing:', error)
    return null
  }
}

function extractHomelyCard($: cheerio.CheerioAPI, $el: cheerio.Cheerio<cheerio.Element>, sourceUrl: string): ComparableProperty | null {
  try {
    const address = $el.find('[class*="address"], [class*="Address"]').first().text().trim()
    if (!address) return null

    const priceText = $el.find('[class*="price"], [class*="Price"]').first().text().trim()
    const beds = $el.find('[class*="bed"], [class*="Bed"]').first().text()
    const baths = $el.find('[class*="bath"], [class*="Bath"]').first().text()
    const cars = $el.find('[class*="car"], [class*="Car"]').first().text()
    const typeText = $el.find('[class*="type"], [class*="Type"]').first().text()

    return {
      id: `homely-card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: determinePropertyType(typeText),
      address,
      suburb: extractSuburb(address),
      bedrooms: extractNumber(beds),
      bathrooms: extractNumber(baths),
      carSpaces: extractNumber(cars),
      landArea: null,
      buildingArea: null,
      price: priceText || 'Contact Agent',
      priceNumeric: extractNumericPrice(priceText),
      source: 'homely.com.au',
      url: $el.find('a').first().attr('href') || undefined,
    }
  } catch {
    return null
  }
}

// Scrape Domain.com.au
function scrapeDomain(html: string, sourceUrl: string): ComparableProperty[] {
  const properties: ComparableProperty[] = []
  const $ = cheerio.load(html)

  // Domain uses Next.js - look for __NEXT_DATA__
  $('script#__NEXT_DATA__').each((_, script) => {
    try {
      const content = $(script).html()
      if (content) {
        const data = JSON.parse(content)
        const listings = data?.props?.pageProps?.listingsMap ||
                        data?.props?.pageProps?.listings ||
                        []

        for (const listing of Object.values(listings) as Record<string, unknown>[]) {
          const prop = parseDomainListing(listing)
          if (prop) {
            properties.push({ ...prop, source: 'domain.com.au' })
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse Domain data:', e)
    }
  })

  // Fallback to HTML parsing
  if (properties.length === 0) {
    $('[data-testid="listing-card"]').each((_, el) => {
      const $el = $(el)
      const address = $el.find('[data-testid="listing-card-address"]').text().trim()
      const price = $el.find('[data-testid="listing-card-price"]').text().trim()
      const features = $el.find('[data-testid="property-features"]').text()

      if (address) {
        properties.push({
          id: `domain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Unknown',
          address,
          suburb: extractSuburb(address),
          bedrooms: extractNumber(features),
          bathrooms: null,
          carSpaces: null,
          landArea: null,
          buildingArea: null,
          price: price || 'Contact Agent',
          priceNumeric: extractNumericPrice(price),
          source: 'domain.com.au',
        })
      }
    })
  }

  return properties
}

function parseDomainListing(listing: Record<string, unknown>): Omit<ComparableProperty, 'source'> | null {
  try {
    const address = listing.address as Record<string, unknown> | undefined
    const price = listing.price as Record<string, unknown> | undefined

    let fullAddress = ''
    if (address) {
      fullAddress = (address.displayAddress as string) ||
                    `${address.street || ''}, ${address.suburb || ''} ${address.postcode || ''}`.trim()
    }

    if (!fullAddress) return null

    const priceText = (price?.displayPrice as string) || 'Contact Agent'

    return {
      id: `domain-${listing.id || Date.now()}`,
      type: determinePropertyType((listing.propertyType as string) || ''),
      address: fullAddress,
      suburb: (address?.suburb as string) || extractSuburb(fullAddress),
      bedrooms: (listing.bedrooms as number) ?? null,
      bathrooms: (listing.bathrooms as number) ?? null,
      carSpaces: (listing.carspaces as number) ?? null,
      landArea: listing.landSize ? `${listing.landSize} sqm` : null,
      buildingArea: listing.buildingSize ? `${listing.buildingSize} sqm` : null,
      price: priceText,
      priceNumeric: extractNumericPrice(priceText),
      url: listing.url as string || undefined,
    }
  } catch {
    return null
  }
}

// Scrape realestate.com.au
function scrapeRealestateComAu(html: string, sourceUrl: string): ComparableProperty[] {
  const properties: ComparableProperty[] = []
  const $ = cheerio.load(html)

  // REA also uses embedded JSON
  $('script').each((_, script) => {
    const content = $(script).html() || ''
    if (content.includes('"listings"') || content.includes('"properties"')) {
      try {
        // Try to extract JSON from various patterns
        const jsonMatch = content.match(/\{[\s\S]*"listings"[\s\S]*\}/) ||
                         content.match(/\{[\s\S]*"properties"[\s\S]*\}/)
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0])
          const listings = data.listings || data.properties || []

          for (const listing of listings) {
            const prop = parseReaListing(listing as Record<string, unknown>)
            if (prop) {
              properties.push({ ...prop, source: 'realestate.com.au' })
            }
          }
        }
      } catch (e) {
        // Continue to next script
      }
    }
  })

  return properties
}

function parseReaListing(listing: Record<string, unknown>): Omit<ComparableProperty, 'source'> | null {
  try {
    const address = (listing.address as string) ||
                    (listing.displayAddress as string) || ''

    if (!address) return null

    const price = (listing.price as string) ||
                  (listing.displayPrice as string) || 'Contact Agent'

    return {
      id: `rea-${listing.id || Date.now()}`,
      type: determinePropertyType((listing.propertyType as string) || ''),
      address,
      suburb: (listing.suburb as string) || extractSuburb(address),
      bedrooms: (listing.bedrooms as number) ?? (listing.beds as number) ?? null,
      bathrooms: (listing.bathrooms as number) ?? (listing.baths as number) ?? null,
      carSpaces: (listing.carspaces as number) ?? (listing.cars as number) ?? null,
      landArea: listing.landSize ? `${listing.landSize}` : null,
      buildingArea: listing.buildingSize ? `${listing.buildingSize}` : null,
      price,
      priceNumeric: extractNumericPrice(price),
      url: listing.url as string || undefined,
    }
  } catch {
    return null
  }
}

// Generic HTML scraping fallback
function scrapeGeneric(html: string, sourceUrl: string): ComparableProperty[] {
  const properties: ComparableProperty[] = []
  const $ = cheerio.load(html)

  // Try common property card selectors
  const propertySelectors = [
    '.property-card',
    '.listing-card',
    '.property-listing',
    '[data-testid="listing-card"]',
    '.search-result',
    '.property-item',
    'article[class*="property"]',
    'div[class*="listing"]',
  ]

  for (const selector of propertySelectors) {
    const cards = $(selector)
    if (cards.length > 0) {
      cards.each((_, element) => {
        const $el = $(element)
        const property = extractGenericPropertyData($, $el, sourceUrl)
        if (property) {
          properties.push(property)
        }
      })
      break
    }
  }

  return properties
}

function extractGenericPropertyData(
  $: cheerio.CheerioAPI,
  $el: cheerio.Cheerio<cheerio.Element>,
  sourceUrl: string
): ComparableProperty | null {
  try {
    const address = $el.find('[class*="address"], .property-address, h2, h3, .title').first().text().trim()
    if (!address) return null

    const priceText = $el.find('[class*="price"], .property-price, .listing-price').first().text().trim()
    const bedroomsText = $el.find('[class*="bed"], [data-testid*="bed"], .beds').first().text()
    const bathroomsText = $el.find('[class*="bath"], [data-testid*="bath"], .baths').first().text()
    const carText = $el.find('[class*="car"], [data-testid*="car"], .cars, .parking').first().text()
    const areaText = $el.find('[class*="area"], [class*="size"], [class*="sqm"]').first().text()
    const typeText = $el.find('[class*="type"], .property-type').first().text().toLowerCase()

    return {
      id: `scraped-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: determinePropertyType(typeText || address),
      address,
      suburb: extractSuburb(address),
      bedrooms: extractNumber(bedroomsText),
      bathrooms: extractNumber(bathroomsText),
      carSpaces: extractNumber(carText),
      landArea: areaText || null,
      buildingArea: null,
      price: priceText || 'Contact Agent',
      priceNumeric: extractNumericPrice(priceText),
      source: new URL(sourceUrl).hostname,
      url: $el.find('a').first().attr('href') || undefined,
    }
  } catch {
    return null
  }
}

async function findComparables(suburb?: string, postcode?: string): Promise<ComparableProperty[]> {
  // Try to fetch from Homely directly
  if (suburb || postcode) {
    const searchTerm = suburb?.toLowerCase().replace(/\s+/g, '-') || postcode
    const state = 'qld' // Default to QLD, could be made dynamic
    const url = `https://www.homely.com.au/sold-properties/${searchTerm}-${state}-${postcode || ''}`

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-AU,en;q=0.9',
        },
      })

      if (response.ok) {
        const html = await response.text()
        const properties = scrapeHomely(html, url)
        if (properties.length > 0) {
          return properties
        }
      }
    } catch (e) {
      console.error('Error fetching from Homely:', e)
    }
  }

  // Return empty if no results found
  return []
}

function extractNumber(text: string): number | null {
  const match = text.match(/\d+/)
  return match ? parseInt(match[0]) : null
}

function extractNumericPrice(priceText: string): number | null {
  if (!priceText) return null

  // Remove currency symbols, commas, and common text
  let cleaned = priceText
    .replace(/[$,\s]/g, '')
    .replace(/sold/gi, '')
    .replace(/price/gi, '')
    .toLowerCase()
    .trim()

  // Handle various formats: 850000, 850k, 1.2m, etc.
  if (cleaned.endsWith('m')) {
    const num = parseFloat(cleaned.slice(0, -1))
    return isNaN(num) ? null : num * 1000000
  }
  if (cleaned.endsWith('k')) {
    const num = parseFloat(cleaned.slice(0, -1))
    return isNaN(num) ? null : num * 1000
  }

  // Extract first number sequence
  const numMatch = cleaned.match(/(\d+\.?\d*)/)
  if (numMatch) {
    const num = parseFloat(numMatch[1])
    // If number is small (< 10000), it might be in thousands
    if (num < 10000 && num > 100) {
      return num * 1000
    }
    return isNaN(num) ? null : num
  }

  return null
}

function determinePropertyType(text: string): ComparableProperty['type'] {
  const lower = (text || '').toLowerCase()
  if (lower.includes('house') || lower.includes('home')) return 'House'
  if (lower.includes('apartment') || lower.includes('apt')) return 'Apartment'
  if (lower.includes('townhouse') || lower.includes('town house')) return 'Townhouse'
  if (lower.includes('unit') || lower.includes('flat')) return 'Unit'
  if (lower.includes('land') || lower.includes('block') || lower.includes('vacant')) return 'Land'
  return 'Unknown'
}

function extractSuburb(address: string): string {
  // Try to extract suburb from address (assumes Australian format)
  const parts = address.split(',').map(p => p.trim())
  if (parts.length > 1) {
    // Last part usually contains suburb + state + postcode
    const lastPart = parts[parts.length - 1]
    // Remove postcode and state
    return lastPart.replace(/\d{4}/, '').replace(/\b(NSW|VIC|QLD|WA|SA|TAS|NT|ACT)\b/gi, '').trim()
  }
  return ''
}
