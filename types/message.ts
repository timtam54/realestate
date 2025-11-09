export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  read_at: string|null
  created_at: string|null
  bloburl: string|null
}
