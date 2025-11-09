export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  read_at: string
  created_at: string
  bloburl: string
}
