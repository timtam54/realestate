export interface ApiAuditLog {
  id: number
  action: string
  page: string
  username: string
  ipaddress?: string
  dte: string
}
