export type OfferStatus =
  | 'pending'    // Awaiting response
  | 'accepted'   // Seller accepted
  | 'rejected'   // Seller rejected
  | 'countered'  // Seller made counter-offer
  | 'withdrawn'  // Buyer withdrew
  | 'expired'    // Offer expired

export type ConditionType =
  | 'finance'           // Subject to finance approval
  | 'building_pest'     // Subject to building & pest inspection
  | 'sale_of_property'  // Subject to sale of buyer's property
  | 'valuation'         // Subject to satisfactory valuation
  | 'solicitor_review'  // Subject to solicitor review
  | 'other'             // Custom condition

export interface OfferConditions {
  finance?: boolean
  financeDays?: number
  buildingPest?: boolean
  buildingPestDays?: number
  saleOfProperty?: boolean
  saleOfPropertyDays?: number
  valuation?: boolean
  valuationDays?: number
  solicitorReview?: boolean
  solicitorReviewDays?: number
  other?: string
}

export interface Offer {
  id: number
  property_id: number
  buyer_id: number
  status: OfferStatus
  offer_amount: number
  deposit_amount: number | null
  settlement_days: number | null
  finance_days: number | null
  inspection_days: number | null
  conditions_json: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  parent_offer_id: number | null
  version: number
}

// For creating a new offer
export interface CreateOfferRequest {
  property_id: number
  buyer_id: number
  status: string
  offer_amount: number
  deposit_amount?: number
  settlement_days?: number
  finance_days?: number
  inspection_days?: number
  conditions_json?: string
  expires_at?: string
  parent_offer_id?: number
  version: number
}

// Standard QLD conditions for the UI
export const QLD_STANDARD_CONDITIONS = [
  {
    key: 'finance',
    label: 'Subject to Finance',
    defaultDays: 14,
    description: 'Subject to buyer obtaining satisfactory finance approval'
  },
  {
    key: 'buildingPest',
    label: 'Building & Pest Inspection',
    defaultDays: 7,
    description: 'Subject to satisfactory building and pest inspection'
  },
  {
    key: 'saleOfProperty',
    label: 'Sale of Buyer\'s Property',
    defaultDays: 30,
    description: 'Subject to the sale of buyer\'s existing property'
  },
  {
    key: 'valuation',
    label: 'Valuation',
    defaultDays: 14,
    description: 'Subject to property valuation meeting or exceeding offer price'
  },
  {
    key: 'solicitorReview',
    label: 'Solicitor Review',
    defaultDays: 5,
    description: 'Subject to satisfactory review by buyer\'s solicitor'
  }
] as const

// Settlement period options
export const SETTLEMENT_OPTIONS = [
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 45, label: '45 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const
